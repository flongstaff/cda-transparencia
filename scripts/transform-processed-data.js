const fs = require('fs');
const path = require('path');

/**
 * Transform processed data into structured JSON files for frontend consumption
 */
function transformProcessedData() {
  console.log('🔄 Transforming processed data for frontend consumption...');
  
  const processedDir = path.join(__dirname, '../data/processed');
  const publicDataDir = path.join(__dirname, '../frontend/public/data');
  
  // Ensure the public data directory exists
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  
  // Process each year directory
  const yearDirs = fs.readdirSync(processedDir).filter(item => {
    return fs.statSync(path.join(processedDir, item)).isDirectory() && 
           /^\d{4}$/.test(item); // Only 4-digit year directories
  });
  
  console.log(`📅 Found ${yearDirs.length} years of data:`, yearDirs);
  
  // Process each year
  for (const year of yearDirs) {
    const yearDir = path.join(processedDir, year);
    const consolidatedFile = path.join(yearDir, 'consolidated_data.json');
    
    if (!fs.existsSync(consolidatedFile)) {
      console.log(`⚠️  No consolidated_data.json found for year ${year}`);
      continue;
    }
    
    try {
      const consolidatedData = JSON.parse(fs.readFileSync(consolidatedFile, 'utf8'));
      
      // Create structured data for each expected data type
      createBudgetData(consolidatedData, year, publicDataDir);
      createContractData(consolidatedData, year, publicDataDir);
      createDocumentData(consolidatedData, year, publicDataDir);
      createTreasuryData(consolidatedData, year, publicDataDir);
      createSalaryData(consolidatedData, year, publicDataDir);
      createDebtData(consolidatedData, year, publicDataDir);
      
      console.log(`✅ Processed data for year ${year}`);
    } catch (error) {
      console.error(`❌ Error processing year ${year}:`, error);
    }
  }
  
  // Create multi-source report with all years data
  createMultiSourceReport(yearDirs, processedDir, publicDataDir);
  
  console.log('✅ All data transformed successfully');
}

/**
 * Create budget data file for a year
 */
function createBudgetData(consolidatedData, year, publicDataDir) {
  const budgetDir = path.join(publicDataDir, 'organized_documents', 'json');
  if (!fs.existsSync(budgetDir)) {
    fs.mkdirSync(budgetDir, { recursive: true });
  }
  
  // Extract budget-related information from consolidated data
  const budgetData = {
    year: parseInt(year),
    total_budget: 0,
    total_executed: 0,
    execution_rate: 0,
    budget_links: [],
    budget_execution: [],
    revenue: {},
    expenditure: {}
  };
  
  // Try to get budget execution data from consolidated_data.json
  const budgetExecFile = consolidatedData.financial_data_files.find(file => 
    file.filename.includes('Budget_Execution') || file.filename.includes('budget')
  );
  
  if (budgetExecFile && budgetExecFile.sample_rows && budgetExecFile.sample_rows.length > 1) {
    const sampleRow = budgetExecFile.sample_rows[1]; // Skip header row
    if (sampleRow.length >= 3) {
      // Try to parse budget and execution values, removing dollar signs and commas
      const budgetValue = parseNumber(sampleRow[1]);
      const executedValue = parseNumber(sampleRow[2]);
      
      if (budgetValue > 0) {
        budgetData.total_budget = budgetValue;
        if (executedValue > 0) {
          budgetData.total_executed = executedValue;
          budgetData.execution_rate = (executedValue / budgetValue) * 100;
        }
      }
    }
    
    // Create budget execution data from sample rows
    budgetData.budget_execution = budgetExecFile.sample_rows.slice(1).map(row => {
      if (row.length >= 4) {
        return {
          quarter: row[0],
          budgeted: parseNumber(row[1]),
          executed: parseNumber(row[2]),
          percentage: parseFloat(row[3]) || 0
        };
      }
      return null;
    }).filter(Boolean);
  }
  
  // Write the budget data file
  const budgetFilePath = path.join(budgetDir, `budget_data_${year}.json`);
  fs.writeFileSync(budgetFilePath, JSON.stringify(budgetData, null, 2));
}

/**
 * Create contracts data file for a year
 */
