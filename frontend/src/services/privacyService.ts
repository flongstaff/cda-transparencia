/**
 * Privacy Service for Carmen de Areco Transparency Portal
 * Frontend service for privacy-related functionality
 * Following AAIP guidelines and Ley 25.326 compliance
 */

import { buildApiUrl } from '../config/apiConfig';

// Define types for privacy-related data
export interface PrivacyPolicy {
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  title: string;
  jurisdiction: string;
  governingLaws: string[];
  policySections: PolicySection[];
  compliance: ComplianceInfo;
  policyUpdates: PolicyUpdateInfo;
}

export interface PolicySection {
  id: string;
  title: string;
  content: string;
  personalDataTypes?: string[];
  nonPersonalDataTypes?: string[];
  legalBases?: LegalBasis[];
  purposes?: string[];
  dataRetention?: string;
  recipients?: string[];
  thirdParties?: ThirdPartyInfo;
}

export interface LegalBasis {
  basis: string;
  description: string;
}

export interface ThirdPartyInfo {
  analyticsProviders: boolean;
  marketingProviders: boolean;
  researchProviders: boolean;
}

export interface ComplianceInfo {
  aaipGuidelines: boolean;
  ley25326Compliance: boolean;
  ley27275Alignment: boolean;
  gdprPrinciples: boolean;
  dataMinimization: boolean;
  purposeLimitation: boolean;
  storageLimitation: boolean;
  integrityAndConfidentiality: boolean;
}

export interface PolicyUpdateInfo {
  updateNotification: string;
  lastReviewDate: string;
  nextReviewDate: string;
}

export interface DataMapping {
  version: string;
  lastUpdated: string;
  mappingDate: string;
  system: string;
  dataFlows: DataFlow[];
  dataCategories: Record<string, DataCategory>;
  retentionPolicies: Record<string, string>;
  compliance: ComplianceInfo;
  dataProtectionOfficer: DPOInfo;
}

export interface DataFlow {
  id: string;
  name: string;
  description: string;
  dataTypes: DataType[];
  storageLocation: string;
  accessControls: string;
  sharing: string;
  legalBasis: string;
  dataSubjectRights: string[];
  dataProtectionMeasures: string[];
}

export interface DataType {
  name: string;
  category: string;
  sensitivity: string;
  retentionPeriod: string;
  isPersonalData: boolean;
  purpose: string;
}

export interface DataCategory {
  name: string;
  description: string;
  protectionLevel: string;
}

export interface DPOInfo {
  name: string;
  email: string;
  responsibilities: string[];
}

export interface DataRightsRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'opposition' | 'limitation';
  requestData: any;
  submittedAt: string;
  status: 'pending' | 'completed' | 'rejected';
  processedAt?: string;
  result?: {
    message: string;
    data?: any;
  };
  compliance: ComplianceInfo;
}

export interface PrivacyImpactAssessment {
  id: string;
  feature: string;
  date: string;
  assessment: AssessmentDetails;
  recommendations: string[];
  status: string;
}

export interface AssessmentDetails {
  dataTypesProcessed: string[];
  personalDataInvolved: boolean;
  dataMinimizationApplied: boolean;
  purposeLimitation: boolean;
  storageLimitation: boolean;
  securityMeasures: string[];
  risks: string[];
  mitigationMeasures: string[];
  complianceCheck: ComplianceInfo;
}

export interface DataReport {
  userId: string;
  reportDate: string;
  dataTypesCollected: string[];
  retentionDates: Record<string, string>;
  processingPurposes: string[];
  legalBases: string[];
  dataRecipients: string[];
  compliance: ComplianceInfo;
}

export interface ComplianceCheckResult {
  activity: string;
  timestamp: string;
  checks: Record<string, boolean>;
  complianceScore: number;
  recommendations: string[];
  status: string;
  details: Record<string, string>;
  compliance: ComplianceInfo;
}

export interface DataHandlingPrinciples {
  dataMinimization: {
    description: string;
    implementation: string;
  };
  purposeLimitation: {
    description: string;
    implementation: string;
  };
  storageLimitation: {
    description: string;
    implementation: string;
  };
  integrityAndConfidentiality: {
    description: string;
    implementation: string;
  };
}

export interface PrivacySettings {
  privacySettings: {
    dataSharing: boolean;
    analyticsTracking: boolean;
    marketingCommunication: boolean;
    cookieConsent: {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
    };
  };
  userControl: {
    granularControls: boolean;
    easyToUse: boolean;
    accessible: boolean;
  };
  compliance: ComplianceInfo;
}

class PrivacyService {
  private static instance: PrivacyService;
  private readonly PRIVACY_ENDPOINT = '/privacy';

  static getInstance(): PrivacyService {
    if (!PrivacyService.instance) {
      PrivacyService.instance = new PrivacyService();
    }
    return PrivacyService.instance;
  }

