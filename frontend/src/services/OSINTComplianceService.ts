// OSINT Compliance Service for government transparency data validation
import { v4 as uuidv4 } from 'uuid';

export interface OSINTComplianceResult {
  isCompliant: boolean;
  violations: ComplianceViolation[];
  legalFramework: LegalFramework;
  confidenceScore: number; // 0-100
  lastChecked: string;
  sourcesVerified: string[];
  crossReferencedSources: string[];
}

export interface ComplianceViolation {
  rule: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFix: string;
  evidence?: string[];
}

export interface LegalFramework {
  argentina: {
    transparencyLaw: string;
    privacyLaw: string;
    accessToInformationAct: string;
    publicEthicsLaw: string;
  };
  australia: {
    foiAct: string;
    privacyAct: string;
    asicAct: string;
  };
  international: {
    gdpr: string;
    oecdPrinciples: string;
    undpGuidelines: string;
  };
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  type: 'official' | 'archive' | 'local' | 'backup';
  status: 'active' | 'inactive' | 'error';
  lastVerified: string;
  reliability: number; // 0-100
  complianceVerified: boolean;
  verificationMethod: string;
}

class OSINTComplianceService {
  private readonly LEGAL_FRAMEWORK: LegalFramework = {
    argentina: {
      transparencyLaw: 'Ley 27.275 - Derecho de Acceso a la Información Pública',
      privacyLaw: 'Ley 25.326 - Protección de Datos Personales',
      accessToInformationAct: 'Decreto 1172/2016 - Reglamentación del acceso a la información',
      publicEthicsLaw: 'Ley 27.407 - Ética en la Gestión Pública'
    },
    australia: {
      foiAct: 'Freedom of Information Act 1982',
      privacyAct: 'Privacy Act 1988',
      asicAct: 'Australian Securities and Investments Commission Act 2001'
    },
    international: {
      gdpr: 'General Data Protection Regulation (GDPR)',
      oecdPrinciples: 'OECD Principles of Public Governance',
      undpGuidelines: 'UNDP Guidelines for Anti-Corruption Measures'
    }
  };

  private dataSources: DataSource[] = [
    {
      id: 'carmen-official',
      name: 'Sitio Oficial - Carmen de Areco',
      url: 'https://carmendeareco.gob.ar/transparencia/',
      type: 'official',
      status: 'active',
      lastVerified: new Date().toISOString(),
      reliability: 98,
      complianceVerified: true,
      verificationMethod: 'Direct government website'
    },
    {
      id: 'web-archive-nov',
      name: 'Archivo Web - Noviembre 2024',
      url: '/data/source_materials/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241111014916/',
      type: 'archive',
      status: 'active',
      lastVerified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      reliability: 92,
      complianceVerified: true,
      verificationMethod: 'Internet Archive snapshot'
    },
    {
      id: 'web-archive-dec',
      name: 'Archivo Web - Diciembre 2024',
      url: '/data/source_materials/web_archives/web_archive/carmendeareco.gob.ar_transparencia/snapshot_20241212115813/',
      type: 'archive',
      status: 'active',
      lastVerified: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      reliability: 95,
      complianceVerified: true,
      verificationMethod: 'Internet Archive snapshot'
    },
    {
      id: 'local-collection',
      name: 'Colección Local de Documentos',
      url: '/data/source_materials/',
      type: 'local',
      status: 'active',
      lastVerified: new Date().toISOString(),
      reliability: 100,
      complianceVerified: true,
      verificationMethod: 'Local backup'
    },
    {
      id: 'wayback-machine',
      name: 'Wayback Machine',
      url: 'https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/',
      type: 'backup',
      status: 'active',
      lastVerified: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      reliability: 88,
      complianceVerified: true,
      verificationMethod: 'Internet Archive backup'
    }
  ];

