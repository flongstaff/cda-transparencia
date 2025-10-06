/**
 * PDFExtractionService - Enhanced PDF extraction for transparency documents
 * Handles extraction of financial data, tables, and metadata from municipal PDFs
 */

const pdf = require('pdf-parse');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

class PDFExtractionService {
  constructor() {
    this.extractedDataDir = path.join(__dirname, '..', '..', 'data', 'extracted');
    this.ensureDirectoryExists(this.extractedDataDir);
  }

  /**
   * Ensure directory exists, create if not
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory: ${dirPath}`, error.message);
    }
  }

  /**
   * Extract financial data from budget PDF
   */
  async extractBudgetData(pdfBuffer, fileName) {
    try {
      const data = await pdf(pdfBuffer);
      const text = data.text;
      
      // Extract budget-related information
      const budgetData = {
        fileName,
        numPages: data.numpages,
        extractedAt: new Date().toISOString(),
        metadata: data.metadata,
        budgetInfo: this.extractBudgetInfo(text),
        tables: this.extractTables(text),
        numbers: this.extractNumbers(text),
        textSample: text.substring(0, 1000)
      };

      // Save extracted data to JSON file
      const outputPath = path.join(this.extractedDataDir, `budget_${Date.now()}_${fileName.replace('.pdf', '.json')}`);
      await fs.writeFile(outputPath, JSON.stringify(budgetData, null, 2));

      return budgetData;
    } catch (error) {
      console.error('Error extracting budget data:', error.message);
      throw error;
    }
  }

  /**
   * Extract salary data from PDF
   */
  async extractSalaryData(pdfBuffer, fileName) {
    try {
      const data = await pdf(pdfBuffer);
      const text = data.text;
      
      const salaryData = {
        fileName,
        numPages: data.numpages,
        extractedAt: new Date().toISOString(),
        metadata: data.metadata,
        salaryInfo: this.extractSalaryInfo(text),
        personnel: this.extractPersonnelInfo(text),
        numbers: this.extractNumbers(text),
        textSample: text.substring(0, 1000)
      };

      // Save extracted data to JSON file
      const outputPath = path.join(this.extractedDataDir, `salary_${Date.now()}_${fileName.replace('.pdf', '.json')}`);
      await fs.writeFile(outputPath, JSON.stringify(salaryData, null, 2));

      return salaryData;
    } catch (error) {
      console.error('Error extracting salary data:', error.message);
      throw error;
    }
  }

  /**
   * Extract contract data from PDF
   */
  async extractContractData(pdfBuffer, fileName) {
    try {
      const data = await pdf(pdfBuffer);
      const text = data.text;
      
      const contractData = {
        fileName,
        numPages: data.numpages,
        extractedAt: new Date().toISOString(),
        metadata: data.metadata,
        contracts: this.extractContractInfo(text),
        numbers: this.extractNumbers(text),
        textSample: text.substring(0, 1000)
      };

      // Save extracted data to JSON file
      const outputPath = path.join(this.extractedDataDir, `contract_${Date.now()}_${fileName.replace('.pdf', '.json')}`);
      await fs.writeFile(outputPath, JSON.stringify(contractData, null, 2));

      return contractData;
    } catch (error) {
      console.error('Error extracting contract data:', error.message);
      throw error;
    }
  }

