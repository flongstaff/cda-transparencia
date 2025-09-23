export interface CaseRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  status: string;
  sources: string[];
  confidence: number;
  relatedDocuments: string[];
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  tags: string[];
  confidentiality: 'public' | 'restricted' | 'confidential';
}

export interface Municipality {
  id: string;
  name: string;
  population: number;
  budget: number;
  publicEmployees: number;
  transparencyIndex: number;
  lastUpdate: string;
}

export interface PublicSpending {
  category: string;
  amount: number;
  percentage: number;
  previousYear: number;
  change: number;
}

export interface Official {
  id: string;
  name: string;
  position: string;
  department: string;
  startDate: string;
  salary: number;
  declarationUrl?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  importance: 'low' | 'medium' | 'high';
  relatedCases?: string[];
}

export interface PerformanceMetric {
  officialId: string;
  metrics: {
    attendanceRate: number;
    projectsCompleted: number;
    budgetExecution: number;
    citizenSatisfaction: number;
    transparencyScore: number;
  };
  period: string;
}

// Export document types
export * from './documents';