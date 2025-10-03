/**
 * DataAuditService
 * Service for comparing data between different sources and identifying discrepancies
 * Helps ensure data integrity and accuracy across Carmen de Areco transparency portal
 */

import { externalAPIsService } from './ExternalAPIsService';
import { carmenScraperService } from './CarmenScraperService';

export interface DataComparisonResult {
  sourceA: string;
  sourceB: string;
  discrepancies: any[];
  similarities: any[];
  summary: {
    totalItems: number;
    matchingItems: number;
    differentItems: number;
    accuracyPercentage: number;
  };
  timestamp: string;
}

export interface DiscrepancyReport {
  id: string;
  type: 'missing' | 'different' | 'extra' | 'inconsistent';
  field: string;
  sourceAValue: any;
  sourceBValue: any;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
}

export interface AuditResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning';
  discrepancies: DiscrepancyReport[];
  sources: string[];
  score: number; // 0-100 scale
  timestamp: string;
  details: any;
}

class DataAuditService {
  private static instance: DataAuditService;

  private constructor() {}

  public static getInstance(): DataAuditService {
    if (!DataAuditService.instance) {
      DataAuditService.instance = new DataAuditService();
    }
    return DataAuditService.instance;
  }

  /**
   * Compare data between two sources
   */
  async compareDataSources(
    sourceAData: any,
    sourceBData: any,
    sourceAName: string,
    sourceBName: string
  ): Promise<DataComparisonResult> {
    try {
      const discrepancies: any[] = [];
      const similarities: any[] = [];
      
      // Perform basic comparison between data sources
      // This is a simplified example - in a real implementation, 
      // we would have more sophisticated comparison logic
      if (Array.isArray(sourceAData) && Array.isArray(sourceBData)) {
        const sourceAMap = new Map();
        sourceAData.forEach(item => {
          if (item.id) {
            sourceAMap.set(item.id, item);
          }
        });
        
        const sourceBMap = new Map();
        sourceBData.forEach(item => {
          if (item.id) {
            sourceBMap.set(item.id, item);
          }
        });
        
        // Find similarities and discrepancies
        for (const [id, itemA] of sourceAMap) {
          if (sourceBMap.has(id)) {
            const itemB = sourceBMap.get(id);
            // Compare items
            if (JSON.stringify(itemA) !== JSON.stringify(itemB)) {
              discrepancies.push({
                id,
                itemA,
                itemB,
                differences: this.findDifferences(itemA, itemB)
              });
            } else {
              similarities.push(itemA);
            }
          } else {
            // Item exists in A but not in B
            discrepancies.push({
              id,
              type: 'missing-in-sourceB',
              itemA,
              description: `Item exists in ${sourceAName} but not in ${sourceBName}`
            });
          }
        }
        
        // Check for items in B but not in A
        for (const [id, itemB] of sourceBMap) {
          if (!sourceAMap.has(id)) {
            discrepancies.push({
              id,
              type: 'missing-in-sourceA',
              itemB,
              description: `Item exists in ${sourceBName} but not in ${sourceAName}`
            });
          }
        }
      } else {
        // Compare non-array objects
        const allKeys = new Set([...Object.keys(sourceAData || {}), ...Object.keys(sourceBData || {})]);
        for (const key of allKeys) {
          if (sourceAData?.[key] !== sourceBData?.[key]) {
            discrepancies.push({
              field: key,
              sourceAValue: sourceAData?.[key],
              sourceBValue: sourceBData?.[key],
              description: `Field ${key} differs between sources`
            });
          } else {
            similarities.push({
              field: key,
              value: sourceAData?.[key]
            });
          }
        }
      }
      
      const totalItems = Math.max(
        Array.isArray(sourceAData) ? sourceAData.length : 1,
        Array.isArray(sourceBData) ? sourceBData.length : 1
      );
      
      const matchingItems = similarities.length;
      const differentItems = discrepancies.length;
      const accuracyPercentage = totalItems > 0 ? 
        Math.round((matchingItems / totalItems) * 100) : 100;
      
      return {
        sourceA: sourceAName,
        sourceB: sourceBName,
        discrepancies,
        similarities,
        summary: {
          totalItems,
          matchingItems,
          differentItems,
          accuracyPercentage
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error comparing data sources:', error);
      return {
        sourceA: sourceAName,
        sourceB: sourceBName,
        discrepancies: [],
        similarities: [],
        summary: {
          totalItems: 0,
          matchingItems: 0,
          differentItems: 0,
          accuracyPercentage: 0
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Find differences between two objects
   */
  private findDifferences(objA: any, objB: any): any[] {
    const diffs = [];
    
    const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
    for (const key of allKeys) {
      if (objA[key] !== objB[key]) {
        diffs.push({
          field: key,
          valueA: objA[key],
          valueB: objB[key]
        });
      }
    }
    
    return diffs;
  }

  /**
   * Perform comprehensive audit between Carmen scraper data and external APIs
   */
  async performComprehensiveAudit(): Promise<AuditResult[]> {
    try {
      console.log('Starting comprehensive data audit...');
      
      // Fetch data from Carmen scraper
      const carmenData = await carmenScraperService.getAllCarmenData();
      
      // Fetch data from external APIs
      const externalData = await externalAPIsService.loadAllExternalData();
      
      const auditResults: AuditResult[] = [];
      
      // Audit Carmen official data vs external data
      if (carmenData.results.official && externalData.carmenDeAreco) {
        const result = await this.auditCarmenVsExternal(
          carmenData.results.official,
          externalData.carmenDeAreco.data,
          'Carmen Scraper - Official',
          'External APIs - Carmen'
        );
        auditResults.push(result);
      }
      
      // Audit transparency data
      if (carmenData.results.transparency && externalData.carmenDeAreco) {
        const result = await this.auditCarmenVsExternal(
          carmenData.results.transparency,
          externalData.carmenDeAreco.data,
          'Carmen Scraper - Transparency',
          'External APIs - Carmen'
        );
        auditResults.push(result);
      }
      
      // Audit other data sources as needed
      
      return auditResults;
    } catch (error) {
      console.error('Error performing comprehensive audit:', error);
      return [];
    }
  }

  /**
   * Audit comparison between Carmen scraper and external API data
   */
  async auditCarmenVsExternal(
    carmenData: any,
    externalData: any,
    carmenSourceName: string,
    externalSourceName: string
  ): Promise<AuditResult> {
    try {
      const comparison = await this.compareDataSources(
        carmenData,
        externalData,
        carmenSourceName,
        externalSourceName
      );
      
      const discrepancies: DiscrepancyReport[] = [];
      
      // Process comparison results into discrepancy reports
      for (const disc of comparison.discrepancies) {
        discrepancies.push({
          id: disc.id || `disc-${Date.now()}`,
          type: disc.type || 'different',
          field: disc.field || 'unknown',
          sourceAValue: disc.sourceAValue || disc.itemA,
          sourceBValue: disc.sourceBValue || disc.itemB,
          severity: this.getSeverityLevel(disc),
          description: disc.description || `Discrepancy found in ${disc.field || 'data'}`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Determine audit status based on number and severity of discrepancies
      let status: 'passed' | 'failed' | 'warning' = 'passed';
      let score = 100;
      
      if (discrepancies.length > 0) {
        const highSeverityCount = discrepancies.filter(d => d.severity === 'high').length;
        const mediumSeverityCount = discrepancies.filter(d => d.severity === 'medium').length;
        
        if (highSeverityCount > 5 || (highSeverityCount > 0 && mediumSeverityCount > 5)) {
          status = 'failed';
          score = Math.max(0, 100 - (highSeverityCount * 20) - (mediumSeverityCount * 5));
        } else if (highSeverityCount > 0 || mediumSeverityCount > 0) {
          status = 'warning';
          score = Math.max(60, 100 - (highSeverityCount * 15) - (mediumSeverityCount * 3));
        } else {
          status = 'passed';
          score = Math.max(80, comparison.summary.accuracyPercentage);
        }
      }
      
      return {
        id: `audit-${Date.now()}`,
        name: `Audit: ${carmenSourceName} vs ${externalSourceName}`,
        status,
        discrepancies,
        sources: [carmenSourceName, externalSourceName],
        score,
        timestamp: new Date().toISOString(),
        details: {
          ...comparison.summary,
          comparisonDetails: comparison
        }
      };
    } catch (error) {
      console.error('Error auditing Carmen vs External:', error);
      return {
        id: `audit-${Date.now()}`,
        name: `Audit: ${carmenSourceName} vs ${externalSourceName}`,
        status: 'failed',
        discrepancies: [],
        sources: [carmenSourceName, externalSourceName],
        score: 0,
        timestamp: new Date().toISOString(),
        details: { error: (error as Error).message }
      };
    }
  }

  /**
   * Determine severity level based on discrepancy
   */
  private getSeverityLevel(disc: any): 'low' | 'medium' | 'high' {
    // Determine severity based on the type of data that differs
    if (disc.field && (disc.field.toLowerCase().includes('amount') || 
        disc.field.toLowerCase().includes('monto') || 
        disc.field.toLowerCase().includes('presupuesto') || 
        disc.field.toLowerCase().includes('budget'))) {
      // Financial data differences are high severity
      return 'high';
    }
    
    if (disc.field && (disc.field.toLowerCase().includes('date') || 
        disc.field.toLowerCase().includes('fecha'))) {
      // Date differences might be medium severity
      return 'medium';
    }
    
    // Default to low severity
    return 'low';
  }

  /**
   * Generate audit summary
   */
  async generateAuditSummary(): Promise<{
    totalAudits: number;
    passedAudits: number;
    failedAudits: number;
    warningAudits: number;
    averageScore: number;
    lastAuditDate: string;
  }> {
    const results = await this.performComprehensiveAudit();
    
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;
    
    return {
      totalAudits: results.length,
      passedAudits: passed,
      failedAudits: failed,
      warningAudits: warnings,
      averageScore,
      lastAuditDate: new Date().toISOString()
    };
  }

  /**
   * Get detailed discrepancy reports
   */
  async getDiscrepancyReports(): Promise<DiscrepancyReport[]> {
    const results = await this.performComprehensiveAudit();
    return results.flatMap(r => r.discrepancies);
  }

  /**
   * Generate compliance report based on audit results
   */
  async generateComplianceReport(): Promise<any> {
    const summary = await this.generateAuditSummary();
    const discrepancies = await this.getDiscrepancyReports();
    
    return {
      reportDate: new Date().toISOString(),
      summary,
      complianceStatus: summary.failedAudits === 0 ? 'compliant' : 'non-compliant',
      recommendations: this.generateRecommendations(discrepancies),
      detailedDiscrepancies: discrepancies
    };
  }

  /**
   * Generate recommendations based on discrepancies
   */
  private generateRecommendations(discrepancies: DiscrepancyReport[]): string[] {
    const recommendations: string[] = [];
    
    const highSeverity = discrepancies.filter(d => d.severity === 'high');
    const mediumSeverity = discrepancies.filter(d => d.severity === 'medium');
    const financialDiscrepancies = discrepancies.filter(d => 
      d.field && (d.field.toLowerCase().includes('amount') || 
      d.field.toLowerCase().includes('monto') || 
      d.field.toLowerCase().includes('presupuesto') || 
      d.field.toLowerCase().includes('budget'))
    );
    
    if (highSeverity.length > 0) {
      recommendations.push(`Address ${highSeverity.length} high-severity discrepancies immediately`);
    }
    
    if (mediumSeverity.length > 0) {
      recommendations.push(`Address ${mediumSeverity.length} medium-severity discrepancies`);
    }
    
    if (financialDiscrepancies.length > 0) {
      recommendations.push(`Review financial data discrepancies (${financialDiscrepancies.length} found)`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('No significant discrepancies found');
    }
    
    return recommendations;
  }
}

const dataAuditService = DataAuditService.getInstance();

export { DataAuditService };
export { dataAuditService };
export default dataAuditService;