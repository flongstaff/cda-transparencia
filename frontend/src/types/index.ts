// Define types used across the application

export interface Dataset {
  id: string;
  title: string;
  description: string;
  category: string;
  formats: string[];
  size: string;
  lastUpdated: string;
  url: string;
  accessibility: {
    compliant: boolean;
    standards: string[];
  };
  source: string;
  license: string;
  tags: string[];
  updateFrequency: string;
  downloads: number;
}

export interface PDFDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  lastUpdated: string;
  url: string;
  tags: string[];
  source: string;
  page: string;
}