  /**
   * Get the current privacy policy
   */
  async getPrivacyPolicy(): Promise<PrivacyPolicy> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/policy`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Privacy policy request failed: ${response.status} ${response.statusText}`);
      }

      const data: PrivacyPolicy = await response.json();
      return data;
    } catch (error) {
      console.error('Privacy policy error:', error);
      // Return a basic policy structure if API call fails
      return {
        version: '1.0',
        effectiveDate: '2025-01-01',
        lastUpdated: new Date().toISOString(),
        title: 'Política de Privacidad - Portal de Transparencia Carmen de Areco',
        jurisdiction: 'Argentina',
        governingLaws: [],
        policySections: [],
        compliance: {
          aaipGuidelines: true,
          ley25326Compliance: true,
          ley27275Alignment: true,
          gdprPrinciples: true,
          dataMinimization: true,
          purposeLimitation: true,
          storageLimitation: true,
          integrityAndConfidentiality: true
        },
        policyUpdates: {
          updateNotification: 'Las actualizaciones se publicarán en esta página',
          lastReviewDate: new Date().toISOString(),
          nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months
        }
      };
    }
  }

  /**
   * Get data mapping information
   */
  async getDataMapping(): Promise<DataMapping> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/data-mapping`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Data mapping request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Data mapping error:', error);
      // Return a basic mapping structure if API call fails
      return {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        mappingDate: new Date().toISOString(),
        system: 'Carmen de Areco Transparency Portal',
        dataFlows: [],
        dataCategories: {},
        retentionPolicies: {},
        compliance: {
          aaipGuidelines: true,
          ley25326Compliance: true,
          ley27275Alignment: true,
          gdprPrinciples: true,
          dataMinimization: true,
          purposeLimitation: true,
          storageLimitation: true,
          integrityAndConfidentiality: true
        },
        dataProtectionOfficer: {
          name: 'Delegado de Protección de Datos',
          email: 'dpo@carmendeareco.gob.ar',
          responsibilities: []
        }
      };
    }
  }

  /**
   * Submit a data rights request (ARCO + rights)
   */
  async submitDataRightsRequest(requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'opposition' | 'limitation', data?: any): Promise<DataRightsRequest> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/data-rights`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: requestType,
          data: data || {}
        })
      });

      if (!response.ok) {
        throw new Error(`Data rights request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Data rights request error:', error);
      throw error;
    }
  }

  /**
   * Perform a privacy impact assessment for a feature
   */
  async performPIA(featureDescription: string): Promise<PrivacyImpactAssessment> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/impact-assessment`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featureDescription })
      });

      if (!response.ok) {
        throw new Error(`PIA request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Privacy impact assessment error:', error);
      throw error;
    }
  }

  /**
   * Get data report for a specific user
   */
  async getUserDataReport(userId: string): Promise<DataReport> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/data-report/${userId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Data report request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Data report error:', error);
      throw error;
    }
  }

  /**
   * Perform a compliance check for a processing activity
   */
  async checkCompliance(processingActivity: string): Promise<ComplianceCheckResult> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/compliance-check`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ processingActivity })
      });

      if (!response.ok) {
        throw new Error(`Compliance check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Compliance check error:', error);
      throw error;
    }
  }

  /**
   * Get data handling principles information
   */
  async getDataHandlingInfo(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/data-handling`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Data handling info request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Data handling info error:', error);
      // Return basic info if API call fails
      return {
        dataHandlingPrinciples: {
          dataMinimization: {
            description: 'Solo se recopila la información necesaria',
            implementation: 'Validación en cada punto de entrada'
          },
          purposeLimitation: {
            description: 'Datos para fines determinados y explícitos',
            implementation: 'Documentación de propósitos'
          }
        },
        userRights: [
          'Derecho de acceso',
          'Derecho de rectificación',
          'Derecho de cancelación',
          'Derecho de oposición'
        ],
        compliance: {
          follows_aaip_guidelines: true,
          ley25326_compliant: true
        }
      };
    }
  }

  /**
   * Get privacy settings for the user
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/settings`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Privacy settings request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Privacy settings error:', error);
      // Return default settings if API call fails
      return {
        privacySettings: {
          dataSharing: false,
          analyticsTracking: false,
          marketingCommunication: false,
          cookieConsent: {
            necessary: true,
            analytics: false,
            marketing: false
          }
        },
        userControl: {
          granularControls: true,
          easyToUse: true,
          accessible: true
        },
        compliance: {
          aaipGuidelines: true,
          ley25326Compliance: true,
          ley27275Alignment: true,
          gdprPrinciples: true,
          dataMinimization: true,
          purposeLimitation: true,
          storageLimitation: true,
          integrityAndConfidentiality: true
        }
      };
    }
  }

  /**
   * Get privacy compliance status
   */
  async getComplianceStatus(): Promise<any> {
    try {
      const response = await fetch(buildApiUrl(`${this.PRIVACY_ENDPOINT}/health`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Compliance status request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Compliance status error:', error);
      return {
        status: 'error',
        service: 'Privacy and Data Protection API',
        capabilities: {},
        compliance: {
          follows_aaip_guidelines: false,
          ley25326_compliant: false
        }
      };
    }
  }
}

export const privacyService = PrivacyService.getInstance();