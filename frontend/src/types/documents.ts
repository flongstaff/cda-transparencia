// Comprehensive document type definitions

export type DocumentVerificationStatus = 'verified' | 'pending' | 'failed';

export type SupportedFileType = 
  | 'pdf'
  | 'markdown'
  | 'md'
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'gif'
  | 'svg'
  | 'json'
  | 'zip'
  | 'rar'
  | '7z'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'txt'
  | 'csv'
  | 'other';

export interface BaseDocument {
  id: string;
  title: string;
  filename: string;
  year: number;
  category: string;
  size_mb: string;
  url: string;
  official_url: string;
  verification_status: DocumentVerificationStatus;
  processing_date: string;
  relative_path?: string;
  content?: string;
  file_type: SupportedFileType;
}

export interface PDFDocument extends BaseDocument {
  file_type: 'pdf';
}

export interface MarkdownDocument extends BaseDocument {
  file_type: 'markdown' | 'md';
}

export interface ImageDocument extends BaseDocument {
  file_type: 'jpg' | 'jpeg' | 'png' | 'gif' | 'svg';
  format: 'jpg' | 'jpeg' | 'png' | 'gif' | 'svg';
}

export interface JSONDocument extends BaseDocument {
  file_type: 'json';
}

export interface ArchiveDocument extends BaseDocument {
  file_type: 'zip' | 'rar' | '7z';
  format: 'zip' | 'rar' | '7z';
}

export interface OfficeDocument extends BaseDocument {
  file_type: 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx';
  format: 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx';
}

export interface TextDocument extends BaseDocument {
  file_type: 'txt' | 'csv';
  format: 'txt' | 'csv';
}

export type DocumentMetadata = 
  | PDFDocument
  | MarkdownDocument
  | ImageDocument
  | JSONDocument
  | ArchiveDocument
  | OfficeDocument
  | TextDocument
  | BaseDocument;

export interface CategoryData {
  name: string;
  documents: DocumentMetadata[];
  count: number;
}

export interface YearlyData {
  year: number;
  categories: Record<string, CategoryData>;
  totalDocuments: number;
  verifiedDocuments: number;
}

export interface DocumentIndex {
  [year: number]: YearlyData;
}

// Error types
export class DocumentServiceError extends Error {
  constructor(
    message: string,
    public code: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'NOT_FOUND' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DocumentServiceError';
  }
}

// File type configuration
export const FILE_TYPE_CONFIG: Record<SupportedFileType, {
  viewer: string;
  icon: string;
  color: string;
  description: string;
}> = {
  pdf: { viewer: 'PDFViewer', icon: 'FileText', color: 'red', description: 'Documento PDF' },
  markdown: { viewer: 'MarkdownViewer', icon: 'BookOpen', color: 'blue', description: 'Documento Markdown' },
  md: { viewer: 'MarkdownViewer', icon: 'BookOpen', color: 'blue', description: 'Documento Markdown' },
  jpg: { viewer: 'ImageViewer', icon: 'FileImage', color: 'green', description: 'Imagen JPG' },
  jpeg: { viewer: 'ImageViewer', icon: 'FileImage', color: 'green', description: 'Imagen JPEG' },
  png: { viewer: 'ImageViewer', icon: 'FileImage', color: 'green', description: 'Imagen PNG' },
  gif: { viewer: 'ImageViewer', icon: 'FileImage', color: 'green', description: 'Imagen GIF' },
  svg: { viewer: 'ImageViewer', icon: 'FileImage', color: 'green', description: 'Imagen SVG' },
  json: { viewer: 'JSONViewer', icon: 'Code', color: 'yellow', description: 'Documento JSON' },
  zip: { viewer: 'ArchiveViewer', icon: 'Archive', color: 'purple', description: 'Archivo ZIP' },
  rar: { viewer: 'ArchiveViewer', icon: 'Archive', color: 'purple', description: 'Archivo RAR' },
  '7z': { viewer: 'ArchiveViewer', icon: 'Archive', color: 'purple', description: 'Archivo 7Z' },
  doc: { viewer: 'OfficeViewer', icon: 'FileText', color: 'blue', description: 'Documento Word' },
  docx: { viewer: 'OfficeViewer', icon: 'FileText', color: 'blue', description: 'Documento Word' },
  xls: { viewer: 'OfficeViewer', icon: 'FileText', color: 'green', description: 'Documento Excel' },
  xlsx: { viewer: 'OfficeViewer', icon: 'FileText', color: 'green', description: 'Documento Excel' },
  ppt: { viewer: 'OfficeViewer', icon: 'FileText', color: 'orange', description: 'Presentación PowerPoint' },
  pptx: { viewer: 'OfficeViewer', icon: 'FileText', color: 'orange', description: 'Presentación PowerPoint' },
  txt: { viewer: 'TextViewer', icon: 'FileText', color: 'gray', description: 'Documento de Texto' },
  csv: { viewer: 'TextViewer', icon: 'FileText', color: 'gray', description: 'Documento CSV' },
  other: { viewer: 'GenericViewer', icon: 'File', color: 'gray', description: 'Documento' }
};