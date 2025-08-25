const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'transparency_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  logging: false
});

// Data categories for Carmen de Areco transparency investigation
const DATA_CATEGORIES = {
  SALARIES: 'salaries',
  EXPENSES: 'operational_expenses',
  CONTRACTS: 'public_tenders',
  DEBTS: 'municipal_debt',
  INVESTMENTS: 'investments_assets',
  TREASURY: 'treasury_movements',
  DECLARATIONS: 'property_declarations'
};

class ExcelProcessor {
  constructor() {
    this.processedFiles = new Set();
    this.errors = [];
    this.stats = {
      filesProcessed: 0,
      recordsInserted: 0,
      errorsCount: 0
    };
  }

  async processExcelFile(filePath, category, year) {
    try {
      console.log(`Processing Excel file: ${filePath} for category: ${category}, year: ${year}`);
      
      // Check if file exists
      await fs.access(filePath);
      
      let workbook;
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.xlsx' || ext === '.xlsm') {
        // Use ExcelJS for .xlsx files
        workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
      } else if (ext === '.xls') {
        // Use XLSX library for legacy .xls files
        const fileBuffer = await fs.readFile(filePath);
        const xlsWorkbook = XLSX.read(fileBuffer, { type: 'buffer' });
        workbook = this.convertXLStoExcelJS(xlsWorkbook);
      } else {
        throw new Error(`Unsupported file format: ${ext}`);
      }

      const processedData = await this.extractDataFromWorkbook(workbook, category, year);
      await this.saveToDatabase(processedData, category);
      
      this.stats.filesProcessed++;
      this.processedFiles.add(filePath);
      
      return processedData;
    } catch (error) {
      this.errors.push({
        file: filePath,
        category,
        year,
        error: error.message
      });
      this.stats.errorsCount++;
      console.error(`Error processing ${filePath}:`, error.message);
      throw error;
    }
  }

  convertXLStoExcelJS(xlsWorkbook) {
    // Convert XLSX workbook to ExcelJS format
    const workbook = new ExcelJS.Workbook();
    
    xlsWorkbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.addWorksheet(sheetName);
      const xlsSheet = xlsWorkbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(xlsSheet, { header: 1 });
      
      jsonData.forEach((row, rowIndex) => {
        if (row.length > 0) {
          const excelRow = worksheet.addRow(row);
          excelRow.commit();
        }
      });
    });
    
    return workbook;
  }

  async extractDataFromWorkbook(workbook, category, year) {
    const extractedData = [];
    
    workbook.eachSheet((worksheet, sheetId) => {
      console.log(`Processing sheet: ${worksheet.name}`);
      
      const sheetData = this.processWorksheet(worksheet, category, year);
      if (sheetData.length > 0) {
        extractedData.push(...sheetData);
      }
    });
    
    return extractedData;
  }

  processWorksheet(worksheet, category, year) {
    const data = [];
    const headers = [];
    let headerRow = 1;
    
    // Find header row (usually row 1 or first non-empty row)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (headers.length === 0 && rowNumber <= 5) {
        row.eachCell((cell, colNumber) => {
          if (cell.value && typeof cell.value === 'string') {
            headers[colNumber] = this.normalizeHeader(cell.value);
          }
        });
        if (headers.some(h => h)) {
          headerRow = rowNumber;
          return;
        }
      }
      
      if (rowNumber > headerRow && headers.length > 0) {
        const record = this.extractRecordFromRow(row, headers, category, year);
        if (record && this.isValidRecord(record, category)) {
          data.push(record);
        }
      }
    });
    
    return data;
  }

  normalizeHeader(header) {
    return header.toString()
      .toLowerCase()
      .replace(/[áäà]/g, 'a')
      .replace(/[éëè]/g, 'e')
      .replace(/[íïì]/g, 'i')
      .replace(/[óöò]/g, 'o')
      .replace(/[úüù]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  extractRecordFromRow(row, headers, category, year) {
    const record = {
      category,
      year: parseInt(year),
      source_file: 'excel_import',
      created_at: new Date(),
      raw_data: {}
    };
    
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        let value = cell.value;
        
        // Handle different cell types
        if (cell.type === 'date') {
          value = cell.value;
        } else if (cell.type === 'number') {
          value = cell.value;
        } else if (cell.type === 'formula') {
          value = cell.result || cell.value;
        } else {
          value = cell.text || cell.value;
        }
        
        record.raw_data[header] = value;
      }
    });
    
    // Map common fields based on category
    this.mapCommonFields(record, category);
    
    return record;
  }

  mapCommonFields(record, category) {
    const data = record.raw_data;
    
    switch (category) {
      case DATA_CATEGORIES.SALARIES:
        record.employee_name = data.nombre || data.apellido_y_nombre || data.empleado;
        record.position = data.cargo || data.funcion || data.puesto;
        record.basic_salary = this.parseNumber(data.sueldo_basico || data.basico);
        record.total_salary = this.parseNumber(data.total || data.sueldo_total);
        record.month = data.mes || data.periodo;
        break;
        
      case DATA_CATEGORIES.EXPENSES:
        record.description = data.descripcion || data.concepto || data.detalle;
        record.amount = this.parseNumber(data.importe || data.monto || data.total);
        record.supplier = data.proveedor || data.beneficiario;
        record.date = this.parseDate(data.fecha);
        break;
        
      case DATA_CATEGORIES.CONTRACTS:
        record.contract_number = data.numero_contrato || data.expediente;
        record.description = data.descripcion || data.objeto;
        record.amount = this.parseNumber(data.importe || data.monto);
        record.contractor = data.contratista || data.adjudicatario;
        record.date = this.parseDate(data.fecha || data.fecha_adjudicacion);
        break;
        
      case DATA_CATEGORIES.TREASURY:
        record.movement_type = data.tipo || data.tipo_movimiento;
        record.amount = this.parseNumber(data.importe || data.monto);
        record.description = data.concepto || data.descripcion;
        record.date = this.parseDate(data.fecha);
        break;
    }
  }

  parseNumber(value) {
    if (value === null || value === undefined) return null;
    
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      // Remove currency symbols and thousands separators
      const cleaned = value.replace(/[$\s,\.]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }

  parseDate(value) {
    if (!value) return null;
    
    if (value instanceof Date) return value;
    
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  }

  isValidRecord(record, category) {
    // Basic validation based on category
    switch (category) {
      case DATA_CATEGORIES.SALARIES:
        return record.employee_name && (record.basic_salary || record.total_salary);
      case DATA_CATEGORIES.EXPENSES:
        return record.description && record.amount;
      case DATA_CATEGORIES.CONTRACTS:
        return record.description && record.amount;
      default:
        return Object.keys(record.raw_data).length > 0;
    }
  }

  async saveToDatabase(data, category) {
    if (data.length === 0) return;
    
    try {
      await sequelize.authenticate();
      
      // Create table if it doesn't exist
      const tableName = `processed_${category}`;
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id SERIAL PRIMARY KEY,
          category VARCHAR(50),
          year INTEGER,
          employee_name VARCHAR(255),
          position VARCHAR(255),
          basic_salary DECIMAL(12,2),
          total_salary DECIMAL(12,2),
          month VARCHAR(20),
          description TEXT,
          amount DECIMAL(12,2),
          supplier VARCHAR(255),
          contractor VARCHAR(255),
          contract_number VARCHAR(100),
          movement_type VARCHAR(100),
          date DATE,
          source_file VARCHAR(255),
          raw_data JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Insert data
      for (const record of data) {
        await sequelize.query(`
          INSERT INTO ${tableName} (
            category, year, employee_name, position, basic_salary, total_salary, month,
            description, amount, supplier, contractor, contract_number, movement_type,
            date, source_file, raw_data, created_at
          ) VALUES (
            :category, :year, :employee_name, :position, :basic_salary, :total_salary, :month,
            :description, :amount, :supplier, :contractor, :contract_number, :movement_type,
            :date, :source_file, :raw_data, :created_at
          )
        `, {
          replacements: {
            category: record.category,
            year: record.year,
            employee_name: record.employee_name || null,
            position: record.position || null,
            basic_salary: record.basic_salary || null,
            total_salary: record.total_salary || null,
            month: record.month || null,
            description: record.description || null,
            amount: record.amount || null,
            supplier: record.supplier || null,
            contractor: record.contractor || null,
            contract_number: record.contract_number || null,
            movement_type: record.movement_type || null,
            date: record.date || null,
            source_file: record.source_file,
            raw_data: JSON.stringify(record.raw_data),
            created_at: record.created_at
          }
        });
      }
      
      this.stats.recordsInserted += data.length;
      console.log(`Inserted ${data.length} records into ${tableName}`);
      
    } catch (error) {
      console.error('Database save error:', error);
      throw error;
    }
  }

  getStats() {
    return {
      ...this.stats,
      processedFiles: Array.from(this.processedFiles),
      errors: this.errors
    };
  }
}

// Main execution function
async function main() {
  const processor = new ExcelProcessor();
  
  try {
    console.log('Starting Excel data processing...');
    
    // Example: Process files from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('Usage: node process-excel-data.js <file_path> <category> <year>');
      console.log('Categories:', Object.values(DATA_CATEGORIES));
      process.exit(1);
    }
    
    const [filePath, category, year] = args;
    
    if (!Object.values(DATA_CATEGORIES).includes(category)) {
      console.error('Invalid category. Valid categories:', Object.values(DATA_CATEGORIES));
      process.exit(1);
    }
    
    await processor.processExcelFile(filePath, category, year);
    
    const stats = processor.getStats();
    console.log('Processing completed:', stats);
    
  } catch (error) {
    console.error('Processing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ExcelProcessor;