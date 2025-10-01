/**
 * Document Analysis Service for Carmen de Areco Transparency Portal
 * Frontend service for interacting with the document analysis API
 * Following AAIP guidelines for transparency and data protection
 */

import { buildApiUrl } from '../config/apiConfig';

// Define types for document analysis results
export interface DocumentClassification {
  categoryId: string;
  categoryName: string;
  confidence: number;
  allScores: Array<{
    id: string;
    name: string;
    score: number;
  }>;
}

export interface ExtractedInformation {
  amounts: Array<{
    value: string;
    context: string;
  }>;
  dates: Array<{
    date: string;
    context: string;
  }>;
  parties: Array<{
    entity: string;
    context: string;
  }>;
  keyFacts: Array<{
    type: string;
    content: string;
    context: string;
  }>;
  sensitive: boolean;
}

export interface DocumentSummary {
  title: string;
  category: string;
  confidence: number;
  keyPoints: string[];
  financialHighlights: string[];
  timeline: string[];
  entities: string[];
  amounts: Array<{
    value: string;
    context: string;
  }>;
  recommendations: string[];
}

export interface DocumentAnalysisResult {
  originalPath: string;
  textContent: string;
  classification: DocumentClassification;
  extractedInformation: ExtractedInformation;
  summary: DocumentSummary;
  processingMetadata: {
    processedAt: string;
    textLength: number;
    wordCount: number;
    languageDetected: string;
  };
  aiProcessing: {
    method: string;
    model: string;
    confidence: number;
    explainable: boolean;
  };
  compliance: {
    aiProcessed: boolean;
    aiMethod: string;
    humanReviewRequired: boolean;
    privacyCompliant: boolean;
    dataProtectionApplied: boolean;
    follows_AAIP_guidelines: boolean;
    transparency_ensured: boolean;
    privacy_protected: boolean;
  };
  apiInfo: {
    version: string;
    processedAt: string;
  };
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  requiredFields: string[];
  aiProcessing: {
    extractionEnabled: boolean;
    fields: string[];
  };
  compliance: {
    aaipCategory: boolean;
    transparencyIndex: boolean;
  };
}

export interface DocumentAnalysisBatchResult {
  processedCount: number;
  successfulCount: number;
  results: Array<DocumentAnalysisResult | { path: string; error: string; processingMetadata: { processedAt: string } }>;
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
  };
  compliance: {
    batchProcessed: boolean;
    privacyMaintained: boolean;
    allDocumentsHandledSecurely: boolean;
  };
  apiInfo: {
    version: string;
    processedAt: string;
  };
}

export interface DocumentAnalysisStandards {
  processingStandards: {
    compliance: {
      aaipGuidelines: boolean;
      dataProtection: boolean;
      transparencyRequirements: boolean;
    };
    privacy: {
      noPersonalData: boolean;
      anonymizationApplied: boolean;
      dataMinimization: boolean;
    };
    quality: {
      accuracyThreshold: number;
      verificationRequired: boolean;
      humanReview: boolean;
    };
  };
  compliance: {
    follows_aaip_guidelines: boolean;
    wcag_compliant: boolean;
    data_protection_focused: boolean;
  };
  capabilities: {
    classification_accuracy: any;
    supported_formats: string[];
    multi_language: string[];
  };
  aiTransparency: {
    explainable_ai: boolean;
    human_review_capable: boolean;
    bias_mitigation: boolean;
  };
  apiInfo: {
    version: string;
    lastUpdated: string;
  };
}

class DocumentAnalysisService {
  private static instance: DocumentAnalysisService;
  private readonly ANALYSIS_ENDPOINT = '/documents';

  static getInstance(): DocumentAnalysisService {
    if (!DocumentAnalysisService.instance) {
      DocumentAnalysisService.instance = new DocumentAnalysisService();
    }
    return DocumentAnalysisService.instance;
  }

