/**
 * Data Anonymization Service - Compliant with Argentine and Australian Privacy Laws
 * Automatically detects and anonymizes personal information before processing
 */

export interface PIIPattern {
  pattern: RegExp;
  replacement: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  legalBasis: {
    AR: string;
    AU: string;
  };
}

export interface AnonymizationResult {
  originalData: any;
  anonymizedData: any;
  detectedPII: DetectedPII[];
  anonymizationReport: AnonymizationReport;
  isCompliant: boolean;
}

export interface DetectedPII {
  type: string;
  count: number;
  locations: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  legalImplications: string[];
}

export interface AnonymizationReport {
  totalPIIDetected: number;
  criticalPII: number;
  successfullyAnonymized: number;
  failedAnonymization: number;
  complianceScore: number;
  recommendations: string[];
}

class DataAnonymizationService {
  // Comprehensive PII patterns for Argentina and Australia
  private piiPatterns: Record<string, PIIPattern> = {
    dni_ar: {
      pattern: /\b\d{7,8}\b/g,
      replacement: '[DNI-ANON]',
      description: 'Argentine National Identity Document',
      severity: 'critical',
      legalBasis: {
        AR: 'Ley 25.326 Art. 2 - Datos sensibles',
        AU: 'Privacy Act 1988 - Personal information'
      }
    },
    cuit_ar: {
      pattern: /\b\d{2}-\d{8}-\d{1}\b/g,
      replacement: '[CUIT-ANON]',
      description: 'Argentine Tax Identification Code',
      severity: 'high',
      legalBasis: {
        AR: 'Ley 25.326 Art. 5 - Información fiscal',
        AU: 'Privacy Act 1988 - Tax File Number'
      }
    },
    phone_ar: {
      pattern: /(\+?54[\s-]?)?(9[\s-]?)?\d{2,4}[\s-]?\d{6,8}/g,
      replacement: '[TEL-ANON]',
      description: 'Argentine Phone Number',
      severity: 'medium',
      legalBasis: {
        AR: 'Ley 25.326 Art. 2 - Datos personales',
        AU: 'Privacy Act 1988 - Contact information'
      }
    },
    email_personal: {
      pattern: /\b[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|live)\.[a-zA-Z]{2,}\b/g,
      replacement: '[EMAIL-ANON]',
      description: 'Personal Email Address',
      severity: 'medium',
      legalBasis: {
        AR: 'Ley 25.326 Art. 2 - Datos personales',
        AU: 'Privacy Act 1988 - Contact information'
      }
    },
    credit_card: {
      pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
      replacement: '[CARD-ANON]',
      description: 'Credit Card Number',
      severity: 'critical',
      legalBasis: {
        AR: 'Ley 25.326 Art. 2 - Datos financieros sensibles',
        AU: 'Privacy Act 1988 - Financial information'
      }
    },
    bank_account: {
      pattern: /\b\d{10,20}\b/g,
      replacement: '[ACCOUNT-ANON]',
      description: 'Bank Account Number',
      severity: 'critical',
      legalBasis: {
        AR: 'Ley 25.326 Art. 2 - Datos financieros',
        AU: 'Privacy Act 1988 - Financial information'
      }
    },
    home_address: {
      pattern: /\b\d+\s+[A-Za-z\s,]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Calle|Avenida)\s*\d*\b/gi,
      replacement: '[ADDRESS-ANON]',
      description: 'Home Address',
      severity: 'high',
      legalBasis: {
        AR: 'Ley 25.326 Art. 2 - Datos personales sensibles',
        AU: 'Privacy Act 1988 - Location information'
      }
    },
    tfn_au: {
      pattern: /\b\d{3}\s?\d{3}\s?\d{3}\b/g,
      replacement: '[TFN-ANON]',
      description: 'Australian Tax File Number',
      severity: 'critical',
      legalBasis: {
        AR: 'Datos fiscales equivalentes',
        AU: 'Tax File Number Guidelines - Protected information'
      }
    },
    medicare_au: {
      pattern: /\b\d{4}\s?\d{5}\s?\d{1}\b/g,
      replacement: '[MEDICARE-ANON]',
      description: 'Australian Medicare Number',
      severity: 'critical',
      legalBasis: {
        AR: 'Equivalente a datos de salud',
        AU: 'Human Services Act - Protected health information'
      }
    },
    passport: {
      pattern: /\b[A-Z]{1,2}\d{6,9}\b/g,
      replacement: '[PASSPORT-ANON]',
      description: 'Passport Number',
      severity: 'critical',
      legalBasis: {
        AR: 'Ley 25.326 Art. 2 - Documento de identidad',
        AU: 'Privacy Act 1988 - Government identifier'
      }
    },
    // Conservative name detection (only in specific contexts)
    potential_names: {
      pattern: /(?:Sr\.|Sra\.|Dr\.|Dra\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g,
      replacement: '[NAME-ANON]',
      description: 'Personal Name with Title',
      severity: 'medium',
      legalBasis: {
        AR: 'Ley 25.326 Art. 2 - Datos identificatorios',
        AU: 'Privacy Act 1988 - Personal information'
      }
    }
  };