function createContractData(consolidatedData, year, publicDataDir) {
  const contractsDir = path.join(publicDataDir, 'organized_documents', 'json');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  // Extract contract-related information
  const contractsData = {
    contracts: [],
    total_contracts: 0
  };
  
  // Look for infrastructure projects or contracts in the data
  const infraProjectsFile = consolidatedData.financial_data_files.find(file => 
    file.filename.includes('Infrastructure_Projects')
  );
  
  if (infraProjectsFile && infraProjectsFile.sample_rows && infraProjectsFile.sample_rows.length > 1) {
    contractsData.contracts = infraProjectsFile.sample_rows.slice(1).map(row => {
      if (row.length >= 5) {
        return {
          id: `${year}-${row[0].replace(/[^\w]/g, '')}`,
          title: row[0],
          contractor: row[0],
          status: row[1],
          budget: parseNumber(row[2]),
          executed: parseNumber(row[3]),
          completion: row[4],
          year: parseInt(year)
        };
      }
      return null;
    }).filter(Boolean);
    
    contractsData.total_contracts = contractsData.contracts.length;
  }
  
  // Write the contracts data file
  const contractsFilePath = path.join(contractsDir, `contracts_data_${year}.json`);
  fs.writeFileSync(contractsFilePath, JSON.stringify(contractsData, null, 2));
}

/**
 * Create documents data file for a year
 */
function createDocumentData(consolidatedData, year, publicDataDir) {
  const documentsDir = path.join(publicDataDir, 'organized_documents', 'json');
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }
  
  // Extract document-related information
  const documentsData = {
    documents: [],
    total: 0,
    categories: []
  };
  
  // Use file metadata as document sources
  for (const file of consolidatedData.financial_data_files) {
    documentsData.documents.push({
      id: `${year}-${file.filename.replace(/[^\w]/g, '')}`,
      title: file.filename,
      year: parseInt(year),
      category: 'Financial Report',
      source: file.filename,
      headers: file.headers
    });
  }
  
  documentsData.total = documentsData.documents.length;
  documentsData.categories = ['Financial Report'];
  
  // Write the documents data file
  const documentsFilePath = path.join(documentsDir, `documents_data_${year}.json`);
  fs.writeFileSync(documentsFilePath, JSON.stringify(documentsData, null, 2));
}

/**
 * Create treasury data file for a year
 */
function createTreasuryData(consolidatedData, year, publicDataDir) {
  const treasuryDir = path.join(publicDataDir, 'organized_documents', 'json');
  if (!fs.existsSync(treasuryDir)) {
    fs.mkdirSync(treasuryDir, { recursive: true });
  }
  
  // Extract treasury-related information
  const treasuryData = {
    year: parseInt(year),
    income: 0,
    expenses: 0,
    balance: 0
  };
  
  // Look for revenue and expenditure data
  const revenueFile = consolidatedData.financial_data_files.find(file => 
    file.filename.includes('Revenue') || file.filename.includes('revenue')
  );
  const expenditureFile = consolidatedData.financial_data_files.find(file => 
    file.filename.includes('Expenditure') || file.filename.includes('expenditure')
  );
  
  if (revenueFile && revenueFile.sample_rows && revenueFile.sample_rows.length > 1) {
    // Sum up revenue from all sources
    for (let i = 1; i < revenueFile.sample_rows.length; i++) {
      const row = revenueFile.sample_rows[i];
      if (row.length >= 2) {
        treasuryData.income += parseNumber(row[1]);
      }
    }
  }
  
  if (expenditureFile && expenditureFile.sample_rows && expenditureFile.sample_rows.length > 1) {
    for (let i = 1; i < expenditureFile.sample_rows.length; i++) {
      const row = expenditureFile.sample_rows[i];
      if (row.length >= 2) {
        treasuryData.expenses += parseNumber(row[1]);
      }
    }
  }
  
  treasuryData.balance = treasuryData.income - treasuryData.expenses;
  
  // Write the treasury data file
  const treasuryFilePath = path.join(treasuryDir, `treasury_data_${year}.json`);
  fs.writeFileSync(treasuryFilePath, JSON.stringify(treasuryData, null, 2));
}

/**
 * Create salary data file for a year
 */
function createSalaryData(consolidatedData, year, publicDataDir) {
  const salaryDir = path.join(publicDataDir, 'organized_documents', 'json');
  if (!fs.existsSync(salaryDir)) {
    fs.mkdirSync(salaryDir, { recursive: true });
  }
  
  // Extract salary-related information
  const salaryData = {
    year: parseInt(year),
    salaries: [],
    total_salaries: 0
  };
  
  const personnelFile = consolidatedData.financial_data_files.find(file => 
    file.filename.includes('Personnel_Expenses')
  );
  
  if (personnelFile && personnelFile.sample_rows && personnelFile.sample_rows.length > 1) {
    // Map personnel expense categories to salary data
    for (let i = 1; i < personnelFile.sample_rows.length; i++) {
      const row = personnelFile.sample_rows[i];
      if (row.length >= 4) {
        salaryData.salaries.push({
          category: row[0],
          budgeted: parseNumber(row[1]),
          executed: parseNumber(row[2]),
          percentage: parseFloat(row[3]),
          year: parseInt(year)
        });
      }
    }
    
    // Calculate total salaries from executed amounts
    salaryData.total_salaries = salaryData.salaries.reduce((total, item) => total + item.executed, 0);
  }
  
  // Write the salary data file
  const salaryFilePath = path.join(salaryDir, `salaries_data_${year}.json`);
  fs.writeFileSync(salaryFilePath, JSON.stringify(salaryData, null, 2));
}

