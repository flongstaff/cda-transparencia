const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Enhanced Audit Service
 * Integrates local audit files with external data sources
 */
class EnhancedAuditService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
        // Update the data path to reflect the correct location in the project
        this.dataPath = path.join(__dirname, '../../../data');
        this.auditPath = path.join(this.dataPath, 'organized_analysis/audit_cycles');
        this.externalApis = {
            datos_gob_ar: 'https://datos.gob.ar/api/3/action',
            georef_api: 'https://apis.datos.gob.ar/georef/api',
            presupuesto_abierto: 'https://www.presupuestoabierto.gob.ar/sici/api',
            contrataciones_abiertas: 'https://www.argentina.gob.ar/contratacionesabiertas/api',
            bcra_api: 'https://api.estadisticasbcra.com',
            wayback_machine: 'https://archive.org/wayback/available'
        };
    }

    async getComprehensiveAuditData() {
        try {
            // Check cache first
            const cacheKey = 'comprehensive_audit_data';
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    return cached.data;
                }
            }

            // Get local audit data
            const localAuditData = await this.getLocalAuditData();
            
            // Get external audit data
            const externalAuditData = await this.getExternalAuditData();
            
            // Combine and analyze data
            const combinedData = this.combineAuditData(localAuditData, externalAuditData);
            
            // Cache results
            this.cache.set(cacheKey, {
                data: combinedData,
                timestamp: Date.now()
            });
            
            return combinedData;
        } catch (error) {
            console.error('Error getting comprehensive audit data:', error);
            throw error;
        }
    }

    async getLocalAuditData() {
        try {
            const anomalyPath = path.join(this.auditPath, 'anomaly_detection/anomaly_data_2024.json');
            const enhancedAuditPath = path.join(this.auditPath, 'enhanced_audits/enhanced_audit_results.json');
            const cycleReportsPath = path.join(this.auditPath, 'cycle_reports');

            const [anomalyData, enhancedAuditData] = await Promise.all([
                this.readJSONFile(anomalyPath),
                this.readJSONFile(enhancedAuditPath)
            ]);

            // Get latest cycle report
            let latestCycleReport = null;
            try {
                const cycleFiles = await fs.readdir(cycleReportsPath);
                const cycleFilesFiltered = cycleFiles.filter(f => f.includes('cycle_') && f.endsWith('.json'));
                
                if (cycleFilesFiltered.length > 0) {
                    // Get the most recent cycle file
                    const latestFile = cycleFilesFiltered.sort().pop();
                    latestCycleReport = await this.readJSONFile(path.join(cycleReportsPath, latestFile));
                }
            } catch (error) {
                console.warn('Could not read cycle reports:', error.message);
            }

            return {
                anomalyData,
                enhancedAuditData,
                latestCycleReport,
                metadata: {
                    source: 'local',
                    lastUpdated: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error reading local audit data:', error);
            return {
                anomalyData: null,
                enhancedAuditData: null,
                latestCycleReport: null
            };
        }
    }

    async getExternalAuditData() {
        try {
            // Check cache first for external data
            const cacheKey = 'external_audit_data';
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    return cached.data;
                }
            }

            const externalData = {};

            // Try to get national search data from datos.gob.ar
            try {
                const nationalResponse = await axios.get(
                    `${this.externalApis.datos_gob_ar}/package_search`,
                    { 
                        params: { 
                            q: 'carmen de areco',
                            rows: 10 
                        },
                        timeout: 10000
                    }
                );
                externalData.nationalData = nationalResponse.data;
            } catch (error) {
                console.warn('Could not fetch national data:', error.message);
                // Provide fallback data
                externalData.nationalData = {
                    success: false,
                    result: { count: 0, results: [] },
                    error: 'Could not fetch from national API'
                };
            }

            // Cache the external data
            this.cache.set(cacheKey, {
                data: externalData,
                timestamp: Date.now()
            });

            return externalData;
        } catch (error) {
            console.error('Error fetching external audit data:', error);
            return {
                nationalData: {
                    success: false,
                    result: { count: 0, results: [] },
                    error: 'Could not fetch external data'
                }
            };
        }
    }

    combineAuditData(localData, externalData) {
        return {
            local: {
                anomalies: localData.anomalyData,
                enhanced_audit: localData.enhancedAuditData,
                cycle_report: localData.latestCycleReport
            },
            external: {
                national_search: externalData.nationalData
            },
            combined_insights: this.generateInsights(localData, externalData),
            metadata: {
                processed_at: new Date().toISOString(),
                data_sources: ['local', 'national'],
                completeness_score: this.calculateCompletenessScore(localData, externalData)
            }
        };
    }

    generateInsights(localData, externalData) {
        const insights = [];

        // Add anomalies insights
        if (localData.anomalyData && localData.anomalyData.criticalIssues) {
            localData.anomalyData.criticalIssues.forEach(issue => {
                insights.push({
                    type: 'anomaly',
                    severity: issue.riskLevel,
                    description: issue.description,
                    amount: issue.type === 'non_executed_works' ? issue.amount : null,
                    details: issue
                });
            });
        }

        // Add transparency insights
        if (localData.enhancedAuditData && localData.enhancedAuditData.legal_compliance) {
            const compliance = localData.enhancedAuditData.legal_compliance;
            const completed = compliance.compliance_checklist.filter(item => item.startsWith('✓')).length;
            const total = compliance.compliance_checklist.length;
            
            insights.push({
                type: 'compliance',
                status: total > 0 ? (completed / total) * 100 : 0,
                details: { completed, total }
            });
        }

        // Add external data insights
        if (externalData.nationalData && externalData.nationalData.result) {
            insights.push({
                type: 'national_presence',
                count: externalData.nationalData.result.count || 0,
                datasets: externalData.nationalData.result.results || []
            });
        }

        return insights;
    }

    calculateCompletenessScore(localData, externalData) {
        let score = 0;
        let total = 0;

        // Check for local anomalies
        if (localData.anomalyData) {
            score += 25;
        }
        total += 25;

        // Check for enhanced audit data
        if (localData.enhancedAuditData) {
            score += 25;
        }
        total += 25;

        // Check for cycle reports
        if (localData.latestCycleReport) {
            score += 20;
        }
        total += 20;

        // Check for external data
        if (externalData.nationalData && externalData.nationalData.result && externalData.nationalData.result.count > 0) {
            score += 30;
        }
        total += 30;

        return Math.round((score / total) * 100);
    }

    async readJSONFile(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            // Replace NaN values with null to make valid JSON
            const cleanedData = data.replace(/:\s*NaN/g, ': null');
            return JSON.parse(cleanedData);
        } catch (error) {
            console.warn(`Failed to read ${filePath}:`, error.message);
            return null;
        }
    }

    async getAuditDashboard() {
        try {
            const comprehensiveData = await this.getComprehensiveAuditData();
            
            return {
                summary: {
                    completeness_score: comprehensiveData.metadata.completeness_score,
                    total_insights: comprehensiveData.combined_insights.length,
                    last_updated: comprehensiveData.metadata.processed_at
                },
                critical_issues: this.extractCriticalIssues(comprehensiveData),
                compliance_status: this.extractComplianceStatus(comprehensiveData),
                data_availability: this.extractDataAvailability(comprehensiveData),
                recommendations: this.generateRecommendations(comprehensiveData)
            };
        } catch (error) {
            console.error('Error generating audit dashboard:', error);
            throw error;
        }
    }

    extractCriticalIssues(comprehensiveData) {
        const criticalIssues = [];
        
        if (comprehensiveData.local.anomalies && comprehensiveData.local.anomalies.criticalIssues) {
            criticalIssues.push(...comprehensiveData.local.anomalies.criticalIssues);
        }
        
        return criticalIssues;
    }

    extractComplianceStatus(comprehensiveData) {
        if (comprehensiveData.local.enhanced_audit && comprehensiveData.local.enhanced_audit.legal_compliance) {
            const compliance = comprehensiveData.local.enhanced_audit.legal_compliance;
            const completed = compliance.compliance_checklist.filter(item => item.startsWith('✓')).length;
            const total = compliance.compliance_checklist.length;
            
            return {
                completed,
                total,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
                checklist: compliance.compliance_checklist
            };
        }
        
        return null;
    }

    extractDataAvailability(comprehensiveData) {
        return {
            local_anomalies: !!comprehensiveData.local.anomalies,
            enhanced_audit: !!comprehensiveData.local.enhanced_audit,
            cycle_reports: !!comprehensiveData.local.cycle_report,
            external_national: comprehensiveData.external.national_search && 
                            comprehensiveData.external.national_search.result && 
                            comprehensiveData.external.national_search.result.count > 0
        };
    }

    generateRecommendations(comprehensiveData) {
        const recommendations = [];
        
        // Add recommendations based on compliance status
        const compliance = this.extractComplianceStatus(comprehensiveData);
        if (compliance && compliance.percentage < 80) {
            recommendations.push({
                category: 'compliance',
                priority: 'high',
                description: `Only ${compliance.percentage}% of legal compliance checklist items are completed. Improve transparency by publishing missing documents.`
            });
        }
        
        // Add recommendations based on data availability
        const availability = this.extractDataAvailability(comprehensiveData);
        if (!availability.external_national) {
            recommendations.push({
                category: 'data_availability',
                priority: 'medium',
                description: 'No national data found. Consider expanding search criteria for Carmen de Areco data on national platforms.'
            });
        }
        
        // Add recommendations based on anomalies
        if (comprehensiveData.local.anomalies && comprehensiveData.local.anomalies.criticalIssues) {
            const nonExecutedWorks = comprehensiveData.local.anomalies.criticalIssues.find(
                issue => issue.type === 'non_executed_works'
            );
            
            if (nonExecutedWorks) {
                recommendations.push({
                    category: 'anomalies',
                    priority: 'high',
                    description: `Large amount of non-executed works detected: $${(nonExecutedWorks.amount / 1000000).toFixed(2)}M. Audit these projects immediately.`
                });
            }
        }
        
        return recommendations;
    }

    clearCache() {
        this.cache.clear();
        console.log('✅ Enhanced Audit Service cache cleared');
    }

    getCacheStats() {
        return {
            cache_size: this.cache.size,
            cache_keys: Array.from(this.cache.keys()),
            cache_expiry: this.cacheExpiry
        };
    }
}

module.exports = EnhancedAuditService;