  // Government official patterns (public information - careful handling)
  private officialPatterns = {
    mayor: /\b(Intendente|Mayor|Alcalde)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g,
    councillor: /\b(Concejal|Consejero|Councillor)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g,
    secretary: /\b(Secretario|Secretary)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g
  };

  async anonymizeData(data: any): Promise<AnonymizationResult> {
    console.log('🔒 Starting data anonymization process...');
    
    const detectedPII: DetectedPII[] = [];
    let dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const originalDataString = dataString;
    
    let totalDetected = 0;
    let successfullyAnonymized = 0;
    
    // Detect and anonymize PII
    for (const [type, pattern] of Object.entries(this.piiPatterns)) {
      const matches = dataString.match(pattern.pattern);
      if (matches && matches.length > 0) {
        const uniqueMatches = [...new Set(matches)];
        
        detectedPII.push({
          type,
          count: matches.length,
          locations: uniqueMatches,
          severity: pattern.severity,
          legalImplications: [
            pattern.legalBasis.AR,
            pattern.legalBasis.AU
          ]
        });
        
        totalDetected += matches.length;
        
        // Anonymize the data
        try {
          dataString = dataString.replace(pattern.pattern, pattern.replacement);
          successfullyAnonymized += matches.length;
          console.log(`🔒 Anonymized ${matches.length} instances of ${pattern.description}`);
        } catch (error) {
          console.error(`❌ Failed to anonymize ${type}:`, error);
        }
      }
    }

    // Handle government officials (public information)
    this.handleOfficialInformation(dataString);

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore(detectedPII, successfullyAnonymized, totalDetected);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(detectedPII);
    
    const anonymizationReport: AnonymizationReport = {
      totalPIIDetected: totalDetected,
      criticalPII: detectedPII.filter(pii => pii.severity === 'critical').reduce((sum, pii) => sum + pii.count, 0),
      successfullyAnonymized,
      failedAnonymization: totalDetected - successfullyAnonymized,
      complianceScore,
      recommendations
    };

    // Parse back to original format if needed
    let anonymizedData: any;
    try {
      if (typeof data === 'string') {
        anonymizedData = dataString;
      } else {
        anonymizedData = JSON.parse(dataString);
      }
    } catch (error) {
      // If parsing fails, return as string
      anonymizedData = dataString;
    }

    const result: AnonymizationResult = {
      originalData: data,
      anonymizedData,
      detectedPII,
      anonymizationReport,
      isCompliant: complianceScore >= 90 && anonymizationReport.criticalPII === 0
    };

    console.log(`✅ Anonymization complete: ${totalDetected} PII items processed, ${complianceScore}% compliance`);
    
    return result;
  }

  private handleOfficialInformation(dataString: string): string {
    // Government officials are public information but should be handled carefully
    // We preserve these but add context markers
    for (const [role, pattern] of Object.entries(this.officialPatterns)) {
      dataString = dataString.replace(pattern, (match) => {
        return `[PUBLIC-OFFICIAL: ${match}]`;
      });
    }
    return dataString;
  }

