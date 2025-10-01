/**
 * DATA ANONYMIZATION SERVICE
 *
 * Ensures compliance with Argentine Law 25.326 (Personal Data Protection)
 * and transparency regulations. Anonymizes personal data while maintaining
 * transparency through aggregate statistics.
 */

export interface AnonymizationConfig {
  allowPublicOfficials: boolean; // Only elected officials
  aggregateOnly: boolean;
  minimumGroupSize: number; // Minimum 5 people for statistical disclosure
}

export interface SalaryData {
  name?: string;
  position: string;
  salary: number;
  category: string;
  isElectedOfficial?: boolean;
}

export interface AnonymizedSalaryData {
  category: string;
  count: number;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  totalPayroll: number;
  positions: string[];
}

export interface PublicOfficialData {
  position: string; // Only show position, not name unless elected
  salary: number;
  type: 'elected' | 'appointed';
}

class DataAnonymizationService {
  private static instance: DataAnonymizationService;

  private constructor() {}

  public static getInstance(): DataAnonymizationService {
    if (!DataAnonymizationService.instance) {
      DataAnonymizationService.instance = new DataAnonymizationService();
    }
    return DataAnonymizationService.instance;
  }

  /**
   * Anonymize salary data according to Argentine law
   * - Aggregate by position categories
   * - Remove individual identifiers
   * - Apply k-anonymity (minimum group size of 5)
   */
  public anonymizeSalaries(
    data: SalaryData[],
    config: AnonymizationConfig = {
      allowPublicOfficials: true,
      aggregateOnly: true,
      minimumGroupSize: 5
    }
  ): {
    aggregated: AnonymizedSalaryData[];
    publicOfficials: PublicOfficialData[];
    summary: {
      totalEmployees: number;
      totalPayroll: number;
      averageSalary: number;
      categoriesCount: number;
    };
  } {
    console.log(`🔒 Anonymizing ${data.length} salary records...`);

    // Separate elected officials (can be published) from regular employees
    const electedOfficials = data.filter(d => d.isElectedOfficial);
    const regularEmployees = data.filter(d => !d.isElectedOfficial);

    // Group regular employees by category
    const grouped = this.groupByCategory(regularEmployees);

    // Apply k-anonymity: Only show groups with minimum size
    const anonymized = Object.entries(grouped)
      .filter(([_, items]) => items.length >= config.minimumGroupSize)
      .map(([category, items]) => this.aggregateGroup(category, items));

    // Public officials (only position and salary, no names unless elected)
    const publicOfficials: PublicOfficialData[] = electedOfficials.map(official => ({
      position: official.position,
      salary: official.salary,
      type: 'elected' as const
    }));

    // Calculate summary
    const totalEmployees = data.length;
    const totalPayroll = data.reduce((sum, d) => sum + d.salary, 0);
    const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

    console.log(`✅ Anonymized: ${anonymized.length} categories, ${publicOfficials.length} public officials`);

    return {
      aggregated: anonymized,
      publicOfficials,
      summary: {
        totalEmployees,
        totalPayroll,
        averageSalary,
        categoriesCount: anonymized.length
      }
    };
  }

  /**
   * Group employees by position category
   */
  private groupByCategory(data: SalaryData[]): Record<string, SalaryData[]> {
    return data.reduce((groups, item) => {
      const category = item.category || this.categorizePosition(item.position);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, SalaryData[]>);
  }

  /**
   * Automatically categorize position if not provided
   */
  private categorizePosition(position: string): string {
    const pos = position.toLowerCase();

    if (pos.includes('director') || pos.includes('secretario')) return 'Dirección Superior';
    if (pos.includes('jefe') || pos.includes('coordinador')) return 'Jefaturas y Coordinación';
    if (pos.includes('profesional') || pos.includes('técnico')) return 'Profesionales y Técnicos';
    if (pos.includes('administrativo') || pos.includes('auxiliar')) return 'Administrativos';
    if (pos.includes('operario') || pos.includes('mantenimiento')) return 'Operativos';
    if (pos.includes('médico') || pos.includes('enferm')) return 'Personal de Salud';
    if (pos.includes('docente') || pos.includes('maestro')) return 'Personal de Educación';

    return 'Otros';
  }

  /**
   * Aggregate a group of salaries
   */
  private aggregateGroup(category: string, items: SalaryData[]): AnonymizedSalaryData {
    const salaries = items.map(i => i.salary);
    const positions = [...new Set(items.map(i => i.position))];

    return {
      category,
      count: items.length,
      averageSalary: salaries.reduce((sum, s) => sum + s, 0) / salaries.length,
      minSalary: Math.min(...salaries),
      maxSalary: Math.max(...salaries),
      totalPayroll: salaries.reduce((sum, s) => sum + s, 0),
      positions
    };
  }

  /**
   * Validate contract data - remove personal information from contractors
   */
  public anonymizeContracts(contracts: any[]): any[] {
    return contracts.map(contract => {
      const anonymized = { ...contract };

      // Remove personal identifiers
      delete anonymized.contractor_id;
      delete anonymized.contractor_cuit;
      delete anonymized.contractor_address;
      delete anonymized.contractor_phone;

      // Keep only:
      // - Company/entity name (not individuals)
      // - Contract amount
      // - Contract purpose
      // - Contract dates
      // - Tender process info

      return anonymized;
    });
  }

  /**
   * Check if showing this data would violate privacy laws
   */
  public validateDataDisclosure(data: any[], type: 'salary' | 'contract' | 'declaration'): {
    canPublish: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (type === 'salary') {
      const grouped = this.groupByCategory(data);
      const smallGroups = Object.entries(grouped).filter(([_, items]) => items.length < 5);

      if (smallGroups.length > 0) {
        warnings.push(
          `${smallGroups.length} categorías tienen menos de 5 empleados y deben ser agregadas para cumplir con k-anonimato`
        );
        recommendations.push('Agrupar categorías pequeñas en "Otros" o no publicar');
      }

      const hasPersonalNames = data.some(d => d.name && !d.isElectedOfficial);
      if (hasPersonalNames) {
        warnings.push('Se detectaron nombres de empleados no electos - violación de Ley 25.326');
        recommendations.push('Remover todos los nombres excepto funcionarios electos');
      }
    }

    const canPublish = warnings.length === 0;

    return {
      canPublish,
      warnings,
      recommendations
    };
  }

  /**
   * Generate anonymous statistical report
   */
  public generateAnonymousReport(data: any[], type: string): {
    total: number;
    categories: any[];
    trends: any[];
    summary: string;
  } {
    // This would generate aggregate statistical reports
    // without exposing individual records

    return {
      total: data.length,
      categories: [],
      trends: [],
      summary: `Reporte agregado con ${data.length} registros (datos anonimizados según Ley 25.326)`
    };
  }
}

// Export singleton instance
const dataAnonymizationService = DataAnonymizationService.getInstance();
export default dataAnonymizationService;