  /**
   * Analyze a single document
   */
  async analyzeDocument(file: File): Promise<DocumentAnalysisResult> {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(buildApiUrl(`${this.ANALYSIS_ENDPOINT}/analyze`), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis request failed: ${response.status} ${response.statusText}`);
      }

      const data: DocumentAnalysisResult = await response.json();
      return data;
    } catch (error) {
      console.error('Document analysis error:', error);
      throw error;
    }
  }

  /**
   * Get available document categories
   */
  async getDocumentCategories(): Promise<DocumentCategory[]> {
    try {
      const response = await fetch(buildApiUrl(`${this.ANALYSIS_ENDPOINT}/categories`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Categories request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Document categories error:', error);
      return [];
    }
  }

  /**
   * Get document analysis processing standards
   */
  async getProcessingStandards(): Promise<DocumentAnalysisStandards> {
    try {
      const response = await fetch(buildApiUrl(`${this.ANALYSIS_ENDPOINT}/standards`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Standards request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Processing standards error:', error);
      return {
        processingStandards: {
          compliance: {
            aaipGuidelines: true,
            dataProtection: true,
            transparencyRequirements: true
          },
          privacy: {
            noPersonalData: true,
            anonymizationApplied: true,
            dataMinimization: true
          },
          quality: {
            accuracyThreshold: 0.85,
            verificationRequired: true,
            humanReview: true
          }
        },
        compliance: {
          follows_aaip_guidelines: true,
          wcag_compliant: true,
          data_protection_focused: true
        },
        capabilities: {
          classification_accuracy: null,
          supported_formats: ['PDF', 'DOCX', 'TXT', 'CSV', 'XLS', 'XLSX'],
          multi_language: ['es']
        },
        aiTransparency: {
          explainable_ai: true,
          human_review_capable: true,
          bias_mitigation: true
        },
        apiInfo: {
          version: '1.0',
          lastUpdated: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Analyze multiple documents in batch
   */
  async analyzeDocumentBatch(files: File[]): Promise<DocumentAnalysisBatchResult> {
    if (files.length > 10) {
      throw new Error('Cannot process more than 10 files at once');
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      const response = await fetch(buildApiUrl(`${this.ANALYSIS_ENDPOINT}/analyze-batch`), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Batch analysis request failed: ${response.status} ${response.statusText}`);
      }

      const data: DocumentAnalysisBatchResult = await response.json();
      return data;
    } catch (error) {
      console.error('Batch document analysis error:', error);
      throw error;
    }
  }

  /**
   * Extract key information from analysis results
   */
  extractKeyInformation(analysis: DocumentAnalysisResult): any {
    return {
      category: analysis.classification.categoryName,
      confidence: analysis.classification.confidence,
      keyFacts: analysis.summary.keyPoints,
      financialHighlights: analysis.summary.financialHighlights,
      entities: analysis.summary.entities,
      timeline: analysis.summary.timeline,
      recommendations: analysis.summary.recommendations,
      textLength: analysis.processingMetadata.textLength,
      wordCount: analysis.processingMetadata.wordCount
    };
  }

  /**
   * Check if analysis requires human review
   */
  requiresHumanReview(analysis: DocumentAnalysisResult): boolean {
    return analysis.compliance.humanReviewRequired || 
           analysis.extractedInformation.sensitive || 
           analysis.classification.confidence < 0.7; // Low confidence documents
  }

  /**
   * Format analysis results for display
   */
  formatAnalysisResults(analysis: DocumentAnalysisResult): any {
    return {
      documentInfo: {
        title: analysis.summary.title,
        category: analysis.summary.category,
        confidence: Math.round(analysis.summary.confidence * 100) + '%',
        textLength: analysis.processingMetadata.textLength,
        wordCount: analysis.processingMetadata.wordCount
      },
      classification: {
        category: analysis.classification.categoryName,
        confidence: Math.round(analysis.classification.confidence * 100) + '%',
        allCategories: analysis.classification.allScores
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(cat => `${cat.name} (${Math.round((cat.score / Math.max(...analysis.classification.allScores.map(c => c.score))) * 100)}%)`)
      },
      extractedInformation: {
        amounts: analysis.extractedInformation.amounts.map(a => a.value),
        dates: analysis.extractedInformation.dates.map(d => d.date),
        entities: Array.from(new Set(analysis.extractedInformation.parties.map(p => p.entity))).slice(0, 5),
        keyFacts: analysis.extractedInformation.keyFacts.map(f => f.content).slice(0, 10)
      },
      summary: {
        keyPoints: analysis.summary.keyPoints,
        financialHighlights: analysis.summary.financialHighlights,
        timeline: analysis.summary.timeline,
        recommendations: analysis.summary.recommendations
      },
      aiTransparency: {
        method: analysis.aiProcessing.method,
        explainable: analysis.aiProcessing.explainable,
        humanReviewRequired: analysis.compliance.humanReviewRequired
      },
      compliance: {
        aiProcessed: analysis.compliance.aiProcessed,
        privacyCompliant: analysis.compliance.privacyCompliant,
        aaipCompliant: analysis.compliance.follows_AAIP_guidelines
      }
    };
  }
}

export const documentAnalysisService = DocumentAnalysisService.getInstance();