  private calculateComplianceScore(
    detectedPII: DetectedPII[], 
    successfullyAnonymized: number, 
    totalDetected: number
  ): number {
    let score = 100;
    
    // Penalize based on severity of unhandled PII
    const criticalCount = detectedPII.filter(pii => pii.severity === 'critical').reduce((sum, pii) => sum + pii.count, 0);
    const highCount = detectedPII.filter(pii => pii.severity === 'high').reduce((sum, pii) => sum + pii.count, 0);
    const mediumCount = detectedPII.filter(pii => pii.severity === 'medium').reduce((sum, pii) => sum + pii.count, 0);
    
    score -= criticalCount * 20; // -20 per critical PII
    score -= highCount * 10;     // -10 per high PII
    score -= mediumCount * 5;    // -5 per medium PII
    
    // Bonus for successful anonymization
    if (totalDetected > 0) {
      const anonymizationRate = (successfullyAnonymized / totalDetected) * 100;
      score = (score + anonymizationRate) / 2;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(detectedPII: DetectedPII[]): string[] {
    const recommendations: string[] = [];
    
    if (detectedPII.length === 0) {
      recommendations.push('No personal information detected - data is ready for processing');
      return recommendations;
    }
    
    const criticalPII = detectedPII.filter(pii => pii.severity === 'critical');
    if (criticalPII.length > 0) {
      recommendations.push('Critical personal information detected - ensure complete anonymization before public release');
      recommendations.push('Review data collection processes to minimize critical PII exposure');
    }
    
    const highPII = detectedPII.filter(pii => pii.severity === 'high');
    if (highPII.length > 0) {
      recommendations.push('High-sensitivity personal information found - apply additional protective measures');
    }
    
    if (detectedPII.some(pii => pii.type.includes('ar'))) {
      recommendations.push('Ensure compliance with Argentine Ley 25.326 (Data Protection Law)');
    }
    
    if (detectedPII.some(pii => pii.type.includes('au'))) {
      recommendations.push('Ensure compliance with Australian Privacy Act 1988');
    }
    
    recommendations.push('Implement regular PII scanning in data collection workflows');
    recommendations.push('Train staff on data privacy requirements for both jurisdictions');
    
    return recommendations;
  }

  // Check if data is safe to process after anonymization
  async validateAnonymizedData(anonymizationResult: AnonymizationResult): Promise<{
    isSafeToProcess: boolean;
    remainingRisks: string[];
    complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  }> {
    const { anonymizationReport, detectedPII } = anonymizationResult;
    
    const remainingRisks: string[] = [];
    
    // Check for critical PII
    if (anonymizationReport.criticalPII > 0) {
      remainingRisks.push('Critical personal information may still be present');
    }
    
    // Check for failed anonymization
    if (anonymizationReport.failedAnonymization > 0) {
      remainingRisks.push(`${anonymizationReport.failedAnonymization} PII items failed to anonymize`);
    }
    
    // Determine compliance status
    let complianceStatus: 'compliant' | 'warning' | 'non-compliant';
    if (anonymizationReport.complianceScore >= 95 && anonymizationReport.criticalPII === 0) {
      complianceStatus = 'compliant';
    } else if (anonymizationReport.complianceScore >= 80) {
      complianceStatus = 'warning';
    } else {
      complianceStatus = 'non-compliant';
    }
    
    const isSafeToProcess = complianceStatus === 'compliant' && remainingRisks.length === 0;
    
    return {
      isSafeToProcess,
      remainingRisks,
      complianceStatus
    };
  }

  // Generate anonymization report for compliance documentation
  generateComplianceReport(anonymizationResult: AnonymizationResult): {
    summary: string;
    legalCompliance: {
      argentina: string;
      australia: string;
    };
    technicalDetails: any;
    recommendations: string[];
  } {
    const { anonymizationReport, detectedPII } = anonymizationResult;
    
    const summary = `Data anonymization completed with ${anonymizationReport.complianceScore}% compliance score. 
      ${anonymizationReport.totalPIIDetected} personal information items detected and ${anonymizationReport.successfullyAnonymized} successfully anonymized.`;
    
    const legalCompliance = {
      argentina: anonymizationReport.complianceScore >= 90 
        ? 'Compliant with Ley 25.326 - Personal Data Protection'
        : 'Additional measures required for Ley 25.326 compliance',
      australia: anonymizationReport.complianceScore >= 90
        ? 'Compliant with Privacy Act 1988 - Personal Information Protection'
        : 'Additional measures required for Privacy Act 1988 compliance'
    };
    
    return {
      summary,
      legalCompliance,
      technicalDetails: anonymizationReport,
      recommendations: anonymizationReport.recommendations
    };
  }
}

export default new DataAnonymizationService();