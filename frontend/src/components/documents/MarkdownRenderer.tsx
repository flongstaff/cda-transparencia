import React from 'react';
import { FileText, ExternalLink, Hash, Calendar, CheckCircle } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple markdown parsing for basic formatting
  const parseMarkdown = (text: string): JSX.Element => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentTable: string[] = [];
    let inTable = false;
    
    lines.forEach((line, index) => {
      // Handle headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="mr-3 text-blue-600" size={32} />
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-8 border-b border-gray-200 pb-2">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-medium text-gray-700 mb-3 mt-6">
            {line.substring(4)}
          </h3>
        );
      }
      // Handle table rows
      else if (line.includes('|') && line.trim() !== '') {
        if (!inTable) {
          inTable = true;
          currentTable = [];
        }
        currentTable.push(line);
      }
      // Handle table end or other content
      else {
        if (inTable && currentTable.length > 0) {
          elements.push(renderTable(currentTable, index));
          currentTable = [];
          inTable = false;
        }
        
        // Handle lists
        if (line.startsWith('- ')) {
          elements.push(
            <li key={index} className="ml-6 mb-2 text-gray-700 list-disc">
              {parseInlineElements(line.substring(2))}
            </li>
          );
        }
        // Handle bold text paragraphs
        else if (line.startsWith('**') && line.endsWith('**')) {
          elements.push(
            <p key={index} className="font-semibold text-gray-800 mb-3">
              {line.substring(2, line.length - 2)}
            </p>
          );
        }
        // Handle regular paragraphs
        else if (line.trim() !== '') {
          elements.push(
            <p key={index} className="text-gray-700 mb-3 leading-relaxed">
              {parseInlineElements(line)}
            </p>
          );
        }
        // Handle empty lines
        else {
          elements.push(<div key={index} className="mb-3"></div>);
        }
      }
    });
    
    // Handle remaining table
    if (inTable && currentTable.length > 0) {
      elements.push(renderTable(currentTable, lines.length));
    }
    
    return <div className="prose max-w-none">{elements}</div>;
  };
  
  const parseInlineElements = (text: string): React.ReactNode => {
    // Handle links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
        >
          {match[1]}
          <ExternalLink size={14} />
        </a>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  const renderTable = (tableLines: string[], key: number): JSX.Element => {
    const rows = tableLines.filter(line => !line.includes('---')); // Remove separator lines
    
    if (rows.length === 0) return <div key={key}></div>;
    
    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    
    const parseTableRow = (row: string): string[] => {
      return row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
    };
    
    const headers = parseTableRow(headerRow);
    
    return (
      <div key={key} className="my-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  {header.replace(/\*\*/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => {
              const cells = parseTableRow(row);
              return (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {cells.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3 text-sm text-gray-700 border-b">
                      {parseInlineElements(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="max-w-none">
      {parseMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;