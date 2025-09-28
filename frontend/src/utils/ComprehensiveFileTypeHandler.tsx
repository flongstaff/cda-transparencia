import React from 'react';
/**
 * Comprehensive File Type Handler
 * Centralized handler for all supported file types with proper error handling
 */

import { 
  DocumentMetadata, 
  SupportedFileType,
  DocumentServiceError
} from '../types/documents';

import PDFViewer from '../components/viewers/PDFViewer';
import MarkdownViewer from '../components/viewers/MarkdownViewer';
import ImageViewer from '../components/viewers/ImageViewer';
import JSONViewer from '../components/viewers/JSONViewer';
import ArchiveViewer from '../components/viewers/ArchiveViewer';
import OfficeViewer from '../components/viewers/OfficeViewer';
import TextViewer from '../components/viewers/TextViewer';
import FallbackViewer from '../components/viewers/FallbackViewer';

// File type configuration
interface FileTypeConfig {
  viewer: React.ComponentType<any>;
  icon: string;
  color: string;
  description: string;
  mimeType: string;
  extensions: string[];
}

// Configuration for all supported file types
const FILE_TYPE_CONFIG: Record<SupportedFileType, FileTypeConfig> = {
  pdf: {
    viewer: PDFViewer,
    icon: 'FileText',
    color: 'red',
    description: 'Documento PDF',
    mimeType: 'application/pdf',
    extensions: ['.pdf']
  },
  md: {
    viewer: MarkdownViewer,
    icon: 'BookOpen',
    color: 'blue',
    description: 'Documento Markdown',
    mimeType: 'text/markdown',
    extensions: ['.md', '.markdown']
  },
  markdown: {
    viewer: MarkdownViewer,
    icon: 'BookOpen',
    color: 'blue',
    description: 'Documento Markdown',
    mimeType: 'text/markdown',
    extensions: ['.md', '.markdown']
  },
  jpg: {
    viewer: ImageViewer,
    icon: 'FileImage',
    color: 'green',
    description: 'Imagen JPG',
    mimeType: 'image/jpeg',
    extensions: ['.jpg', '.jpeg']
  },
  jpeg: {
    viewer: ImageViewer,
    icon: 'FileImage',
    color: 'green',
    description: 'Imagen JPEG',
    mimeType: 'image/jpeg',
    extensions: ['.jpg', '.jpeg']
  },
  png: {
    viewer: ImageViewer,
    icon: 'FileImage',
    color: 'green',
    description: 'Imagen PNG',
    mimeType: 'image/png',
    extensions: ['.png']
  },
  gif: {
    viewer: ImageViewer,
    icon: 'FileImage',
    color: 'green',
    description: 'Imagen GIF',
    mimeType: 'image/gif',
    extensions: ['.gif']
  },
  svg: {
    viewer: ImageViewer,
    icon: 'FileImage',
    color: 'green',
    description: 'Imagen SVG',
    mimeType: 'image/svg+xml',
    extensions: ['.svg']
  },
  json: {
    viewer: JSONViewer,
    icon: 'Braces',
    color: 'yellow',
    description: 'Documento JSON',
    mimeType: 'application/json',
    extensions: ['.json']
  },
  zip: {
    viewer: ArchiveViewer,
    icon: 'Archive',
    color: 'purple',
    description: 'Archivo ZIP',
    mimeType: 'application/zip',
    extensions: ['.zip']
  },
  rar: {
    viewer: ArchiveViewer,
    icon: 'Archive',
    color: 'purple',
    description: 'Archivo RAR',
    mimeType: 'application/vnd.rar',
    extensions: ['.rar']
  },
  '7z': {
    viewer: ArchiveViewer,
    icon: 'Archive',
    color: 'purple',
    description: 'Archivo 7Z',
    mimeType: 'application/x-7z-compressed',
    extensions: ['.7z']
  },
  doc: {
    viewer: OfficeViewer,
    icon: 'FileWord',
    color: 'blue',
    description: 'Documento Word',
    mimeType: 'application/msword',
    extensions: ['.doc']
  },
  docx: {
    viewer: OfficeViewer,
    icon: 'FileWord',
    color: 'blue',
    description: 'Documento Word',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx']
  },
  xls: {
    viewer: OfficeViewer,
    icon: 'FileSpreadsheet',
    color: 'green',
    description: 'Documento Excel',
    mimeType: 'application/vnd.ms-excel',
    extensions: ['.xls']
  },
  xlsx: {
    viewer: OfficeViewer,
    icon: 'FileSpreadsheet',
    color: 'green',
    description: 'Documento Excel',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['.xlsx']
  },
  ppt: {
    viewer: OfficeViewer,
    icon: 'Presentation',
    color: 'orange',
    description: 'Presentación PowerPoint',
    mimeType: 'application/vnd.ms-powerpoint',
    extensions: ['.ppt']
  },
  pptx: {
    viewer: OfficeViewer,
    icon: 'Presentation',
    color: 'orange',
    description: 'Presentación PowerPoint',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['.pptx']
  },
  txt: {
    viewer: TextViewer,
    icon: 'FileText',
    color: 'gray',
    description: 'Documento de Texto',
    mimeType: 'text/plain',
    extensions: ['.txt']
  },
  csv: {
    viewer: TextViewer,
    icon: 'FileText',
    color: 'gray',
    description: 'Documento CSV',
    mimeType: 'text/csv',
    extensions: ['.csv']
  }
};

