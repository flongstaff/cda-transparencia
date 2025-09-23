/**
 * GitHub API Utility
 * Utility functions for interacting with GitHub API
 */

// GitHub API configuration
const GITHUB_CONFIG = {
  BASE_URL: 'https://api.github.com',
  OWNER: 'flongstaff',
  REPO: 'cda-transparencia',
  TOKEN: import.meta.env.VITE_GITHUB_TOKEN || ''
};

// GitHub API headers
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };
  
  if (GITHUB_CONFIG.TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_CONFIG.TOKEN}`;
  }
  
  return headers;
};

// GitHub API error handling
class GitHubAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

// Fetch wrapper with error handling
const fetchWithErrorHandling = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new GitHubAPIError(
      `GitHub API error: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText
    );
  }
  
  return response;
};

// Get repository contents
export const getRepoContents = async (path: string = '') => {
  try {
    const url = `${GITHUB_CONFIG.BASE_URL}/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${path}`;
    const response = await fetchWithErrorHandling(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching repository contents:', error);
    throw error;
  }
};

// Get file content
export const getFileContent = async (path: string) => {
  try {
    const url = `${GITHUB_CONFIG.BASE_URL}/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${path}`;
    const response = await fetchWithErrorHandling(url);
    const data = await response.json();
    
    // Decode base64 content
    if (data.content && data.encoding === 'base64') {
      const decodedContent = atob(data.content);
      return {
        ...data,
        content: decodedContent
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};

// Get raw file content
export const getRawFileContent = async (path: string) => {
  try {
    const url = `https://raw.githubusercontent.com/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/main/${path}`;
    const response = await fetchWithErrorHandling(url);
    return await response.text();
  } catch (error) {
    console.error('Error fetching raw file content:', error);
    throw error;
  }
};

// Search repository
export const searchRepo = async (query: string, path: string = '') => {
  try {
    const searchQuery = `repo:${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO} ${query} path:${path}`;
    const url = `${GITHUB_CONFIG.BASE_URL}/search/code?q=${encodeURIComponent(searchQuery)}`;
    const response = await fetchWithErrorHandling(url);
    return await response.json();
  } catch (error) {
    console.error('Error searching repository:', error);
    throw error;
  }
};

// Get repository information
export const getRepoInfo = async () => {
  try {
    const url = `${GITHUB_CONFIG.BASE_URL}/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}`;
    const response = await fetchWithErrorHandling(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching repository information:', error);
    throw error;
  }
};

// Get repository branches
export const getRepoBranches = async () => {
  try {
    const url = `${GITHUB_CONFIG.BASE_URL}/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/branches`;
    const response = await fetchWithErrorHandling(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching repository branches:', error);
    throw error;
  }
};

// Get repository commits
export const getRepoCommits = async (path?: string) => {
  try {
    let url = `${GITHUB_CONFIG.BASE_URL}/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/commits`;
    if (path) {
      url += `?path=${encodeURIComponent(path)}`;
    }
    const response = await fetchWithErrorHandling(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching repository commits:', error);
    throw error;
  }
};

// Export utility functions
export const githubAPI = {
  getRepoContents,
  getFileContent,
  getRawFileContent,
  searchRepo,
  getRepoInfo,
  getRepoBranches,
  getRepoCommits
};

export default githubAPI;