/**
 * Create debt data file for a year
 */
function createDebtData(consolidatedData, year, publicDataDir) {
  const debtDir = path.join(publicDataDir, 'organized_documents', 'json');
  if (!fs.existsSync(debtDir)) {
    fs.mkdirSync(debtDir, { recursive: true });
  }
  
  // Extract debt-related information
  const debtData = {
    year: parseInt(year),
    total_debt: 0,
    debt_service: 0,
    debt_by_type: {}
  };
  
  const debtFile = consolidatedData.financial_data_files.find(file => 
    file.filename.includes('Debt_Report')
  );
  
  if (debtFile && debtFile.sample_rows && debtFile.sample_rows.length > 1) {
    // Extract debt values
    for (let i = 1; i < debtFile.sample_rows.length; i++) {
      const row = debtFile.sample_rows[i];
      if (row.length >= 2) {
        debtData.total_debt += parseNumber(row[1]);
        
        // Store debt by type
        if (row.length >= 4) {
          debtData.debt_by_type[row[0]] = {
            amount: parseNumber(row[1]),
            interest_rate: row[2],
            maturity: row[3]
          };
        }
      }
    }
  }
  
  // Write the debt data file
  const debtFilePath = path.join(debtDir, `debt_data_${year}.json`);
  fs.writeFileSync(debtFilePath, JSON.stringify(debtData, null, 2));
}

/**
 * Create multi-source report with all years data
 */
function createMultiSourceReport(years, processedDir, publicDataDir) {
  const multiYearData = {
    generated_at: new Date().toISOString(),
    multi_year_summary: [],
    sources: {
      budget: {
        structured_data: {}
      },
      contracts: {
        structured_data: {}
      },
      documents: {
        structured_data: {}
      },
      treasury: {
        structured_data: {}
      },
      salaries: {
        structured_data: {}
      },
      debt: {
        structured_data: {}
      }
    }
  };
  
  // Process each year to create multi-year summary
  for (const year of years) {
    const yearDir = path.join(processedDir, year);
    const consolidatedFile = path.join(yearDir, 'consolidated_data.json');
    
    if (fs.existsSync(consolidatedFile)) {
      try {
        const consolidatedData = JSON.parse(fs.readFileSync(consolidatedFile, 'utf8'));
        
        // Extract summary information for the year
        const summary = {
          year: parseInt(year),
          total_budget: 0,
          expenses: 0,
          execution_rate: 0
        };
        
        // Try to get budget and expense data
        const budgetExecFile = consolidatedData.financial_data_files.find(file => 
          file.filename.includes('Budget_Execution')
        );
        
        if (budgetExecFile && budgetExecFile.sample_rows && budgetExecFile.sample_rows.length > 1) {
          // Calculate total budget and execution
          for (let i = 1; i < budgetExecFile.sample_rows.length; i++) {
            const row = budgetExecFile.sample_rows[i];
            if (row.length >= 3) {
              summary.total_budget += parseNumber(row[1]);
              summary.expenses += parseNumber(row[2]);
            }
          }
          
          if (summary.total_budget > 0) {
            summary.execution_rate = (summary.expenses / summary.total_budget) * 100;
          }
        }
        
        multiYearData.multi_year_summary.push(summary);
      } catch (error) {
        console.error(`Error processing summary for year ${year}:`, error);
      }
    }
  }
  
  // Write the multi-source report
  const reportDir = path.join(publicDataDir);
  const reportPath = path.join(reportDir, 'multi_source_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(multiYearData, null, 2));
  
  console.log(`📊 Multi-source report created with ${multiYearData.multi_year_summary.length} years`);
}

/**
 * Parse monetary values from strings (removing $, commas, etc.)
 */
function parseNumber(value) {
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Remove currency symbols and commas, then convert to number
    const cleaned = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  
  return 0;
}

// Run the transformation
transformProcessedData();