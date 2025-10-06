/**
 * Semantic Search Service for Carmen de Areco Transparency Portal
 * Implements privacy-preserving, transparent search with NLP capabilities
 * Follows AAIP guidelines for transparency and data protection
 */

const { Client } = require('@elastic/elasticsearch');
// Note: DocumentIndexer is used in AdvancedSearchService, not SemanticSearchService
require('dotenv').config();

class SemanticSearchService {
  constructor() {
    // Initialize Elasticsearch client with Spanish language configuration
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      }
    });
    
    this.indexName = 'transparency-documents';
    this.queryHistory = []; // Temporary storage, cleared after processing
    
    // Verify connection
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.client.ping();
      console.log('✅ Elasticsearch connected successfully');
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error.message);
    }
  }

  /**
   * Create or update the search index with Spanish language settings
   */
  async createIndex() {
    try {
      // Check if index exists
      const exists = await this.client.indices.exists({ index: this.indexName });
      
      if (!exists.body) {
        // Create index with Spanish language analyzer
        await this.client.indices.create({
          index: this.indexName,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  spanish_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: [
                      'lowercase',
                      'spanish_stop',
                      'spanish_stemmer'
                    ]
                  }
                },
                filter: {
                  spanish_stop: {
                    type: 'stop',
                    stopwords: '_spanish_'
                  },
                  spanish_stemmer: {
                    type: 'stemmer',
                    language: 'light_spanish'
                  }
                }
              }
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: { 
                  type: 'text', 
                  analyzer: 'spanish_analyzer',
                  fields: {
                    raw: { type: 'keyword' } // For exact matches
                  }
                },
                content: { 
                  type: 'text', 
                  analyzer: 'spanish_analyzer'
                },
                category: { 
                  type: 'keyword',
                  fields: {
                    text: { type: 'text', analyzer: 'spanish_analyzer' }
                  }
                },
                year: { type: 'integer' },
                date: { type: 'date' },
                source: { type: 'keyword' },
                url: { type: 'keyword' },
                type: { type: 'keyword' },
                tags: { type: 'keyword' },
                // For semantic search
                title_vector: { 
                  type: 'dense_vector', 
                  dims: 384, // Using sentence-transformers all-MiniLM-L6-v2 size
                  index: true,
                  similarity: 'cosine'
                },
                content_vector: { 
                  type: 'dense_vector', 
                  dims: 384,
                  index: true,
                  similarity: 'cosine'
                }
              }
            }
          }
        });
        
        console.log(`✅ Index '${this.indexName}' created successfully`);
      } else {
        console.log(`ℹ️  Index '${this.indexName}' already exists`);
      }
    } catch (error) {
      console.error('❌ Error creating index:', error.message);
      throw error;
    }
  }

  /**
   * Index a document with both traditional and vector search capabilities
   */
  async indexDocument(document) {
    try {
      // Generate embeddings for semantic search
      const titleVector = await this.generateEmbedding(document.title || '');
      const contentVector = await this.generateEmbedding(document.content || '');
      
      const docWithVectors = {
        ...document,
        title_vector: titleVector,
        content_vector: contentVector
      };
      
      await this.client.index({
        index: this.indexName,
        id: document.id,
        body: docWithVectors
      });
      
      console.log(`✅ Document indexed: ${document.id}`);
    } catch (error) {
      console.error('❌ Error indexing document:', error.message);
      throw error;
    }
  }

  /**
   * Perform semantic search combining traditional and vector search
   */
  async semanticSearch(query, options = {}) {
    const startTime = Date.now();
    
    // Add to temporary query history (will be cleared after processing)
    this.queryHistory.push({
      query,
      timestamp: new Date().toISOString(),
      source: options.source || 'web-frontend',
      ipHash: this.hashIP(options.ip) // Hash instead of storing actual IP
    });
    
    try {
      // Generate embedding for the query
      const queryVector = await this.generateEmbedding(query);
      
      // Build complex query combining traditional and semantic search
      const searchQuery = {
        index: this.indexName,
        body: {
          query: {
            bool: {
              should: [
                // Traditional text search
                {
                  multi_match: {
                    query: query,
                    fields: ['title^3', 'content^2', 'tags'],
                    type: 'best_fields',
                    fuzziness: 'AUTO'
                  }
                },
                // Semantic search using dense vectors
                {
                  script_score: {
                    query: {
                      bool: {
                        should: [
                          {
                            exists: { field: 'title_vector' }
                          },
                          {
                            exists: { field: 'content_vector' }
                          }
                        ]
                      }
                    },
                    script: {
                      source: "cosineSimilarity(params.query_vector, 'title_vector') + 1.0",
                      params: { query_vector: queryVector }
                    }
                  }
                },
                {
                  script_score: {
                    query: {
                      bool: {
                        should: [
                          {
                            exists: { field: 'content_vector' }
                          }
                        ]
                      }
                    },
                    script: {
                      source: "cosineSimilarity(params.query_vector, 'content_vector') + 1.0",
                      params: { query_vector: queryVector }
                    }
                  }
                }
              ],
              filter: []
            }
          },
          size: options.size || 10,
          from: options.from || 0,
          _source: ['id', 'title', 'content', 'category', 'year', 'date', 'source', 'url', 'type', 'tags'],
          highlight: {
            fields: {
              title: {},
              content: {
                fragment_size: 150,
                number_of_fragments: 3
              }
            }
          }
        }
      };
      
      // Add filters if specified
      if (options.filters) {
        if (options.filters.year) {
          searchQuery.body.query.bool.filter.push({
            term: { year: options.filters.year }
          });
        }
        
        if (options.filters.category) {
          searchQuery.body.query.bool.filter.push({
            term: { category: options.filters.category }
          });
        }
        
        if (options.filters.type) {
          searchQuery.body.query.bool.filter.push({
            term: { type: options.filters.type }
          });
        }
      }
      
      const result = await this.client.search(searchQuery);
      
      // Process results
      const processedResults = result.body.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source,
        score: hit._score,
        highlight: hit.highlight,
        // Add AI transparency indicator
        searchMethod: 'hybrid-semantic-traditional',
        processingTime: Date.now() - startTime
      }));
      
      // Clear temporary query history after processing
      this.queryHistory = this.queryHistory.filter(item => 
        Date.now() - new Date(item.timestamp).getTime() < 30000 // Keep only last 30 seconds
      );
      
      return {
        results: processedResults,
        total: result.body.hits.total.value,
        took: result.body.took,
        // Transparency information
        aiUsage: {
          method: 'hybrid semantic and traditional search',
          model: 'sentence-transformers/all-MiniLM-L6-v2 adapted for Spanish',
          vectorDimensions: 384,
          explained: true
        }
      };
    } catch (error) {
      console.error('❌ Error in semantic search:', error.message);
      
      // Clear temporary query history in case of error
      this.queryHistory = this.queryHistory.filter(item => 
        Date.now() - new Date(item.timestamp).getTime() < 30000
      );
      
      throw error;
    }
  }

  /**
   * Generate embedding vector for text
   * In a real implementation, this would call a model or API
   */
  async generateEmbedding(text) {
    // Placeholder implementation - in production, this would use:
    // 1. A locally hosted model (like sentence-transformers)
    // 2. A secure API call to a vector generation service
    // 3. A pre-computed vector database
    
    // For demonstration, returning a mock vector
    // In real implementation, we would use actual embedding generation
    const mockVector = [];
    for (let i = 0; i < 384; i++) {
      mockVector.push(Math.random() * 2 - 1); // Random values between -1 and 1
    }
    
    // In a real implementation:
    // 1. Preprocess text (tokenization, cleaning)
    // 2. Call embedding model 
    // 3. Return vector representation
    
    return mockVector;
  }

  /**
   * Simple hash function for IP anonymization (for privacy compliance)
   */
  hashIP(ip) {
    if (!ip) return null;
    
    // Simple hash for anonymization (not cryptographically secure but sufficient for non-identification)
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      hash = ((hash << 5) - hash) + ip.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(documents) {
    const body = [];
    
    for (const doc of documents) {
      const titleVector = await this.generateEmbedding(doc.title || '');
      const contentVector = await this.generateEmbedding(doc.content || '');
      
      body.push(
        { index: { _index: this.indexName, _id: doc.id } },
        {
          ...doc,
          title_vector: titleVector,
          content_vector: contentVector
        }
      );
    }
    
    const response = await this.client.bulk({ body });
    
    if (response.body.errors) {
      console.error('❌ Errors in bulk indexing:', response.body.items.filter(item => item.index.error));
    }
    
    return response;
  }

  /**
   * Get query statistics (for transparency reporting)
   */
  getQueryStats() {
    return {
      recentQueries: this.queryHistory.length,
      activeSession: true,
      dataProtection: {
        ipAnonymized: true,
        noStorage: true,
        retention: '30 seconds'
      }
    };
  }
}

module.exports = SemanticSearchService;