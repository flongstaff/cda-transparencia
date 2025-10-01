/**
 * Open Data Service for Carmen de Areco Transparency Portal
 * Backend service for managing open data in compliance with AAIP standards
 * Implements access controls, metadata management, and accessibility features
 */

const fs = require('fs');
const path = require('path');

class OpenDataService {
  constructor() {
    this.dataDirectory = path.join(__dirname, '..', '..', 'data');
    this.categoriesFile = path.join(this.dataDirectory, 'categories-structure.json');
    this.metadataFile = path.join(this.dataDirectory, 'metadata-standards.json');
    this.accessibilityFile = path.join(this.dataDirectory, 'accessibility-standards.json');
  }

  /**
   * Get all open data categories with metadata
   */
  getOpenDataCatalog() {
    try {
      if (!fs.existsSync(this.categoriesFile)) {
        throw new Error('Categories structure file not found');
      }

      const categoriesData = JSON.parse(fs.readFileSync(this.categoriesFile, 'utf8'));
      
      // Add additional metadata to each category
      categoriesData.categories.forEach(category => {
        // Calculate additional metrics
        category.datasetCount = category.datasets ? category.datasets.length : 0;
        category.totalSize = this.calculateTotalSize(category.datasets);
        category.accessibilityCompliance = category.datasets 
          ? this.calculateAccessibilityCompliance(category.datasets) 
          : 0;
      });

      return {
        categories: categoriesData.categories,
        compliance: categoriesData.compliance,
        lastUpdated: new Date().toISOString(),
        totalDatasets: categoriesData.categories.reduce((total, cat) => 
          total + (cat.datasets ? cat.datasets.length : 0), 0)
      };
    } catch (error) {
      console.error('Error getting open data catalog:', error);
      throw error;
    }
  }

  /**
   * Get specific category by ID
   */
  getCategoryById(categoryId) {
    try {
      const catalog = this.getOpenDataCatalog();
      const category = catalog.categories.find(cat => cat.id === categoryId);
      
      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }

      return category;
    } catch (error) {
      console.error(`Error getting category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Get specific dataset by ID
   */
  getDatasetById(datasetId) {
    try {
      const catalog = this.getOpenDataCatalog();
      
      for (const category of catalog.categories) {
        const dataset = category.datasets.find(ds => ds.id === datasetId);
        if (dataset) {
          return {
            ...dataset,
            category: category.id,
            categoryName: category.title
          };
        }
      }
      
      throw new Error(`Dataset with ID ${datasetId} not found`);
    } catch (error) {
      console.error(`Error getting dataset ${datasetId}:`, error);
      throw error;
    }
  }

  /**
   * Get all available file formats in the system
   */
  getAvailableFormats() {
    try {
      const catalog = this.getOpenDataCatalog();
      const formats = new Set();

      catalog.categories.forEach(category => {
        category.datasets.forEach(dataset => {
          dataset.formats.forEach(format => formats.add(format));
        });
      });

      return Array.from(formats).sort();
    } catch (error) {
      console.error('Error getting available formats:', error);
      throw error;
    }
  }

  /**
   * Search datasets by query string
   */
  searchDatasets(query) {
    try {
      const catalog = this.getOpenDataCatalog();
      const results = [];

      catalog.categories.forEach(category => {
        category.datasets.forEach(dataset => {
          if (
            dataset.title.toLowerCase().includes(query.toLowerCase()) ||
            dataset.description.toLowerCase().includes(query.toLowerCase()) ||
            dataset.formats.some(format => format.toLowerCase().includes(query.toLowerCase())) ||
            dataset.accessibility.standards.some(standard => standard.toLowerCase().includes(query.toLowerCase()))
          ) {
            results.push({
              ...dataset,
              category: category.id,
              categoryName: category.title
            });
          }
        });
      });

      return results;
    } catch (error) {
      console.error('Error searching datasets:', error);
      throw error;
    }
  }

  /**
   * Get metadata schema structure
   */
  getMetadataSchema() {
    try {
      if (!fs.existsSync(this.metadataFile)) {
        throw new Error('Metadata standards file not found');
      }

      return JSON.parse(fs.readFileSync(this.metadataFile, 'utf8'));
    } catch (error) {
      console.error('Error getting metadata schema:', error);
      throw error;
    }
  }

  /**
   * Get accessibility compliance standards
   */
  getAccessibilityStandards() {
    try {
      if (!fs.existsSync(this.accessibilityFile)) {
        throw new Error('Accessibility standards file not found');
      }

      return JSON.parse(fs.readFileSync(this.accessibilityFile, 'utf8'));
    } catch (error) {
      console.error('Error getting accessibility standards:', error);
      throw error;
    }
  }

  /**
   * Calculate total size of datasets in a category
   */
  calculateTotalSize(datasets) {
    if (!datasets) return '0 MB';
    
    let totalBytes = 0;
    
    datasets.forEach(dataset => {
      if (dataset.size) {
        // Simple parsing - in a real system this would be more robust
        const size = this.parseSizeString(dataset.size);
        totalBytes += size;
      }
    });

    return this.formatBytes(totalBytes);
  }

  /**
   * Parse size string (e.g., "2.4 MB") to bytes
   */
  parseSizeString(sizeStr) {
    const match = sizeStr.match(/([\d.]+)\s*(\w+)/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'kb': return value * 1024;
      case 'mb': return value * 1024 * 1024;
      case 'gb': return value * 1024 * 1024 * 1024;
      case 'b': return value;
      default: return value; // Assume bytes if unknown unit
    }
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculate accessibility compliance percentage for datasets
   */
  calculateAccessibilityCompliance(datasets) {
    if (!datasets || datasets.length === 0) return 0;

    const compliantCount = datasets.filter(ds => ds.accessibility.compliant).length;
    return Math.round((compliantCount / datasets.length) * 100);
  }

  /**
   * Validate dataset metadata against schema
   */
  validateDatasetMetadata(metadata) {
    // In a real system, this would validate against the JSON schema
    // For now, just check required fields based on our standards
    const required = ['title', 'description', 'publisher', 'issued', 'modified', 'identifier', 'theme', 'accessLevel'];
    const errors = [];

    for (const field of required) {
      if (!metadata[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get data for API compliance report
   */
  getComplianceReport() {
    try {
      const catalog = this.getOpenDataCatalog();
      const accessibility = this.getAccessibilityStandards();

      return {
        overallCompliance: {
          aaipStandards: catalog.compliance.aaipStandards,
          itaMethodology: catalog.compliance.itaMethodology,
          wcagCompliance: catalog.compliance.wcagCompliance
        },
        catalogStats: {
          totalCategories: catalog.categories.length,
          totalDatasets: catalog.totalDatasets,
          categoriesWithDatasets: catalog.categories.filter(c => c.datasetCount > 0).length
        },
        accessibilityCompliance: {
          standards: accessibility.wcag_2_1_aa_checklist,
          implementationStatus: accessibility.implementation_guidelines
        },
        updatePolicy: catalog.compliance.updatePolicy,
        accessibilityPolicy: catalog.compliance.accessibilityPolicy,
        lastAuditDate: accessibility.compliance_reporting.last_audit_date,
        nextAuditDate: accessibility.compliance_reporting.next_audit_date
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }
}

module.exports = OpenDataService;