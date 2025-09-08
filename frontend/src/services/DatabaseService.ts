/**
 * Database Service - Handles database operations and data management
 * This service provides database abstraction layer for document management
 */

import { consolidatedApiService } from './ConsolidatedApiService';

interface DatabaseQuery {
  table: string;
  filters?: Record<string, any>;
  orderBy?: string;
  limit?: number;
}

class DatabaseService {
  async query(queryConfig: DatabaseQuery) {
    try {
      const { table, filters, orderBy, limit } = queryConfig;
      
      switch (table) {
        case 'documents':
          return await consolidatedApiService.getDocuments(
            filters?.year,
            filters?.category
          );
        case 'budget':
          if (filters?.year) {
            return await consolidatedApiService.getBudgetData(filters.year);
          }
          break;
        case 'statistics':
          return await consolidatedApiService.getStatistics();
        default:
          throw new Error(`Unknown table: ${table}`);
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getDocumentContent(documentId: string) {
    try {
      const documents = await consolidatedApiService.getDocuments();
      return documents.find(doc => doc.id === documentId);
    } catch (error) {
      console.error('Error getting document content:', error);
      return null;
    }
  }

  async searchDocuments(searchTerm: string) {
    try {
      return await consolidatedApiService.searchDocuments(searchTerm);
    } catch (error) {
      console.error('Error searching documents:', error);
      return { results: [] };
    }
  }

  async getConnectionStatus() {
    try {
      const health = await consolidatedApiService.getSystemHealth();
      return {
        connected: health.status === 'healthy',
        status: health.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new DatabaseService();
export { DatabaseService };