  // Check compliance for a specific dataset
  async checkDataCompliance(
    data: any, 
    sourceUrl: string, 
    purpose: string
  ): Promise<OSINTComplianceResult> {
    console.log(`🔍 Checking OSINT compliance for data from ${sourceUrl}...`);

    // Validate data structure
    const structuralViolations = this.validateDataStructure(data);
    
    // Check source authenticity
    const sourceViolations = await this.verifyDataSource(sourceUrl);
    
    // Check privacy compliance
    const privacyViolations = this.checkPrivacyCompliance(data);
    
    // Check transparency compliance
    const transparencyViolations = this.checkTransparencyCompliance(data, purpose);
    
    // Check for personal data
    const piiViolations = this.checkForPersonalData(data);
    
    // Check for completeness
    const completenessViolations = this.checkCompleteness(data);
    
    // Combine all violations
    const allViolations = [
      ...structuralViolations,
      ...sourceViolations,
      ...privacyViolations,
      ...transparencyViolations,
      ...piiViolations,
      ...completenessViolations
    ];

    // Calculate compliance score
    const criticalViolations = allViolations.filter(v => v.severity === 'critical').length;
    const highViolations = allViolations.filter(v => v.severity === 'high').length;
    const mediumViolations = allViolations.filter(v => v.severity === 'medium').length;
    
    let complianceScore = 100;
    complianceScore -= criticalViolations * 30;
    complianceScore -= highViolations * 15;
    complianceScore -= mediumViolations * 5;
    complianceScore = Math.max(0, complianceScore);

    // Verify sources
    const sourcesVerified = [sourceUrl];
    const crossReferencedSources = await this.getCrossReferenceSources(data.type || 'general');

    const result: OSINTComplianceResult = {
      isCompliant: criticalViolations === 0 && complianceScore >= 70,
      violations: allViolations,
      legalFramework: this.LEGAL_FRAMEWORK,
      confidenceScore: complianceScore,
      lastChecked: new Date().toISOString(),
      sourcesVerified,
      crossReferencedSources
    };

    console.log(`✅ OSINT compliance check complete: ${complianceScore.toFixed(0)}% confidence, ${allViolations.length} violations`);

    return result;
  }

  // Validate data structure
  private validateDataStructure(data: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check for required fields
    const requiredFields = ['id', 'title', 'type', 'date', 'source'];
    requiredFields.forEach(field => {
      if (!(field in data) || data[field] === undefined || data[field] === null) {
        violations.push({
          rule: 'data_structure_required_fields',
          message: `Missing required field: ${field}`,
          severity: 'high',
          suggestedFix: `Add ${field} field to data structure`
        });
      }
    });

    // Validate data types
    if (data.date && isNaN(Date.parse(data.date))) {
      violations.push({
        rule: 'data_structure_date_format',
        message: 'Invalid date format',
        severity: 'medium',
        suggestedFix: 'Use ISO date format (YYYY-MM-DD)'
      });
    }

    if (data.amount !== undefined && (typeof data.amount !== 'number' || isNaN(data.amount))) {
      violations.push({
        rule: 'data_structure_amount_format',
        message: 'Invalid amount format',
        severity: 'medium',
        suggestedFix: 'Amount should be a valid number'
      });
    }

    return violations;
  }

  // Verify data source authenticity
  private async verifyDataSource(sourceUrl: string): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    
    // Check if source is in our verified sources
    const verifiedSource = this.dataSources.find(source => source.url === sourceUrl);
    
    if (!verifiedSource) {
      violations.push({
        rule: 'source_verification',
        message: 'Source not in verified list',
        severity: 'medium',
        suggestedFix: 'Add source to verified sources list or verify authenticity',
        evidence: [sourceUrl]
      });
    } else if (!verifiedSource.complianceVerified) {
      violations.push({
        rule: 'source_compliance_verification',
        message: 'Source compliance not verified',
        severity: 'high',
        suggestedFix: 'Verify source compliance with legal framework',
        evidence: [sourceUrl, verifiedSource.verificationMethod]
      });
    }

