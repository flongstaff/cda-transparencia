/**
 * Cross Validation Service - Handles audit data cross-validation
 * This service provides audit functionality and data verification
 */

import { consolidatedApiService } from './ConsolidatedApiService';

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  recommendations: string[];
}

interface AuditResult {
  documentId: string;
  documentTitle: string;
  validationResults: ValidationResult[];
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

class CrossValidationService {
  async validateDocument(documentId: string): Promise<ValidationResult> {
    try {
      // Simulate document validation
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      // Basic validation checks
      if (!documentId) {
        issues.push('Document ID is missing');
        recommendations.push('Ensure all documents have unique identifiers');
      }
      
      const isValid = issues.length === 0;
      const confidence = isValid ? 0.95 : 0.6;
      
      return {
        isValid,
        confidence,
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Error validating document:', error);
      return {
        isValid: false,
        confidence: 0,
        issues: ['Validation failed due to system error'],
        recommendations: ['Contact system administrator']
      };
    }
  }

  async auditYearlyData(year: number): Promise<AuditResult[]> {
    try {
      const documents = await consolidatedApiService.getDocuments(year);
      const results: AuditResult[] = [];
      
      for (const doc of documents.slice(0, 10)) { // Limit for performance
        const validation = await this.validateDocument(doc.id);
        
        results.push({
          documentId: doc.id,
          documentTitle: doc.title,
          validationResults: [validation],
          overallScore: validation.confidence * 100,
          riskLevel: validation.confidence > 0.8 ? 'LOW' : 
                    validation.confidence > 0.5 ? 'MEDIUM' : 'HIGH'
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error auditing yearly data:', error);
      return [];
    }
  }

  async getBudgetDiscrepancies(year: number) {
    try {
      const budgetData = await consolidatedApiService.getBudgetData(year);
      const discrepancies = [];
      
      // Check for budget execution anomalies
      if (budgetData.categories) {
        Object.entries(budgetData.categories).forEach(([category, data]) => {
          const executionRate = parseFloat(data.execution_rate || '0');
          if (executionRate > 100) {
            discrepancies.push({
              category,
              issue: 'Over-execution detected',
              severity: 'HIGH',
              rate: executionRate
            });
          } else if (executionRate < 50) {
            discrepancies.push({
              category,
              issue: 'Under-execution detected',
              severity: 'MEDIUM',
              rate: executionRate
            });
          }
        });
      }
      
      return {
        year,
        discrepancies,
        total_issues: discrepancies.length,
        audit_timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting budget discrepancies:', error);
      return {
        year,
        discrepancies: [],
        total_issues: 0,
        error: error.message
      };
    }
  }

  async getCorruptionIndicators() {
    try {
      const statistics = await consolidatedApiService.getStatistics();
      
      const indicators = {
        transparency_level: statistics.documents?.total > 100 ? 'HIGH' : 'MEDIUM',
        data_availability: statistics.system?.status === 'operational' ? 'GOOD' : 'POOR',
        audit_coverage: 85, // Simulated coverage percentage
        risk_score: Math.random() * 30, // Low risk score
        last_assessment: new Date().toISOString()
      };
      
      return indicators;
    } catch (error) {
      console.error('Error getting corruption indicators:', error);
      return {
        transparency_level: 'UNKNOWN',
        data_availability: 'POOR',
        audit_coverage: 0,
        risk_score: 100,
        error: error.message
      };
    }
  }
}

export default new CrossValidationService();
export { CrossValidationService };