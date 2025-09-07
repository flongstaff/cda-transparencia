// Markdown Data Service
// Handles markdown content and documentation data

export class MarkdownDataService {
  async getMarkdownContent(path: string): Promise<string> {
    try {
      const response = await fetch(`/docs/${path}`);
      if (response.ok) {
        return await response.text();
      }
      return `# Document not found\n\nThe requested document at ${path} could not be found.`;
    } catch (error) {
      return `# Error loading document\n\nFailed to load document at ${path}: ${error}`;
    }
  }

  async getDocumentationIndex(): Promise<any[]> {
    return [
      { path: 'api/api-reference.md', title: 'API Reference', category: 'API' },
      { path: 'getting-started/quick-start.md', title: 'Quick Start', category: 'Getting Started' },
      { path: 'deployment/DEPLOYMENT_GUIDE.md', title: 'Deployment Guide', category: 'Deployment' }
    ];
  }

  parseMarkdownMetadata(content: string): { title?: string; description?: string; tags?: string[] } {
    const lines = content.split('\n');
    const metadata: any = {};
    
    // Simple front matter parsing
    if (lines[0] === '---') {
      let i = 1;
      while (i < lines.length && lines[i] !== '---') {
        const line = lines[i];
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          metadata[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
        }
        i++;
      }
    }
    
    return metadata;
  }

  convertMarkdownToHtml(markdown: string): string {
    // Very simple markdown to HTML conversion
    return markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
}

export const markdownDataService = new MarkdownDataService();
export default markdownDataService;