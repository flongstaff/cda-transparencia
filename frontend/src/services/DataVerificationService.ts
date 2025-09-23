export interface VerificationResult {
  document_id: string;
  title: string;
  category: string;
  source: string;
  verification_status: 'verified' | 'pending' | 'failed';
  verification_date: string;
  verification_method: string;
  integrity_check: boolean;
  completeness_check: boolean;
  consistency_check: boolean;
  issues: string[];
}

export interface VerificationReport {
  total_documents: number;
  verified_documents: number;
  pending_verification: number;
  failed_verification: number;
  verification_rate: number;
  by_source: Record<string, VerificationResult[]>;
  by_category: Record<string, VerificationResult[]>;
  issues_summary: string[];
  last_verification: string;
}

export interface Document {
  id: string;
  title: string;
  category: string;
  source: string;
  type: string;
  filename: string;
  size_mb: number;
  url: string;
  year: number;
  verified: boolean;
  processing_date: string;
  integrity_verified: boolean;
}

export class DataVerificationService {
  private static instance: DataVerificationService;
  private verificationCache = new Map<string, VerificationResult>();

  private constructor() {}

  public static getInstance(): DataVerificationService {
    if (!DataVerificationService.instance) {
      DataVerificationService.instance = new DataVerificationService();
    }
    return DataVerificationService.instance;
  }

  // Verify all documents across all data sources
  public async verifyAllDocuments(documentsToVerify: Document[]): Promise<VerificationReport> { // Accept documents as parameter
    try {
      // Verify each document
      const verificationResults: VerificationResult[] = [];
      const bySource: Record<string, VerificationResult[]> = {};
      const byCategory: Record<string, VerificationResult[]> = {};

      for (const doc of documentsToVerify) { // Iterate over passed documents
        const result = await this.verifyDocument(doc);
        verificationResults.push(result);
        
        // Group by source
        if (!bySource[result.source]) {
          bySource[result.source] = [];
        }
        bySource[result.source].push(result);
        
        // Group by category
        if (!byCategory[result.category]) {
          byCategory[result.category] = [];
        }
        byCategory[result.category].push(result);
      }

      // Generate report
      const report: VerificationReport = {
        total_documents: verificationResults.length,
        verified_documents: verificationResults.filter(r => r.verification_status === 'verified').length,
        pending_verification: verificationResults.filter(r => r.verification_status === 'pending').length,
        failed_verification: verificationResults.filter(r => r.verification_status === 'failed').length,
        verification_rate: verificationResults.length > 0 ? 
          (verificationResults.filter(r => r.verification_status === 'verified').length / verificationResults.length) * 100 : 0,
        by_source: bySource,
        by_category: byCategory,
        issues_summary: this.generateIssuesSummary(verificationResults),
        last_verification: new Date().toISOString()
      };

      return report;
    } catch (error) {
      console.error('Error verifying documents:', error);
      throw error;
    }
  }

