import { useState, useEffect } from 'react';
import cloudflareDataService from '../services/CloudflareDataService';

export interface SitemapData {
  generated_at: string;
  base_url: string;
  total_documents: number;
  years: Record<string, YearData>;
  categories: Record<string, CategoryData>;
  file_types: Record<string, number>;
}

export interface YearData {
  document_count: number;
  categories: Record<string, CategoryInfo>;
}

export interface CategoryInfo {
  document_count: number;
  paths: {
    markdown: string;
    json: string;
    pdfs: string;
  };
}

export interface CategoryData {
  document_count: number;
  years: string[];
}

interface UseSitemapDataReturn {
  data: SitemapData | null;
  loading: boolean;
  error: string | null;
}

export const useSitemapData = (): UseSitemapDataReturn => {
  const [data, setData] = useState<SitemapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use CloudflareDataService for optimized fetching
        const result = await cloudflareDataService.fetchJson('/data/sitemap.json');
        
        if (result.success && result.data) {
          setData(result.data as SitemapData);
          setError(null);
          console.log(`[SITEMAP DATA] Successfully fetched via Cloudflare service (source: ${result.source})`);
        } else {
          throw new Error(result.error || 'Failed to fetch sitemap data via Cloudflare service');
        }
      } catch (err) {
        console.error('[SITEMAP DATA] Error fetching sitemap data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};