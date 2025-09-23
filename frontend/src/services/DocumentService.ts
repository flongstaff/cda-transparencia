/**
 * Document Service
 * Service to handle all document operations with proper error handling
 */

import { DocumentMetadata, SupportedFileType } from '../types/documents';
import { errorHandler } from '../utils/errorHandler';

// Document service configuration
const DOCUMENT_SERVICE_CONFIG = {
  GITHUB_BASE_URL: 'https://raw.githubusercontent.com',
  GITHUB_OWNER: 'flongstaff',
  GITHUB_REPO: 'cda-transparencia',
  GITHUB_BRANCH: 'main',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_RETRIES: 3
};

// Cache interface
interface DocumentCacheEntry {
  data: DocumentMetadata;
  timestamp: number;
  ttl: number;
}

// Document service class
class DocumentService {
  private cache: Map<string, DocumentCacheEntry> = new Map();
  private loadingPromises: Map<string, Promise<DocumentMetadata | null>> = new Map();

  // Get GitHub raw URL for a document
  private getGitHubRawUrl(path: string): string {
    return `${DOCUMENT_SERVICE_CONFIG.GITHUB_BASE_URL}/${DOCUMENT_SERVICE_CONFIG.GITHUB_OWNER}/${DOCUMENT_SERVICE_CONFIG.GITHUB_REPO}/${DOCUMENT_SERVICE_CONFIG.GITHUB_BRANCH}/${path}`;
  }