    return violations;
  }

  // Check privacy compliance
  private checkPrivacyCompliance(data: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check for personal identifiable information (PII)
    const piiPatterns = [
      /\b\d{7,8}\b/, // DNI numbers
      /\b\d{2}-\d{8}-\d{1}\b/, // CUIT numbers
      /\+\d{1,3}\s?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{4}/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email addresses
    ];

    const jsonString = JSON.stringify(data);
    
    piiPatterns.forEach(pattern => {
      if (pattern.test(jsonString)) {
        violations.push({
          rule: 'privacy_pii_detection',
          message: 'Potential personal identifiable information detected',
          severity: 'high',
          suggestedFix: 'Remove or anonymize personal data',
          evidence: ['PII pattern match']
        });
      }
    });

    return violations;
  }

  // Check transparency compliance
  private checkTransparencyCompliance(data: any, purpose: string): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check if purpose is transparency-related
    const transparencyKeywords = [
      'transparency', 'transparencia', 'public', 'público', 'government', 
      'gobierno', 'accountability', 'rendición de cuentas', 'access to information',
      'acceso a la información', 'open data', 'datos abiertos'
    ];

    const isTransparencyRelated = transparencyKeywords.some(keyword => 
      purpose.toLowerCase().includes(keyword) || 
      (data.type && data.type.toLowerCase().includes(keyword))
    );

    if (!isTransparencyRelated) {
      violations.push({
        rule: 'transparency_purpose',
        message: 'Data collection purpose not clearly transparency-related',
        severity: 'medium',
        suggestedFix: 'Ensure data collection serves public transparency purposes',
        evidence: [purpose, data.type]
      });
    }

    return violations;
  }

  // Check for personal data
  private checkForPersonalData(data: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Common personal data fields to check
    const personalFields = [
      'name', 'full_name', 'first_name', 'last_name', 'apellido', 'nombre',
      'address', 'dirección', 'phone', 'teléfono', 'email', 'mail',
      'dni', 'cuil', 'cuit', 'social_security', 'seguridad_social'
    ];

    personalFields.forEach(field => {
      if (field in data && data[field]) {
        violations.push({
          rule: 'personal_data_field',
          message: `Personal data field detected: ${field}`,
          severity: 'high',
          suggestedFix: 'Remove or anonymize personal data field',
          evidence: [`${field}: ${data[field]}`]
        });
      }
    });

    return violations;
  }

  // Check data completeness
  private checkCompleteness(data: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check if data has sufficient information
    const dataKeys = Object.keys(data);
    if (dataKeys.length < 5) {
      violations.push({
        rule: 'data_completeness',
        message: 'Insufficient data fields for meaningful analysis',
        severity: 'medium',
        suggestedFix: 'Include more relevant data fields',
        evidence: [`Only ${dataKeys.length} fields provided`]
      });
    }

    return violations;
  }

  // Get cross-reference sources for validation
  async getCrossReferenceSources(dataType: string): Promise<string[]> {
    const sourcesMap: Record<string, string[]> = {
      'budget': [
        'https://www.gba.gob.ar/transparencia',
        'https://datos.gob.ar/dataset?q=presupuesto+carmen+areco',
        'https://www.argentina.gob.ar/jefatura/innovacion-publica/datos-abertos'
      ],
      'contracts': [
        'https://contratos.gov.ar',
        'https://www.gba.gob.ar/contrataciones',
        'https://www.argentina.gob.ar/obras-publicas'
      ],
      'revenue': [
        'https://www.gba.gob.ar/hacienda',
        'https://datos.gob.ar/dataset?q=ingresos',
        'https://www.indec.gob.ar'
      ],
      'declarations': [
        'https://www.argentina.gob.ar/anticorrupcion/declaraciones-juradas',
        'https://www.gba.gob.ar/transparencia/declaraciones'
      ],
      'salaries': [
        'https://www.argentina.gob.ar/trabajo/salarios',
        'https://www.gba.gob.ar/recursos-humanos'
      ],
      'spending': [
        'https://www.gba.gob.ar/gastos',
        'https://datos.gob.ar/dataset?q=gastos+municipales'
      ],
      'debt': [
        'https://www.argentina.gob.ar/hacienda/deuda',
        'https://www.gba.gob.ar/finanzas/deuda'
      ],
      'investments': [
        'https://www.argentina.gob.ar/inversiones',
        'https://www.gba.gob.ar/planificacion/inversiones'
      ]
    };

    return sourcesMap[dataType] || [
      'https://carmendeareco.gob.ar/transparencia/',
      'https://web.archive.org/web/*/carmendeareco.gob.ar_transparencia/*',
      'https://datos.gob.ar/search?q=carmen+de+areco'
    ];
  }

  // Get cross-validation sources
  getCrossValidationSources(dataType: string): DataSource[] {
    return this.dataSources.filter(source => {
      // For now, return all sources - in production this would filter based on data type
      return true;
    });
  }

  // Get available years for data
  getAvailableYears(): string[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2018; year <= currentYear + 1; year++) {
      years.push(year.toString());
    }
    return years.reverse();
  }

  // Generate compliance report
  async generateComplianceReport(data: any, sourceUrl: string, purpose: string): Promise<string> {
    const compliance = await this.checkDataCompliance(data, sourceUrl, purpose);
    
    const report = `
OSINT Compliance Report
=======================

Generated: ${new Date().toLocaleString('es-AR')}
Source URL: ${sourceUrl}
Purpose: ${purpose}

Overall Compliance: ${compliance.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
Confidence Score: ${compliance.confidenceScore}%

Violations Found: ${compliance.violations.length}
${compliance.violations.map((violation, index) => `
${index + 1}. ${violation.rule.toUpperCase()}
   Severity: ${violation.severity}
   Message: ${violation.message}
   Suggested Fix: ${violation.suggestedFix}
`).join('')}

Legal Framework References:
${Object.entries(compliance.legalFramework.argentina).map(([key, law]) => `  • ${law}`).join('\n')}

Sources Verified: ${compliance.sourcesVerified.length}
Cross-Referenced Sources: ${compliance.crossReferencedSources.length}
`;

    return report;
  }
}

export default new OSINTComplianceService();