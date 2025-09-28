/**
 * Markdown Viewer Component
 * Component to display Markdown documents with syntax highlighting and search
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  ExternalLink,
  Eye, 
  Code, 
  AlertCircle,
  Loader2,
  Search,
  Share2,
  BookOpen
} from 'lucide-react';
import { DocumentMetadata } from '../../types/documents';

interface MarkdownViewerProps {
  document: DocumentMetadata;
  onDownload?: () => void;
  onOpen?: () => void;
  onShare?: () => void;
  className?: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  document,
  onDownload,
  onOpen,
  onShare,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [searchTerm, setSearchTerm] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (document.url) {
      setLoading(true);
      setError(null);
      
      // Simulate loading markdown content
      const timer = setTimeout(() => {
        try {
          // In a real implementation, this would fetch from the document URL
          // For now, we'll use mock content
          const mockContent = `# ${document.title}

Este es un documento de ejemplo en formato Markdown.

## Sección 1

Contenido de la primera sección del documento.

## Sección 2

Contenido de la segunda sección del documento.

### Subsección

- Elemento 1
- Elemento 2
- Elemento 3

### Código

\`\`\`javascript
    // // console.log('Hola mundo');
\`\`\`

### Enlaces

[Página oficial del municipio](https://carmendeareco.gob.ar)

### Tablas

| Columna 1 | Columna 2 |
|-----------|-----------|
| Valor 1   | Valor 2   |
| Valor 3   | Valor 4   |`;
          
          setMarkdownContent(mockContent);
          setWordCount(mockContent.split(/\s+/).length);
          setLoading(false);
        } catch (err) {
          setError((err as Error).message);
          setLoading(false);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [document.url]);

  const renderMarkdown = (markdown: string): string => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Code blocks
      .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="bg-gray-100 border border-gray-300 rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Lists
      .replace(/^\* (.+)$/gm, '<li class="ml-4 mb-2">• $1</li>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 mb-2">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 mb-2 list-decimal">$1</li>')
      
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-700">$1</blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-8 border-t-2 border-gray-300">')
      
      // Tables
      .replace(/\|(.+)\|/g, '<td class="border border-gray-300 px-4 py-2">$1</td>')
      .replace(/(\|.*\|)\n(\|[-|\s]+\|)/g, '$1</tr><tr>$2')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    if (!html.startsWith('<h1') && !html.startsWith('<h2') && !html.startsWith('<h3')) {
      html = `<p class="mb-4">${html}</p>`;
    }

    return html;
  };

  const highlightSearchTerm = (text: string, term: string): string => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(markdownContent);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (document.url) {
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (navigator.share && document.url) {
      navigator.share({
        title: document.title,
        text: markdownContent.substring(0, 100) + '...'
      });
    } else {
      handleCopyContent();
    }
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
    } else if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Cargando documento Markdown...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border border-red-200 rounded-lg p-8 text-center ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error al cargar el documento
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
          {document.url && (
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 inline-flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir directamente
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900 truncate">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500">
                {wordCount} palabras • Documento Markdown
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar en documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('rendered')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'rendered'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="Vista renderizada"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'raw'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="Código fuente"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Compartir documento"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyContent}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Copiar contenido"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                title="Descargar Markdown"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpen}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                title="Abrir en nueva ventana"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'rendered' ? (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: highlightSearchTerm(renderMarkdown(markdownContent), searchTerm)
            }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg p-4 overflow-auto max-h-96">
            {highlightSearchTerm(markdownContent, searchTerm)}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              Documento Markdown
            </span>
            <span>{wordCount} palabras</span>
            <span>Modo: {viewMode === 'rendered' ? 'Renderizado' : 'Código fuente'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {searchTerm && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Búsqueda activa: "{searchTerm}"
              </span>
            )}
            <span className="text-xs">
              {new Date(document.processing_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownViewer;