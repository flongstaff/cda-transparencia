/**
 * Document utilities for handling PDF links, fallbacks, and document URL generation
 */

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/flongstaff/cda-transparencia/main';
const OFFICIAL_SITE_BASE = 'https://carmendeareco.gob.ar';

/**
 * Generate PDF URL with GitHub repository as primary and official site as fallback
 */
export function generateDocumentUrl(filename: string, year?: number, category?: string): string {
  // Primary: GitHub repository - PDFs are in /data/pdfs directory
  const githubPath = `${GITHUB_RAW_BASE}/data/pdfs/${filename}`;
    
  return githubPath;
}

/**
 * Get fallback URLs for a document
 */
export function getDocumentFallbackUrls(filename: string, year?: number): string[] {
  const fallbacks: string[] = [];
  
  // Official website fallback
  if (year) {
    fallbacks.push(`${OFFICIAL_SITE_BASE}/transparencia/documentos/${year}/${filename}`);
  }
  fallbacks.push(`${OFFICIAL_SITE_BASE}/transparencia/documentos/${filename}`);
  
  // Archive.org fallback
  fallbacks.push(`https://web.archive.org/web/20240101000000*/${OFFICIAL_SITE_BASE}/transparencia/documentos/${filename}`);
  
  return fallbacks;
}

/**
 * Generate comprehensive document object with all URLs
 */
export interface DocumentWithUrls {
  id: string;
  title: string;
  filename: string;
  primaryUrl: string;
  fallbackUrls: string[];
  officialUrl?: string;
  category: string;
  year?: number;
  size?: number;
  verified?: boolean;
  type: 'pdf' | 'excel' | 'json' | 'markdown' | 'csv';
}

export function createDocumentWithUrls(
  document: any,
  officialUrlMap?: Record<string, string>
): DocumentWithUrls {
  const filename = document.filename || document.file || `${document.title}.pdf`;
  const year = document.year || new Date(document.date || '2024-01-01').getFullYear();
  
  // Get file type from filename
  const extension = filename.split('.').pop()?.toLowerCase();
  const type = getFileType(extension);
  
  return {
    id: document.id || `doc-${filename}`,
    title: document.title || filename.replace(/\.[^/.]+$/, ""),
    filename,
    primaryUrl: generateDocumentUrl(filename, year, document.category),
    fallbackUrls: getDocumentFallbackUrls(filename, year),
    officialUrl: officialUrlMap?.[filename] || undefined,
    category: document.category || 'Documentos Generales',
    year,
    size: document.size || document.size_mb,
    verified: document.verified ?? true,
    type
  };
}

function getFileType(extension?: string): 'pdf' | 'excel' | 'json' | 'markdown' | 'csv' {
  if (!extension) return 'pdf';
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return 'excel';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'csv':
      return 'csv';
    default:
      return 'pdf';
  }
}

/**
 * Extract official URLs from multi-source report
 */
export function extractOfficialUrls(multiSourceReport: any): Record<string, string> {
  const officialUrls: Record<string, string> = {};
  
  if (!multiSourceReport?.sources) return officialUrls;
  
  // Extract from local documents
  if (multiSourceReport.sources.local?.documents) {
    multiSourceReport.sources.local.documents.forEach((doc: any) => {
      if (doc.filename && doc.url) {
        officialUrls[doc.filename] = doc.url;
      }
    });
  }
  
  // Extract from other sources (AFIP, provincial, etc.)
  Object.values(multiSourceReport.sources).forEach((source: any) => {
    if (source?.documents) {
      source.documents.forEach((doc: any) => {
        if (doc.filename && doc.url) {
          officialUrls[doc.filename] = doc.url;
        }
      });
    }
  });
  
  return officialUrls;
}

/**
 * Validate if a URL is accessible
 */
export async function validateDocumentUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get best available URL for a document with fallback logic
 */
export async function getBestDocumentUrl(document: DocumentWithUrls): Promise<string> {
  // Try official URL first if available
  if (document.officialUrl && await validateDocumentUrl(document.officialUrl)) {
    return document.officialUrl;
  }
  
  // Try primary URL (GitHub)
  if (await validateDocumentUrl(document.primaryUrl)) {
    return document.primaryUrl;
  }
  
  // Try fallback URLs
  for (const fallbackUrl of document.fallbackUrls) {
    if (await validateDocumentUrl(fallbackUrl)) {
      return fallbackUrl;
    }
  }
  
  // Return primary URL as last resort
  return document.primaryUrl;
}

/**
 * Format file size
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'N/A';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Get document icon based on type
 */
export function getDocumentIcon(type: DocumentWithUrls['type']): string {
  switch (type) {
    case 'pdf':
      return '📄';
    case 'excel':
      return '📊';
    case 'json':
      return '🗂️';
    case 'markdown':
      return '📝';
    case 'csv':
      return '📈';
    default:
      return '📁';
  }
}