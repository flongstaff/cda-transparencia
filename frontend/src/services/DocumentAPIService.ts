import ApiService from './ApiService';

export interface Document {
  id: number;
  filename: string;
  original_path: string;
  markdown_path: string;
  document_type: string;
  category: string;
  year: number;
  file_size: number;
  file_hash: string;
  verification_status: string;
  official_url: string;
  archive_url: string;
  markdown_available: boolean;
  verification_status_badge: string;
  display_category: string;
  file_size_formatted: string;
}

export interface SearchResult extends Document {
  relevance_score: number;
  search_snippet: string;
}

export interface FinancialData {
  id: number;
  document_id: number;
  year: number;
  category: string;
  subcategory: string;
  budgeted_amount: number;
  executed_amount: number;
  execution_percentage: string;
  formatted_budget: string;
  formatted_executed: string;
}

class DocumentAPIService {
  private baseURL = '/api/documents';

  async getAllDocuments(filters?: { category?: string; year?: string; type?: string }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.year) params.append('year', filters.year);
    if (filters?.type) params.append('type', filters.type);
    
    const response = await fetch(`${this.baseURL}?${params}`);
    return response.json();
  }

  async getDocumentById(id: number): Promise<Document> {
    const response = await fetch(`${this.baseURL}/${id}`);
    return response.json();
  }

  async getDocumentContent(id: number): Promise<string> {
    const response = await fetch(`${this.baseURL}/${id}/content`);
    return response.text();
  }

  async searchDocuments(query: string, filters?: { category?: string; year?: string }): Promise<{
    results: SearchResult[];
    total_results: number;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.year) params.append('year', filters.year);
    
    const response = await fetch(`${this.baseURL}/search/query?${params}`);
    return response.json();
  }

  async getFinancialData(filters?: { year?: string; category?: string }) {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year);
    if (filters?.category) params.append('category', filters.category);
    
    const response = await fetch(`${this.baseURL}/financial/data?${params}`);
    return response.json();
  }

  async getCategories() {
    const response = await fetch(`${this.baseURL}/meta/categories`);
    return response.json();
  }

  async getVerificationStatus() {
    const response = await fetch(`${this.baseURL}/meta/verification`);
    return response.json();
  }

  async advancedSearch(query: string, filters?: any, facets?: string[]) {
    const response = await fetch(`${this.baseURL}/search/advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, filters, facets }),
    });
    return response.json();
  }
}

export default new DocumentAPIService();