export class ComprehensiveFileTypeHandler {
  // Get viewer component for a file type
  static getViewerComponent(fileType: SupportedFileType): React.ComponentType<any> {
    const config = FILE_TYPE_CONFIG[fileType];
    return config ? config.viewer : FallbackViewer;
  }

  // Get file icon for a file type
  static getFileIcon(fileType: SupportedFileType): string {
    const config = FILE_TYPE_CONFIG[fileType];
    return config ? config.icon : 'File';
  }

  // Get file color for a file type
  static getFileColor(fileType: SupportedFileType): string {
    const config = FILE_TYPE_CONFIG[fileType];
    return config ? config.color : 'gray';
  }

  // Get file description for a file type
  static getFileDescription(fileType: SupportedFileType): string {
    const config = FILE_TYPE_CONFIG[fileType];
    return config ? config.description : 'Documento';
  }

  // Get MIME type for a file type
  static getMimeType(fileType: SupportedFileType): string {
    const config = FILE_TYPE_CONFIG[fileType];
    return config ? config.mimeType : 'application/octet-stream';
  }

  // Get file extensions for a file type
  static getFileExtensions(fileType: SupportedFileType): string[] {
    const config = FILE_TYPE_CONFIG[fileType];
    return config ? config.extensions : [];
  }

  // Determine file type from filename
  static determineFileTypeFromFilename(filename: string): SupportedFileType {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    // Special handling for common extensions
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'md':
        return 'md';
      case 'markdown':
        return 'markdown';
      case 'jpg':
      case 'jpeg':
        return 'jpg';
      case 'png':
        return 'png';
      case 'gif':
        return 'gif';
      case 'svg':
        return 'svg';
      case 'json':
        return 'json';
      case 'zip':
        return 'zip';
      case 'rar':
        return 'rar';
      case '7z':
        return '7z';
      case 'doc':
        return 'doc';
      case 'docx':
        return 'docx';
      case 'xls':
        return 'xls';
      case 'xlsx':
        return 'xlsx';
      case 'ppt':
        return 'ppt';
      case 'pptx':
        return 'pptx';
      case 'txt':
        return 'txt';
      case 'csv':
        return 'csv';
      default:
        return 'txt'; // Default to text for unknown types
    }
  }

  // Determine file type from MIME type
  static determineFileTypeFromMimeType(mimeType: string): SupportedFileType {
    // Normalize MIME type
    const normalizedMimeType = mimeType.toLowerCase().trim();
    
    // Match MIME type to file type
    for (const [fileType, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if (config.mimeType === normalizedMimeType) {
        return fileType as SupportedFileType;
      }
    }
    
    // Special handling for common MIME types
    if (normalizedMimeType.startsWith('image/')) {
      return 'jpg'; // Default image type
    }
    
    if (normalizedMimeType.startsWith('text/')) {
      return 'txt'; // Default text type
    }
    
    return 'txt'; // Default fallback
  }

  // Validate document metadata
  static validateDocumentMetadata(document: DocumentMetadata): boolean {
    // Check required fields
    if (!document.id) {
    // // console.warn('Document validation failed: Missing ID');
      return false;
    }
    
    if (!document.title) {
    // // console.warn('Document validation failed: Missing title');
      return false;
    }
    
    if (!document.filename) {
    // // console.warn('Document validation failed: Missing filename');
      return false;
    }
    
    if (!document.url) {
    // // console.warn('Document validation failed: Missing URL');
      return false;
    }
    
    if (!document.year || document.year < 2000 || document.year > new Date().getFullYear()) {
    // // console.warn('Document validation failed: Invalid year');
      return false;
    }
    
    if (!document.category) {
    // // console.warn('Document validation failed: Missing category');
      return false;
    }
    
    if (!document.size_mb) {
    // // console.warn('Document validation failed: Missing size');
      return false;
    }
    
    if (!document.processing_date) {
    // // console.warn('Document validation failed: Missing processing date');
      return false;
    }
    
    // Validate file type
    if (!FILE_TYPE_CONFIG[document.file_type]) {
    // // console.warn(`Document validation failed: Unsupported file type ${document.file_type}`);
      return false;
    }
    
    return true;
  }

  // Format file size
  static formatFileSize(sizeMb: string): string {
    const size = parseFloat(sizeMb);
    if (isNaN(size)) return sizeMb;
    
    if (size < 1) {
      return `${Math.round(size * 1024)} KB`;
    }
    
    return `${size.toFixed(2)} MB`;
  }

  // Get viewer props for a document
  static getViewerProps(document: DocumentMetadata): any {
    return {
      document,
      onError: (error: string) => {
        console.error(`Error in ${document.file_type} viewer:`, error);
      },
      onLoad: () => {
    // // console.log(`Successfully loaded ${document.file_type} document:`, document.title);
      }
    };
  }

  // Render viewer for a document
  static renderViewer(document: DocumentMetadata): React.ReactElement {
    // Validate document metadata first
    if (!this.validateDocumentMetadata(document)) {
      return (
        <FallbackViewer
          document={document}
          error="Metadatos del documento inválidos"
        />
      );
    }
    
    // Get appropriate viewer component
    const ViewerComponent = this.getViewerComponent(document.file_type);
    
    // Get viewer props
    const viewerProps = this.getViewerProps(document);
    
    // Render the viewer
    return <ViewerComponent {...viewerProps} />;
  }
}

export default ComprehensiveFileTypeHandler;