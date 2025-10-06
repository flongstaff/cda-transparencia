/**
 * Data Validation Service
 * 
 * Provides comprehensive data validation rules to ensure data integrity
 * and consistency across all Carmen de Areco transparency portal data sources.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: string;
}

export interface ValidationRule {
  name: string;
  description: string;
  validate: (value: any, context?: any) => ValidationResult;
  severity: 'error' | 'warning';
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
  totalScore: number;
}

class DataValidationService {
  private static instance: DataValidationService;
  private validationRules: ValidationRule[] = [];

  private constructor() {
    this.initializeValidationRules();
  }

  public static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService();
    }
    return DataValidationService.instance;
  }

  /**
   * Initialize validation rules for different data types
   */
  private initializeValidationRules(): void {
    // Financial data validation rules
    this.validationRules.push({
      name: 'financial-amount-positive',
      description: 'Financial amounts must be positive numbers',
      validate: (value) => {
        if (value === null || value === undefined) {
          return {
            isValid: false,
            errors: ['Amount cannot be null or undefined'],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return {
            isValid: false,
            errors: ['Amount must be a valid number'],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        if (numValue < 0) {
          return {
            isValid: false,
            errors: ['Financial amount cannot be negative'],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        return {
          isValid: true,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString()
        };
      },
      severity: 'error'
    });

    // Required field validation
    this.validationRules.push({
      name: 'required-field',
      description: 'Required fields must not be empty',
      validate: (value, context) => {
        const fieldName = context?.fieldName || 'field';
        
        if (value === null || value === undefined || value === '') {
          return {
            isValid: false,
            errors: [`Required field "${fieldName}" is missing`],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        return {
          isValid: true,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString()
        };
      },
      severity: 'error'
    });

    // Date format validation
    this.validationRules.push({
      name: 'date-format',
      description: 'Date must be in YYYY-MM-DD format',
      validate: (value) => {
        if (!value) return { isValid: true, errors: [], warnings: [], timestamp: new Date().toISOString() };
        
        // Check if it matches YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (typeof value === 'string' && !dateRegex.test(value)) {
          return {
            isValid: false,
            errors: ['Date must be in YYYY-MM-DD format'],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        // Validate actual date
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return {
            isValid: false,
            errors: ['Invalid date value'],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        return {
          isValid: true,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString()
        };
      },
      severity: 'warning'
    });

    // Currency validation
    this.validationRules.push({
      name: 'currency-format',
      description: 'Currency values must be in ARS format (XXX.XX)',
      validate: (value) => {
        if (!value) return { isValid: true, errors: [], warnings: [], timestamp: new Date().toISOString() };
        
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return {
            isValid: false,
            errors: ['Currency value must be a valid number'],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        // Check if it's a reasonable currency amount (not negative)
        if (numValue < 0) {
          return {
            isValid: false,
            errors: ['Currency values must be positive'],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        return {
          isValid: true,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString()
        };
      },
      severity: 'warning'
    });

    // Category validation
    this.validationRules.push({
      name: 'category-valid',
      description: 'Category must be one of the approved values',
      validate: (value, context) => {
        const validCategories = [
          'Municipal', 'Provincial', 'Nacional', 'Organización Civil',
          'Presupuesto', 'Ejecución', 'Contrataciones', 'Financiero',
          'Administrativo', 'Educación', 'Salud', 'Obras', 'Servicios'
        ];
        
        if (!value) {
          return {
            isValid: false,
            errors: ['Category cannot be empty'],
            warnings: [],
            timestamp: new Date().toISOString()
          };
        }
        
        if (!validCategories.includes(String(value))) {
          return {
            isValid: false,
            errors: [`Invalid category "${value}". Must be one of: ${validCategories.join(', ')}`],
            warnings: ['Consider using a standard category'],
            timestamp: new Date().toISOString()
          };
        }
        
        return {
          isValid: true,
          errors: [],
          warnings: [],
          timestamp: new Date().toISOString()
        };
      },
      severity: 'warning'
    });
  }

  /**
   * Validate a single value against all applicable rules
   */
  validateValue(value: any, ruleName?: string, context?: any): ValidationResult {
    const rules = ruleName 
      ? this.validationRules.filter(r => r.name === ruleName)
      : this.validationRules;
    
    for (const rule of rules) {
      const result = rule.validate(value, context);
      if (!result.isValid) {
        return result;
      }
    }
    
    return {
      isValid: true,
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate an entire dataset against all rules
   */
  validateDataset(dataset: any[]): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // For each item in the dataset, validate all fields
    for (const [index, item] of dataset.entries()) {
      if (!item) continue;
      
      // Validate common fields
      const fieldsToValidate = [
        { name: 'amount', value: item.amount },
        { name: 'value', value: item.value },
        { name: 'date', value: item.date },
        { name: 'category', value: item.category }
      ];
      
      for (const field of fieldsToValidate) {
        if (field.value !== undefined && field.value !== null) {
          const result = this.validateValue(field.value, undefined, { fieldName: field.name });
          if (!result.isValid) {
            results.push({
              isValid: false,
              errors: result.errors,
              warnings: result.warnings,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Validate data against a specific schema
   */
  validateSchema(data: any, schema: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check required fields
    for (const [field, fieldConfig] of Object.entries(schema)) {
      const config = fieldConfig as any;
      
      if (config.required && (data[field] === undefined || data[field] === null)) {
        errors.push(`Required field "${field}" is missing`);
      }
      
      // Apply validation rule if defined
      if (config.validationRule) {
        const result = this.validateValue(data[field], config.validationRule, { fieldName: field });
        if (!result.isValid) {
          errors.push(...result.errors);
          warnings.push(...result.warnings);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate data quality metrics
   */
  calculateQualityMetrics(dataset: any[]): DataQualityMetrics {
    if (dataset.length === 0) {
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        validity: 0,
        totalScore: 0
      };
    }

    // Completeness: percentage of data points with required fields
    const requiredFields = ['amount', 'category', 'date'];
    const completeness = dataset.filter(item => 
      requiredFields.every(field => item[field] !== undefined && item[field] !== null)
    ).length / dataset.length;

    // Accuracy: validate all numeric fields
    let accuracyScore = 0;
    let validNumbers = 0;
    let totalNumbers = 0;

    dataset.forEach(item => {
      const numericFields = ['amount', 'value'];
      numericFields.forEach(field => {
        if (item[field] !== undefined && item[field] !== null) {
          totalNumbers++;
          if (!isNaN(Number(item[field])) && Number(item[field]) >= 0) {
            validNumbers++;
          }
        }
      });
    });

    accuracyScore = totalNumbers > 0 ? validNumbers / totalNumbers : 0;

    // Consistency: check that categories are consistent
    const categories = dataset.map(item => item.category).filter(Boolean);
    const uniqueCategories = new Set(categories);
    const consistency = uniqueCategories.size / (categories.length > 0 ? categories.length : 1);

    // Timeliness: based on dates (assuming current year is recent)
    const now = new Date();
    let validDates = 0;
    let totalDates = 0;

    dataset.forEach(item => {
      if (item.date) {
        totalDates++;
        const date = new Date(item.date);
        if (!isNaN(date.getTime()) && Math.abs(now.getTime() - date.getTime()) < 365 * 24 * 60 * 60 * 1000) {
          validDates++;
        }
      }
    });

    const timeliness = totalDates > 0 ? validDates / totalDates : 0;

    // Validity: percentage of data points that pass validation
    const validItems = dataset.filter(item => {
      return this.validateValue(item.amount).isValid && 
             this.validateValue(item.category).isValid &&
             this.validateValue(item.date).isValid;
    }).length;

    const validity = dataset.length > 0 ? validItems / dataset.length : 0;

    // Calculate total score (average of all metrics)
    const totalScore = (completeness + accuracyScore + consistency + timeliness + validity) / 5;

    return {
      completeness,
      accuracy: accuracyScore,
      consistency,
      timeliness,
      validity,
      totalScore
    };
  }

  /**
   * Get all validation rules
   */
  getValidationRules(): ValidationRule[] {
    return [...this.validationRules];
  }

  /**
   * Add a new validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.validationRules.push(rule);
  }
}

const dataValidationService = DataValidationService.getInstance();
export default dataValidationService;
export { DataValidationService };
