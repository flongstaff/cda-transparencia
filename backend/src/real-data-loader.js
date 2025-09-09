/**
 * Real Data Loader
 * Loads real document data from the file system
 */

const fs = require('fs').promises;
const path = require('path');

class RealDataLoader {
  constructor() {
    // Path to the organized data directory
    this.dataPath = path.join(__dirname, '../../../organized_pdfs/');
    this.lastLoaded = null;
  }

  /**
   * Load all documents from the organized data directory
   */
  async loadDocuments() {
    try {
      console.log('📂 Loading documents from:', this.dataPath);
      
      // Read all JSON files in the data directory
      const files = await fs.readdir(this.dataPath);
      const jsonFiles = files.filter(file => file.startsWith('data_index_') && file.endsWith('.json'));
      
      console.log(`📄 Found ${jsonFiles.length} data index files`);
      
      let allDocuments = [];
      
      // Load data from each year's index file
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.dataPath, file);
          const data = await fs.readFile(filePath, 'utf8');
          const yearData = JSON.parse(data);
          
          // Add documents from this year
          if (yearData.documents && Array.isArray(yearData.documents)) {
            allDocuments = allDocuments.concat(yearData.documents);
          }
        } catch (fileError) {
          console.error(`❌ Error loading file ${file}:`, fileError.message);
        }
      }
      
      console.log(`✅ Loaded ${allDocuments.length} documents`);
      this.lastLoaded = new Date().toISOString();
      return allDocuments;
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      throw error;
    }
  }

  /**
   * Check if data needs to be refreshed
   */
  needsRefresh() {
    // Refresh every 5 minutes
    if (!this.lastLoaded) return true;
    
    const now = new Date();
    const last = new Date(this.lastLoaded);
    const diffMinutes = (now - last) / (1000 * 60);
    
    return diffMinutes > 5;
  }

  /**
   * Get documents by category
   */
  getDocumentsByCategory(category) {
    // This would be implemented to filter documents by category
    // For now, we'll return an empty array as this is a simplified implementation
    return [];
  }

  /**
   * Get documents by year
   */
  getDocumentsByYear(year) {
    // This would be implemented to filter documents by year
    // For now, we'll return an empty array as this is a simplified implementation
    return [];
  }

  /**
   * Get budget execution documents
   */
  getBudgetExecutionDocuments() {
    // This would be implemented to filter budget execution documents
    // For now, we'll return an empty array as this is a simplified implementation
    return [];
  }

  /**
   * Get high priority documents
   */
  getHighPriorityDocuments() {
    // This would be implemented to filter high priority documents
    // For now, we'll return an empty array as this is a simplified implementation
    return [];
  }

  /**
   * Get document statistics
   */
  getStatistics() {
    // This would be implemented to calculate document statistics
    // For now, we'll return a basic object as this is a simplified implementation
    return {
      totalDocuments: 0,
      categories: {},
      years: {}
    };
  }

  /**
   * Get specific document by ID
   */
  getDocumentById(id) {
    // This would be implemented to find a specific document by ID
    // For now, we'll return null as this is a simplified implementation
    return null;
  }
}

module.exports = RealDataLoader;