  // Verify a single document
  public async verifyDocument(doc: Document): Promise<VerificationResult> {
    const cacheKey = `${doc.source}-${doc.id || doc.title || doc.filename}`;
    
    // Check cache first
    if (this.verificationCache.has(cacheKey)) {
      return this.verificationCache.get(cacheKey)!;
    }

    const result: VerificationResult = {
      document_id: doc.id || doc.title || doc.filename,
      title: doc.title || doc.filename || 'Unknown Document',
      category: doc.category || 'general',
      source: doc.source || 'unknown',
      verification_status: 'pending',
      verification_date: new Date().toISOString(),
      verification_method: 'automated',
      integrity_check: false,
      completeness_check: false,
      consistency_check: false,
      issues: []
    };

    try {
      // Perform verification checks
      const integrityCheck = await this.checkDocumentIntegrity(doc);
      const completenessCheck = await this.checkDocumentCompleteness(doc);
      const consistencyCheck = await this.checkDocumentConsistency(doc);

      result.integrity_check = integrityCheck.passed;
      result.completeness_check = completenessCheck.passed;
      result.consistency_check = consistencyCheck.passed;
      result.issues = [...integrityCheck.issues, ...completenessCheck.issues, ...consistencyCheck.issues];

      // Determine overall verification status
      if (result.integrity_check && result.completeness_check && result.consistency_check) {
        result.verification_status = 'verified';
      } else if (result.issues.length > 0) {
        result.verification_status = 'failed';
      } else {
        result.verification_status = 'pending';
      }

      // Cache the result
      this.verificationCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`Error verifying document ${result.document_id}:`, error);
      result.verification_status = 'failed';
      result.issues.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  // Check document integrity
  private async checkDocumentIntegrity(doc: Document): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    let passed = true;

    // Check required fields
    const requiredFields = ['id', 'title', 'category', 'source'];
    for (const field of requiredFields) {
      if (!doc[field as keyof Document]) {
        issues.push(`Missing required field: ${field}`);
        passed = false;
      }
    }

    // Check for valid year if provided
    if (doc.year && (doc.year < 2020 || doc.year > new Date().getFullYear() + 1)) {
      issues.push(`Invalid year: ${doc.year}`);
      passed = false;
    }

    return { passed, issues };
  }

  // Check document completeness
  private async checkDocumentCompleteness(doc: Document): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    let passed = true;

    // Check for size information
    if (!doc.size_mb) {
      issues.push('Missing size information');
      passed = false;
    }

    // Check for date information
    if (!doc.processing_date) {
      issues.push('Missing date information');
      passed = false;
    }

    // Check for verification status
    if (doc.verified === undefined) {
      issues.push('Missing verification status');
      passed = false;
    }

    return { passed, issues };
  }

  // Check document consistency
  private async checkDocumentConsistency(doc: Document): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    let passed = true;

    // Check filename consistency
    if (doc.filename && doc.title) {
      const filenameBase = doc.filename.replace(/\.[^/.]+$/, '');
      const titleBase = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (filenameBase.length > 10 && !titleBase.includes(filenameBase.substring(0, 10))) {
        issues.push('Filename and title may not be related');
        passed = false;
      }
    }

    // Check category consistency
    if (doc.category && doc.type) {
      const categoryTypeMap: Record<string, string[]> = {
        'budget': ['pdf', 'excel', 'json'],
        'debt': ['pdf', 'excel', 'json'],
        'salary': ['pdf', 'excel'],
        'audit': ['pdf', 'json'],
        'financial': ['pdf', 'excel', 'json'],
        'general': ['pdf', 'excel', 'json', 'markdown']
      };

      const expectedTypes = categoryTypeMap[doc.category.toLowerCase()];
      if (expectedTypes && !expectedTypes.includes(doc.type.toLowerCase())) {
        issues.push(`Document type ${doc.type} may not be appropriate for category ${doc.category}`);
        passed = false;
      }
    }

    return { passed, issues };
  }

  // Generate issues summary
  private generateIssuesSummary(results: VerificationResult[]): string[] {
    const issues: string[] = [];
    const issueCounts: Record<string, number> = {};

    results.forEach(result => {
      result.issues.forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });

    // Group similar issues
    Object.entries(issueCounts).forEach(([issue, count]) => {
      if (count > 1) {
        issues.push(`${issue} (${count} documents)`);
      } else {
        issues.push(issue);
      }
    });

    return issues;
  }

  // Get verification status for a specific document
  public getVerificationStatus(documentId: string): VerificationResult | null {
    for (const result of this.verificationCache.values()) {
      if (result.document_id === documentId) {
        return result;
      }
    }
    return null;
  }

  // Clear verification cache
  public clearCache() {
    this.verificationCache.clear();
  }
}

// Export singleton instance
export const dataVerificationService = DataVerificationService.getInstance();