  // Fetch document with retry mechanism
  private async fetchWithRetry(url: string, maxRetries: number = DOCUMENT_SERVICE_CONFIG.MAX_RETRIES): Promise<Response> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json, text/plain, */*'
          }
        });
        
        if (response.ok) {
          return response;
        }
        
        if (i === maxRetries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries) {
          throw lastError;
        }
      }
    }
    
    throw lastError;
  }

  // Load document metadata from GitHub
  async loadDocumentMetadata(path: string): Promise<DocumentMetadata | null> {
    try {
      // Check cache first
      const cached = this.cache.get(path);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
      
      // Check if already loading
      if (this.loadingPromises.has(path)) {
        return await this.loadingPromises.get(path)!;
      }
      
      // Create loading promise
      const loadingPromise = this.fetchDocumentMetadata(path);
      this.loadingPromises.set(path, loadingPromise);
      
      // Wait for result
      const metadata = await loadingPromise;
      
      // Remove from loading promises
      this.loadingPromises.delete(path);
      
      // Cache result
      if (metadata) {
        this.cache.set(path, {
          data: metadata,
          timestamp: Date.now(),
          ttl: DOCUMENT_SERVICE_CONFIG.CACHE_DURATION
        });
      }
      
      return metadata;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'DocumentService',
        action: 'loadDocumentMetadata',
        timestamp: new Date()
      });
      return null;
    }
  }
  
  // Fetch document metadata from GitHub
  private async fetchDocumentMetadata(path: string): Promise<DocumentMetadata | null> {
    try {
      // Get file info from GitHub
      const url = this.getGitHubRawUrl(path);
      const response = await this.fetchWithRetry(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Extract file type from extension
      const fileType = this.extractFileType(path);
      
      // Create document metadata
      const metadata: DocumentMetadata = {
        id: `${path.hashCode()}`,
        title: path.split('/').pop()?.replace(/\.[^/.]+$/, "") || 'Documento sin nombre',
        filename: path.split('/').pop() || path,
        year: new Date().getFullYear(),
        category: 'unknown',
        size_mb: '0',
        url: url,
        official_url: url,
        verification_status: 'verified',
        processing_date: new Date().toISOString(),
        relative_path: path,
        content: '',
        file_type: fileType
      };
      
      return metadata;
    } catch (error) {
      console.warn(`Could not fetch metadata for ${path}:`, error);
      return null;
    }
  }
  
  // Load document content from GitHub
  async loadDocumentContent(path: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.cache.get(`content_${path}`);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data.content;
      }
      
      // Check if already loading
      if (this.loadingPromises.has(`content_${path}`)) {
        const result = await this.loadingPromises.get(`content_${path}`)!;
        return result?.content || '';
      }
      
      // Create loading promise
      const loadingPromise = this.fetchDocumentContent(path);
      this.loadingPromises.set(`content_${path}`, loadingPromise);
      
      // Wait for result
      const content = await loadingPromise;
      
      // Remove from loading promises
      this.loadingPromises.delete(`content_${path}`);
      
      // Cache result
      if (content) {
        this.cache.set(`content_${path}`, {
          data: { content },
          timestamp: Date.now(),
          ttl: DOCUMENT_SERVICE_CONFIG.CACHE_DURATION
        });
      }
      
      return content;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'DocumentService',
        action: 'loadDocumentContent',
        timestamp: new Date()
      });
      throw error;
    }
  }
  
  // Fetch document content from GitHub
  private async fetchDocumentContent(path: string): Promise<string> {
    try {
      const url = this.getGitHubRawUrl(path);
      const response = await this.fetchWithRetry(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch content for ${path}: ${(error as Error).message}`);
    }
  }
  
  // Extract file type from path
  private extractFileType(path: string): SupportedFileType {
    const ext = path.toLowerCase().split('.').pop() || '';
    
    // Map common extensions to supported file types
    const extensionMap: Record<string, SupportedFileType> = {
      'pdf': 'pdf',
      'md': 'md',
      'markdown': 'markdown',
      'jpg': 'jpg',
      'jpeg': 'jpeg',
      'png': 'png',
      'gif': 'gif',
      'svg': 'svg',
      'json': 'json',
      'zip': 'zip',
      'rar': 'rar',
      '7z': '7z',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'xls',
      'xlsx': 'xlsx',
      'ppt': 'ppt',
      'pptx': 'pptx',
      'txt': 'txt',
      'csv': 'csv'
    };
    
    return extensionMap[ext] || 'txt';
  }
  
  // Search documents by query
  async searchDocuments(query: string, category?: string): Promise<DocumentMetadata[]> {
    try {
      // In a real implementation, this would search GitHub repository
      // For now, we'll return mock data
      const mockDocuments: DocumentMetadata[] = [
        {
          id: 'pdf-001',
          title: 'Presupuesto Municipal 2024',
          filename: 'presupuesto-2024.pdf',
          year: 2024,
          category: 'Presupuesto',
          size_mb: '2.5',
          url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/presupuesto-2024.pdf',
          official_url: 'https://example.com/presupuesto-2024.pdf',
          verification_status: 'verified',
          processing_date: new Date().toISOString(),
          relative_path: 'data/organized_documents/presupuesto-2024.pdf',
          content: '',
          file_type: 'pdf'
        },
        {
          id: 'md-001',
          title: 'Informe de Ejecución Presupuestaria',
          filename: 'informe-ejecucion.md',
          year: 2024,
          category: 'Finanzas',
          size_mb: '0.8',
          url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/informe-ejecucion.md',
          official_url: 'https://example.com/informe-ejecucion.md',
          verification_status: 'verified',
          processing_date: new Date().toISOString(),
          relative_path: 'data/organized_documents/informe-ejecucion.md',
          content: '# Informe de Ejecución Presupuestaria\n\nEste informe detalla la ejecución presupuestaria del municipio...',
          file_type: 'md'
        },
        {
          id: 'jpg-001',
          title: 'Gráfico de Ingresos',
          filename: 'grafico-ingresos.jpg',
          year: 2024,
          category: 'Finanzas',
          size_mb: '1.2',
          url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/grafico-ingresos.jpg',
          official_url: 'https://example.com/grafico-ingresos.jpg',
          verification_status: 'verified',
          processing_date: new Date().toISOString(),
          relative_path: 'data/organized_documents/grafico-ingresos.jpg',
          content: '',
          file_type: 'jpg'
        },
        {
          id: 'json-001',
          title: 'Datos de Sueldos',
          filename: 'sueldos-2024.json',
          year: 2024,
          category: 'Recursos Humanos',
          size_mb: '0.5',
          url: 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main/data/organized_documents/sueldos-2024.json',
          official_url: 'https://example.com/sueldos-2024.json',
          verification_status: 'verified',
          processing_date: new Date().toISOString(),
          relative_path: 'data/organized_documents/sueldos-2024.json',
          content: '{"empleados": [{"nombre": "Juan Pérez", "sueldo": 50000}, {"nombre": "María García", "sueldo": 45000}]}',
          file_type: 'json'
        }
      ];
      
      // Filter by query
      const filteredDocuments = mockDocuments.filter(doc => 
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.filename.toLowerCase().includes(query.toLowerCase()) ||
        doc.category.toLowerCase().includes(query.toLowerCase())
      );
      
      // Filter by category if provided
      if (category) {
        return filteredDocuments.filter(doc => doc.category.toLowerCase() === category.toLowerCase());
      }
      
      return filteredDocuments;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'DocumentService',
        action: 'searchDocuments',
        timestamp: new Date()
      });
      return [];
    }
  }
  
  // Get available categories
  async getAvailableCategories(): Promise<string[]> {
    try {
      // In a real implementation, this would fetch from GitHub
      // For now, we'll return mock data
      return ['Presupuesto', 'Finanzas', 'Recursos Humanos', 'Contratos', 'Declaraciones'];
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'DocumentService',
        action: 'getAvailableCategories',
        timestamp: new Date()
      });
      return [];
    }
  }
  
  // Get available years
  async getAvailableYears(): Promise<number[]> {
    try {
      // In a real implementation, this would fetch from GitHub
      // For now, we'll return mock data
      return [2020, 2021, 2022, 2023, 2024, 2025];
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'DocumentService',
        action: 'getAvailableYears',
        timestamp: new Date()
      });
      return [];
    }
  }
  
  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
  
  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Extend String interface for hash code
declare global {
  interface String {
    hashCode(): string;
  }
}

// String hash function for IDs
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

// Export singleton instance
export const documentService = new DocumentService();
export default documentService;