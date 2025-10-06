/**
 * Advanced Search Service for Carmen de Areco Transparency Portal
 * Provides enhanced search capabilities including faceted filtering, 
 * advanced search options, and document clustering
 */

const SemanticSearchService = require('./semanticSearchService');
const DocumentIndexer = require('./DocumentIndexer');
const { v4: uuidv4 } = require('uuid');

class AdvancedSearchService {
  constructor() {
    this.semanticSearchService = new SemanticSearchService();
    this.documentIndexer = new DocumentIndexer();
    this.facetCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    
    // Ensure document indexer is loaded
    this.ensureDocumentIndexerLoaded();
  }
  
  async ensureDocumentIndexerLoaded() {
    if (!this.documentIndexer.index) {
      try {
        await this.documentIndexer.loadIndex();
      } catch (error) {
        console.error('Error loading document index:', error.message);
      }
    }
  }

  /**
   * Get faceted search filters with counts
   */
  async getFacetFilters(query = '', options = {}) {
    const cacheKey = `facets_${query}_${JSON.stringify(options)}`;
    const cached = this.facetCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Get all documents matching the query
      let documents = Object.values(this.documentIndexer.index?.documents || {});
      
      // Apply query filtering if provided
      if (query) {
        documents = documents.filter(doc => 
          (doc.title && doc.title.toLowerCase().includes(query.toLowerCase())) ||
          (doc.description && doc.description.toLowerCase().includes(query.toLowerCase())) ||
          (doc.content && doc.content.toLowerCase().includes(query.toLowerCase())) ||
          (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );
      }

      // Calculate facet counts
      const facets = {
        categories: {},
        years: {},
        sources: {},
        types: {},
        tags: {}
      };

      documents.forEach(doc => {
        // Category facet
        if (doc.category) {
          facets.categories[doc.category] = (facets.categories[doc.category] || 0) + 1;
        }

        // Year facet
        const year = doc.year || (doc.lastModified ? new Date(doc.lastModified).getFullYear() : 'unknown');
        facets.years[year] = (facets.years[year] || 0) + 1;

        // Source facet
        if (doc.source) {
          facets.sources[doc.source] = (facets.sources[doc.source] || 0) + 1;
        }

        // Type facet
        if (doc.type) {
          facets.types[doc.type] = (facets.types[doc.type] || 0) + 1;
        }

        // Tags facet
        if (doc.tags && Array.isArray(doc.tags)) {
          doc.tags.forEach(tag => {
            if (tag) {
              facets.tags[tag] = (facets.tags[tag] || 0) + 1;
            }
          });
        }
      });

      // Sort facets by count (descending)
      Object.keys(facets).forEach(facetName => {
        const sortedEntries = Object.entries(facets[facetName])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20); // Limit to top 20 for performance
        facets[facetName] = Object.fromEntries(sortedEntries);
      });

      const result = { facets, totalDocuments: documents.length };
      
      this.facetCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error generating facet filters:', error);
      throw error;
    }
  }

  /**
   * Perform advanced search with multiple filters and options
   */
  async advancedSearch(query, options = {}) {
    try {
      // Default options
      const {
        filters = {},
        aggregations = {},
        sortBy = 'relevance',
        sortOrder = 'desc',
        size = 20,
        from = 0,
        highlight = true,
        explain = false
      } = options;

      // If we have semantic search capability, use it
      if (query) {
        return await this.semanticSearchService.semanticSearch(query, {
          filters,
          size,
          from,
          sortBy,
          sortOrder,
          highlight,
          explain
        });
      }

      // Fallback to traditional search if no query provided
      const allDocuments = Object.values(this.documentIndexer.index?.documents || {});
      let results = allDocuments;

      // Apply filters
      if (filters.category) {
        results = results.filter(doc => doc.category === filters.category);
      }

      if (filters.year) {
        results = results.filter(doc => {
          const docYear = doc.year || (doc.lastModified ? new Date(doc.lastModified).getFullYear() : null);
          return docYear == filters.year;
        });
      }

      if (filters.type) {
        results = results.filter(doc => doc.type === filters.type);
      }

      if (filters.source) {
        results = results.filter(doc => doc.source === filters.source);
      }

      if (filters.tags && Array.isArray(filters.tags)) {
        results = results.filter(doc => {
          if (!doc.tags || !Array.isArray(doc.tags)) return false;
          return filters.tags.some(tag => doc.tags.includes(tag));
        });
      }

      // Apply text search if query is provided but we're not using semantic search
      if (query) {
        results = results.filter(doc => 
          (doc.title && doc.title.toLowerCase().includes(query.toLowerCase())) ||
          (doc.description && doc.description.toLowerCase().includes(query.toLowerCase())) ||
          (doc.content && doc.content.toLowerCase().includes(query.toLowerCase())) ||
          (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );
      }

      // Apply sorting
      results.sort((a, b) => {
        let valA, valB;

        switch (sortBy) {
          case 'date':
            valA = new Date(a.lastModified || a.indexedAt);
            valB = new Date(b.lastModified || b.indexedAt);
            break;
          case 'title':
            valA = a.title || '';
            valB = b.title || '';
            break;
          case 'relevance':
          default:
            // If no specific sort order needed, maintain original order
            valA = a.indexedAt || '';
            valB = b.indexedAt || '';
            break;
        }

        if (sortOrder === 'desc') {
          return valB > valA ? 1 : valB < valA ? -1 : 0;
        } else {
          return valA > valB ? 1 : valA < valB ? -1 : 0;
        }
      });

      // Apply pagination
      const paginatedResults = results.slice(from, from + size);

      return {
        results: paginatedResults,
        total: results.length,
        took: Date.now() - Date.now(), // Placeholder for actual timing
        aggregations: aggregations ? this.calculateAggregations(results, aggregations) : undefined,
        aiUsage: {
          method: 'traditional search with advanced filters',
          explained: false
        }
      };
    } catch (error) {
      console.error('Advanced search error:', error);
      throw error;
    }
  }

  /**
   * Calculate aggregations for search results
   */
  calculateAggregations(results, aggregations) {
    const aggResults = {};

    if (aggregations.categories) {
      const categoryMap = {};
      results.forEach(doc => {
        const category = doc.category || 'uncategorized';
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });
      aggResults.categories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([category, count]) => ({ category, count }));
    }

    if (aggregations.years) {
      const yearMap = {};
      results.forEach(doc => {
        const year = doc.year || (doc.lastModified ? new Date(doc.lastModified).getFullYear() : 'unknown');
        yearMap[year] = (yearMap[year] || 0) + 1;
      });
      aggResults.years = Object.entries(yearMap)
        .sort((a, b) => b[0] - a[0]) // Sort years descending
        .map(([year, count]) => ({ year: parseInt(year), count }));
    }

    return aggResults;
  }

  /**
   * Cluster documents based on content similarity
   */
  async clusterDocuments(documents, maxClusters = 5) {
    try {
      if (!documents || documents.length === 0) {
        return { clusters: [], clusteredDocuments: [], totalClusters: 0 };
      }

      // For small sets, use simple clustering. For larger sets, use more sophisticated algorithm
      if (documents.length <= 5) {
        // For small sets, group by category/type if available
        return this.simpleCluster(documents);
      } else {
        // For larger sets, use content-based clustering
        return this.contentBasedCluster(documents, maxClusters);
      }
    } catch (error) {
      console.error('Document clustering error:', error);
      throw error;
    }
  }

  /**
   * Simple clustering for small document sets - group by category/type
   */
  simpleCluster(documents) {
    const clusters = new Map();
    
    documents.forEach(doc => {
      // Use category as cluster key, fallback to type, then to a general cluster
      const clusterKey = doc.category || doc.type || 'miscellaneous';
      
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, {
          id: `cluster_${clusterKey.toLowerCase().replace(/\s+/g, '_')}`,
          name: this.generateClusterName({ category: clusterKey, type: doc.type }),
          documents: []
        });
      }
      
      clusters.get(clusterKey).documents.push(doc);
    });
    
    // Convert map to array and add cluster info to documents
    const clustersArray = Array.from(clusters.values());
    const clusteredDocuments = [];
    
    clustersArray.forEach(cluster => {
      cluster.documents.forEach(doc => {
        clusteredDocuments.push({
          ...doc,
          cluster: {
            id: cluster.id,
            name: cluster.name,
            size: cluster.documents.length
          }
        });
      });
    });
    
    return {
      clusters: clustersArray,
      clusteredDocuments,
      totalClusters: clustersArray.length
    };
  }

  /**
   * Content-based clustering using more sophisticated similarity measures
   */
  async contentBasedCluster(documents, maxClusters = 5) {
    // In a production environment, we would use more sophisticated techniques like:
    // - TF-IDF vectorization
    // - Cosine similarity
    // - K-means clustering
    // - Topic modeling (LDA, etc.)
    
    // For this implementation, we'll use a simplified approach based on keyword overlap
    
    const docTerms = documents.map(doc => ({
      id: doc.id,
      terms: this.extractDocumentTerms(doc),
      originalDoc: doc
    }));
    
    // Calculate similarity matrix between all documents
    const similarities = this.computeSimilarityMatrix(docTerms);
    
    // Perform hierarchical clustering
    return this.hierarchicalCluster(docTerms, similarities, maxClusters);
  }

  /**
   * Extract key terms from document for clustering
   */
  extractDocumentTerms(doc) {
    const terms = new Set();
    
    // Add tags
    if (doc.tags && Array.isArray(doc.tags)) {
      doc.tags.forEach(tag => terms.add(tag.toLowerCase()));
    }
    
    // Add category
    if (doc.category) {
      terms.add(doc.category.toLowerCase());
    }
    
    // Add type
    if (doc.type) {
      terms.add(doc.type.toLowerCase());
    }
    
    // Extract important terms from content
    if (doc.content) {
      // Extract key terms related to transparency/municipal topics
      const content = doc.content.toLowerCase();
      const commonTerms = [
        'presupuesto', 'budget', 'gasto', 'expense', 'contrato', 'contract', 
        'licitacion', 'tender', 'decreto', 'decree', 'ordenanza', 'ordinance', 
        'deuda', 'debt', 'ingreso', 'income', 'municipal', 'carmen', 'areco',
        'recurso', 'resource', 'proyecto', 'project', 'inversion', 'investment',
        'tasa', 'fee', 'impuesto', 'tax', 'empleados', 'employees', 'funcionarios'
      ];
      
      commonTerms.forEach(term => {
        if (content.includes(term)) {
          terms.add(term);
        }
      });
      
      // Extract terms from title as well
      if (doc.title) {
        const title = doc.title.toLowerCase();
        commonTerms.forEach(term => {
          if (title.includes(term)) {
            terms.add(term);
          }
        });
      }
    }
    
    return Array.from(terms);
  }

  /**
   * Compute similarity matrix between documents
   */
  computeSimilarityMatrix(docTerms) {
    const n = docTerms.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          // Calculate Jaccard similarity between term sets
          const termsI = new Set(docTerms[i].terms);
          const termsJ = new Set(docTerms[j].terms);
          
          const intersection = new Set([...termsI].filter(x => termsJ.has(x)));
          const union = new Set([...termsI, ...termsJ]);
          
          const similarity = union.size > 0 ? intersection.size / union.size : 0;
          matrix[i][j] = similarity;
        }
      }
    }
    
    return matrix;
  }

  /**
   * Hierarchical clustering of documents
   */
  hierarchicalCluster(docTerms, similarities, maxClusters) {
    // Initialize each document as its own cluster
    let clusters = docTerms.map((doc, idx) => ({
      id: `cluster_${idx}`,
      name: this.generateClusterName(doc.originalDoc),
      documents: [doc.originalDoc],
      docIndices: [idx],
      representativeTerms: this.extractDocumentTerms(doc.originalDoc)
    }));
    
    // Keep merging until we have the desired number of clusters or 1
    while (clusters.length > maxClusters && clusters.length > 1) {
      let bestI = 0, bestJ = 1;
      let bestSimilarity = -1;
      
      // Find the two clusters with highest similarity
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          // Calculate average similarity between all docs in clusters i and j
          let totalSim = 0;
          let count = 0;
          
          for (const idxI of clusters[i].docIndices) {
            for (const idxJ of clusters[j].docIndices) {
              totalSim += similarities[idxI][idxJ];
              count++;
            }
          }
          
          const avgSim = count > 0 ? totalSim / count : 0;
          
          if (avgSim > bestSimilarity) {
            bestSimilarity = avgSim;
            bestI = i;
            bestJ = j;
          }
        }
      }
      
      // Merge clusters[bestJ] into clusters[bestI]
      const clusterJ = clusters[bestJ];
      const clusterI = clusters[bestI];
      
      // Update clusterI with merged data
      clusterI.documents = [...clusterI.documents, ...clusterJ.documents];
      clusterI.docIndices = [...clusterI.docIndices, ...clusterJ.docIndices];
      
      // Update representative terms for the merged cluster
      const allTerms = new Set([...clusterI.representativeTerms, ...clusterJ.representativeTerms]);
      clusterI.representativeTerms = Array.from(allTerms);
      clusterI.name = this.generateClusterName({
        ...clusterI.documents[0],
        tags: clusterI.representativeTerms.slice(0, 3) // Use top 3 terms as indication
      });
      
      // Remove merged cluster
      clusters.splice(bestJ, 1);
    }
    
    // Add cluster information back to documents
    const clusteredDocuments = [];
    clusters.forEach(cluster => {
      cluster.documents.forEach(doc => {
        clusteredDocuments.push({
          ...doc,
          cluster: {
            id: cluster.id,
            name: cluster.name,
            size: cluster.documents.length
          }
        });
      });
    });
    
    return {
      clusters,
      clusteredDocuments,
      totalClusters: clusters.length
    };
  }

  /**
   * Calculate similarity between document and cluster
   */
  calculateDocumentClusterSimilarity(doc, cluster, clusterTerms) {
    let score = 0;
    
    // Compare tags
    if (doc.tags && clusterTerms.tags) {
      const commonTags = doc.tags.filter(tag => clusterTerms.tags.includes(tag));
      score += (commonTags.length / Math.max(doc.tags.length, clusterTerms.tags.length || 1)) * 0.5;
    }
    
    // Compare categories
    if (doc.category && clusterTerms.category === doc.category) {
      score += 0.3;
    }
    
    // Compare content similarity based on key terms
    if (doc.content && clusterTerms.terms) {
      const docContent = (doc.content || '').toLowerCase();
      const matches = clusterTerms.terms.filter(term => docContent.includes(term.toLowerCase()));
      score += (matches.length / clusterTerms.terms.length) * 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Extract key terms from document for clustering
   */
  extractDocumentTerms(doc) {
    const terms = new Set();
    
    // Add tags
    if (doc.tags) {
      doc.tags.forEach(tag => terms.add(tag));
    }
    
    // Add category
    if (doc.category) {
      terms.add(doc.category);
    }
    
    // Extract important terms from content
    if (doc.content) {
      const content = doc.content.toLowerCase();
      const commonTerms = ['presupuesto', 'gasto', 'contrato', 'licitacion', 'decreto', 'ordenanza', 'deuda', 'ingreso', 'municipal', 'carmen', 'areco'];
      commonTerms.forEach(term => {
        if (content.includes(term)) {
          terms.add(term);
        }
      });
    }
    
    return {
      tags: doc.tags || [],
      category: doc.category,
      terms: Array.from(terms)
    };
  }

  /**
   * Update cluster terms when a new document is added
   */
  updateClusterTerms(clusterTerms, newDoc) {
    if (!clusterTerms || !newDoc) return;
    
    // Add new tags
    if (newDoc.tags) {
      newDoc.tags.forEach(tag => clusterTerms.tags.push(tag));
      // Remove duplicates
      clusterTerms.tags = [...new Set(clusterTerms.tags)];
    }
    
    // Update terms
    if (newDoc.content) {
      const content = newDoc.content.toLowerCase();
      const commonTerms = ['presupuesto', 'gasto', 'contrato', 'licitacion', 'decreto', 'ordenanza', 'deuda', 'ingreso', 'municipal', 'carmen', 'areco'];
      commonTerms.forEach(term => {
        if (content.includes(term) && !clusterTerms.terms.includes(term)) {
          clusterTerms.terms.push(term);
        }
      });
    }
  }

  /**
   * Generate cluster name based on document content
   */
  generateClusterName(doc) {
    if (doc.category) {
      return `${doc.category} Relacionados`;
    }
    
    if (doc.tags && doc.tags.length > 0) {
      return `${doc.tags[0]} y Similares`;
    }
    
    return `Grupo de Documentos ${uuidv4().substring(0, 4)}`;
  }

  /**
   * Get document clusters for search results
   */
  async getDocumentClusters(searchResults) {
    try {
      if (!searchResults || searchResults.length === 0) {
        return { clusters: [], clusteredDocuments: [], totalClusters: 0 };
      }
      
      return await this.clusterDocuments(searchResults);
    } catch (error) {
      console.error('Error getting document clusters:', error);
      return { clusters: [], clusteredDocuments: searchResults, totalClusters: 0 };
    }
  }
}

module.exports = AdvancedSearchService;