  /**
   * Extract information from a PDF URL
   */
  async extractFromUrl(pdfUrl, documentType = 'general') {
    try {
      console.log(`Extracting data from: ${pdfUrl}`);
      
      const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
        }
      });

      const fileName = path.basename(pdfUrl);
      const buffer = response.data;

      switch (documentType.toLowerCase()) {
        case 'budget':
        case 'presupuesto':
          return await this.extractBudgetData(buffer, fileName);
        case 'salary':
        case 'salario':
        case 'sueldo':
          return await this.extractSalaryData(buffer, fileName);
        case 'contract':
        case 'contrato':
        case 'licitacion':
          return await this.extractContractData(buffer, fileName);
        default:
          return await this.extractGeneralData(buffer, fileName);
      }
    } catch (error) {
      console.error(`Error extracting from URL ${pdfUrl}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract general data from PDF
   */
  async extractGeneralData(pdfBuffer, fileName) {
    try {
      const data = await pdf(pdfBuffer);
      const text = data.text;
      
      const generalData = {
        fileName,
        numPages: data.numpages,
        extractedAt: new Date().toISOString(),
        metadata: data.metadata,
        text: text,
        textLength: text.length,
        numbers: this.extractNumbers(text),
        sections: this.extractSections(text),
        keywords: this.extractKeyTerms(text),
        summary: this.generateSummary(text)
      };

      // Save extracted data to JSON file
      const outputPath = path.join(this.extractedDataDir, `general_${Date.now()}_${fileName.replace('.pdf', '.json')}`);
      await fs.writeFile(outputPath, JSON.stringify(generalData, null, 2));

      return generalData;
    } catch (error) {
      console.error('Error extracting general data:', error.message);
      throw error;
    }
  }

  /**
   * Extract budget information from text
   */
  extractBudgetInfo(text) {
    const budgetInfo = {
      totalBudget: null,
      totalExecuted: null,
      executionRate: null,
      categories: [],
      expenses: []
    };

    // Look for budget-related patterns
    const totalBudgetRegex = /total.*presupuestado[:\s]*([$€¥]?\s*[\d,]+\.?\d*)/gi;
    const totalExecutedRegex = /total.*ejecutado[:\s]*([$€¥]?\s*[\d,]+\.?\d*)/gi;
    const executionRateRegex = /ejecución.*[:\s]*([\d,]+\.?\d*)\s*%/gi;
    
    const budgetMatch = totalBudgetRegex.exec(text);
    const executedMatch = totalExecutedRegex.exec(text);
    const rateMatch = executionRateRegex.exec(text);

    if (budgetMatch) {
      budgetInfo.totalBudget = this.parseAmount(budgetMatch[1]);
    }
    if (executedMatch) {
      budgetInfo.totalExecuted = this.parseAmount(executedMatch[1]);
    }
    if (rateMatch) {
      budgetInfo.executionRate = parseFloat(rateMatch[1].replace(',', '.'));
    }

    return budgetInfo;
  }

  /**
   * Extract salary information from text
   */
  extractSalaryInfo(text) {
    const salaryInfo = {
      totalPayroll: null,
      employeeCount: null,
      averageSalary: null,
      categories: [],
      departments: []
    };

    // Look for salary patterns
    const totalPayrollRegex = /nómina.*total[:\s]*([$€¥]?\s*[\d,]+\.?\d*)/gi;
    const employeeCountRegex = /empleados[:\s]*([\d,]+)/gi;
    
    const payrollMatch = totalPayrollRegex.exec(text);
    const countMatch = employeeCountRegex.exec(text);

    if (payrollMatch) {
      salaryInfo.totalPayroll = this.parseAmount(payrollMatch[1]);
    }
    if (countMatch) {
      salaryInfo.employeeCount = parseInt(countMatch[1].replace(/,/g, ''));
    }

    return salaryInfo;
  }

  /**
   * Extract contract information from text
   */
  extractContractInfo(text) {
    const contracts = [];
    
    // Look for contract patterns
    const contractRegex = /contrato.*?(\d+).*?[:\s]*([A-Z][^.\n]*?)[\s\S]*?monto[:\s]*([$€¥]?\s*[\d,]+\.?\d*)/gi;
    
    let match;
    while ((match = contractRegex.exec(text)) !== null) {
      contracts.push({
        id: match[1],
        description: match[2].trim(),
        amount: this.parseAmount(match[3]),
        date: this.extractDate(text, match.index) // Simplified date extraction
      });
    }

    return contracts;
  }

  /**
   * Extract tables from text (basic approach)
   */
  extractTables(text) {
    // This is a simplified approach - real table extraction would be more complex
    const tables = [];
    
    // Look for potential table structures by identifying repeated patterns
    const tablePattern = /([A-Z][^:\n]+:\s*[\d,]+\.?\d*\s*){3,}/g;
    let match;
    while ((match = tablePattern.exec(text)) !== null) {
      tables.push(match[0].trim());
    }

    return tables;
  }

  /**
   * Extract numbers from text
   */
  extractNumbers(text) {
    const numberRegex = /[\d,]+\.?\d*/g;
    const matches = text.match(numberRegex);
    if (!matches) return [];

    return matches.map(num => parseFloat(num.replace(/,/g, ''))).filter(num => !isNaN(num));
  }

  /**
   * Extract personnel information
   */
  extractPersonnelInfo(text) {
    const personnel = [];
    
    // Look for employee patterns
    const empRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*).*?(?:cargo|posición|cargo)[:\s]*([A-Z][a-z\s]+)/gi;
    let match;
    while ((match = empRegex.exec(text)) !== null) {
      personnel.push({
        name: match[1].trim(),
        position: match[2].trim()
      });
    }

    return personnel;
  }

  /**
   * Extract sections from text
   */
  extractSections(text) {
    const sections = [];
    
    // Look for section patterns (headers, etc.)
    const sectionRegex = /^(?:\s*[A-Z][A-Z\s]{10,}|\d+\.\s[A-Z].*)$/gm;
    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
      sections.push({
        text: match[0].trim(),
        position: match.index
      });
    }

    return sections;
  }

  /**
   * Extract key terms from text
   */
  extractKeyTerms(text) {
    const terms = new Set();
    const relevantTerms = [
      'presupuesto', 'ejecución', 'gastos', 'ingresos', 'contratos', 'licitaciones',
      'sueldos', 'personal', 'nómina', 'deuda', 'tesorería', 'inversiones',
      'ordenanzas', 'expedientes', 'documentos', 'transparencia'
    ];

    for (const term of relevantTerms) {
      if (text.toLowerCase().includes(term)) {
        terms.add(term);
      }
    }

    return Array.from(terms);
  }

  /**
   * Generate a summary of the document
   */
  generateSummary(text) {
    // Take first 300 chars plus key info from the document
    const first300 = text.substring(0, 300);
    const keyTerms = this.extractKeyTerms(text);
    
    return {
      first300Chars: first300,
      keyTerms: keyTerms,
      wordCount: text.split(/\s+/).length,
      hasBudgetInfo: first300.toLowerCase().includes('presupuesto') || first300.toLowerCase().includes('budget'),
      hasFinancialData: first300.toLowerCase().includes('monto') || first300.toLowerCase().includes('amount')
    };
  }

  /**
   * Parse amount from string
   */
  parseAmount(amountStr) {
    try {
      // Remove currency symbols and commas, convert to number
      const cleanAmount = amountStr.replace(/[^\d,.]/g, '');
      return parseFloat(cleanAmount.replace(/,/g, ''));
    } catch (error) {
      console.warn(`Could not parse amount: ${amountStr}`, error.message);
      return null;
    }
  }

  /**
   * Extract date from context
   */
  extractDate(text, contextStart) {
    // Look for dates near the context position
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
    const context = text.substring(Math.max(0, contextStart - 100), contextStart + 100);
    const match = dateRegex.exec(context);
    return match ? match[1] : null;
  }
}

// Export a singleton instance
const pdfExtractionService = new PDFExtractionService();
module.exports = pdfExtractionService;