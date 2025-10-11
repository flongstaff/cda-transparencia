import { githubDataService } from './GitHubDataService';
import cloudflareDataService from './CloudflareDataService';

export interface ApiServiceResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: string;
  source?: string;
}

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Make a GET request to the backend API
   */
  async get<T = any>(endpoint: string): Promise<ApiServiceResponse<T>> {
    // Try Cloudflare worker first
    try {
      const cloudflareResult = await this.makeRequest<T>(endpoint, 'cloudflare');
      if (cloudflareResult.success) {
        return cloudflareResult;
      }
    } catch (error) {
      console.warn(`Cloudflare API call failed for ${endpoint}:`, error);
    }

    // Fallback to GitHub raw content
    try {
      const githubResult = await this.makeRequest<T>(endpoint, 'github');
      if (githubResult.success) {
        return githubResult;
      }
    } catch (error) {
      console.warn(`GitHub API call failed for ${endpoint}:`, error);
    }

    // If both fail, return error
    return {
      success: false,
      data: null,
      error: 'All API endpoints failed',
    };
  }

  /**
   * Make a request using either Cloudflare or GitHub service
   */
  private async makeRequest<T>(endpoint: string, serviceType: 'cloudflare' | 'github'): Promise<ApiServiceResponse<T>> {
    // Normalize the endpoint to ensure it starts with the correct API path
    let normalizedEndpoint = endpoint;
    if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = `/${normalizedEndpoint}`;
    }

    try {
      if (serviceType === 'cloudflare') {
        // Use Cloudflare service
        if (normalizedEndpoint.startsWith('/data/')) {
          // For data endpoints, use the Cloudflare data service
          return await this.handleDataEndpoint<T>(normalizedEndpoint, 'cloudflare');
        } else {
          // For other API endpoints, construct the full URL
          const fullUrl = this.constructApiUrl(normalizedEndpoint);
          const response = await fetch(fullUrl);
          
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          return {
            success: true,
            data,
            source: 'cloudflare-api',
          };
        }
      } else {
        // Use GitHub service
        if (normalizedEndpoint.startsWith('/data/')) {
          // For data endpoints, use the GitHub data service
          return await this.handleDataEndpoint<T>(normalizedEndpoint, 'github');
        } else {
          // For other endpoints, we might need a different approach
          // Currently, GitHub doesn't host dynamic API endpoints, only static files
          // So we'll default to the data service approach
          return await this.handleDataEndpoint<T>(normalizedEndpoint, 'github');
        }
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        source: serviceType,
      };
    }
  }

  /**
   * Construct the API URL based on environment configuration
   */
  private constructApiUrl(endpoint: string): string {
    const apiUrl = process.env.VITE_API_URL || 
                   'https://cda-transparencia.flongstaff.workers.dev/api' ||
                   'http://localhost:8787';
    
    // Ensure the endpoint doesn't start with /api if the base URL already includes it
    if (apiUrl.includes('/api') && endpoint.startsWith('/api')) {
      return `${apiUrl}${endpoint.substring(4)}`; // Remove '/api' from endpoint
    }
    
    return `${apiUrl}${endpoint}`;
  }

  /**
   * Handle data endpoints using appropriate service
   */
  private async handleDataEndpoint<T>(endpoint: string, serviceType: 'cloudflare' | 'github'): Promise<ApiServiceResponse<T>> {
    if (serviceType === 'cloudflare') {
      if (endpoint.includes('/year/')) {
        // Extract year from endpoint like /data/year/2024
        const year = parseInt(endpoint.split('/').pop() || '');
        if (!isNaN(year)) {
          const result = await cloudflareDataService.loadYearData(year);
          return {
            success: result.success,
            data: result.data as T,
            error: result.error,
            source: result.source,
          };
        }
      } else {
        // For other data endpoints, fetch the JSON directly
        const result = await cloudflareDataService.fetchJson(endpoint);
        return {
          success: result.success,
          data: result.data as T,
          error: result.error,
          source: result.source,
        };
      }
    } else {
      if (endpoint.includes('/year/')) {
        // Extract year from endpoint like /data/year/2024
        const year = parseInt(endpoint.split('/').pop() || '');
        if (!isNaN(year)) {
          const result = await githubDataService.loadYearData(year);
          return {
            success: result.success,
            data: result.data as T,
            error: result.error,
            source: result.source,
          };
        }
      } else {
        // For other data endpoints, fetch the JSON directly
        const result = await githubDataService.fetchJson(endpoint);
        return {
          success: result.success,
          data: result.data as T,
          error: result.error,
          source: result.source,
        };
      }
    }

    // Fallback
    return {
      success: false,
      data: null,
      error: 'Endpoint not recognized',
    };
  }

  /**
   * Get available years from the backend
   */
  async getAvailableYears(): Promise<ApiServiceResponse<number[]>> {
    try {
      // Try Cloudflare service first
      const cloudflareYears = await cloudflareDataService.getAvailableYears();
      if (cloudflareYears && cloudflareYears.length > 0) {
        return {
          success: true,
          data: cloudflareYears,
          source: 'cloudflare',
        };
      }

      // Fallback to GitHub service
      const githubYears = await githubDataService.getAvailableYears();
      return {
        success: true,
        data: githubYears,
        source: 'github',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch available years',
      };
    }
  }
}

export const apiService = ApiService.getInstance();
export default apiService;