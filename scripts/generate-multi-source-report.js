const fs = require('fs');
const path = require('path');

/**
 * Generate a comprehensive multi-source report with actual data
 * This will allow the frontend to properly load and display financial information
 */

function generateMultiSourceReport() {
  console.log('🔄 Generating multi-source report with actual data...');
  
  const dataDir = path.join(__dirname, '../data/processed');
  const outputDir = path.join(__dirname, '../frontend/public/data');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Process each year directory
  const yearDirs = fs.readdirSync(dataDir).filter(item => {
    return fs.statSync(path.join(dataDir, item)).isDirectory() && 
           /^\d{4}$/.test(item); // Only 4-digit year directories
  });
  
  console.log(`📅 Found ${yearDirs.length} years of data:`, yearDirs);
  
  // Initialize the multi-source report structure
  const multiSourceReport = {
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
  
  // Process each year
  for (const year of yearDirs) {
    const yearDir = path.join(dataDir, year);
    const consolidatedFile = path.join(yearDir, 'consolidated_data.json');
    
    if (!fs.existsSync(consolidatedFile)) {
      console.log(`⚠️  No consolidated_data.json found for year ${year}`);
      continue;
    }
    
    try {
      const consolidatedData = JSON.parse(fs.readFileSync(consolidatedFile, 'utf8'));
      
      // Extract year data for summary
      const yearSummary = {
        year: parseInt(year),
        total_budget: 0,
        expenses: 0,
        execution_rate: 0
      };
      
      // Process financial data to extract meaningful information
      if (consolidatedData.financial_data_files) {
        // Look for budget execution data
        const budgetExecFile = consolidatedData.financial_data_files.find(file => 
          file.filename.includes('Budget_Execution')
        );
        
        if (budgetExecFile && budgetExecFile.sample_rows && budgetExecFile.sample_rows.length > 1) {
          // Calculate totals from budget execution data
          let totalBudgeted = 0;
          let totalExecuted = 0;
          
          // Skip header row and process data rows
          for (let i = 1; i < budgetExecFile.sample_rows.length; i++) {
            const row = budgetExecFile.sample_rows[i];
            if (row.length >= 3) {
              // Parse monetary values (remove $ and commas)
              const budgeted = parseFloat(row[1].replace(/[$,]/g, '')) || 0;
              const executed = parseFloat(row[2].replace(/[$,]/g, '')) || 0;
              
              totalBudgeted += budgeted;
              totalExecuted += executed;
            }
          }
          
          yearSummary.total_budget = totalBudgeted;
          yearSummary.expenses = totalExecuted;
          yearSummary.execution_rate = totalBudgeted > 0 ? (totalExecuted / totalBudgeted) * 100 : 0;
        }
        
        // Extract structured data for each category
        multiSourceReport.sources.budget.structured_data[year] = {
          year: parseInt(year),
          total_budget: yearSummary.total_budget,
          total_executed: yearSummary.expenses,
          execution_rate: yearSummary.execution_rate,
          budget_execution: consolidatedData.financial_data_files.find(file => 
            file.filename.includes('Budget_Execution')
          ),
          revenue: consolidatedData.financial_data_files.find(file => 
            file.filename.includes('Revenue')
          ),
          expenditure: consolidatedData.financial_data_files.find(file => 
            file.filename.includes('Expenditure')
          )
        };
        
        multiSourceReport.sources.contracts.structured_data[year] = {
          year: parseInt(year),
          contracts: consolidatedData.financial_data_files.find(file => 
            file.filename.includes('Infrastructure_Projects')
          )
        };
        
        multiSourceReport.sources.salaries.structured_data[year] = {
          year: parseInt(year),
          salaries: consolidatedData.financial_data_files.find(file => 
            file.filename.includes('Personnel_Expenses')
          )
        };
        
        multiSourceReport.sources.debt.structured_data[year] = {
          year: parseInt(year),
          debt: consolidatedData.financial_data_files.find(file => 
            file.filename.includes('Debt_Report')
          )
        };
        
        // Add revenue sources data
        const revenueSources = consolidatedData.financial_data_files.find(file => 
          file.filename.includes('Revenue_Sources')
        );
        
        if (revenueSources) {
          multiSourceReport.sources.budget.structured_data[year].revenue_by_source = revenueSources;
        }
      }
      
      // Add year summary to multi-year data
      multiSourceReport.multi_year_summary.push(yearSummary);
      
      console.log(`✅ Processed data for year ${year}`);
    } catch (error) {
      console.error(`❌ Error processing year ${year}:`, error);
    }
  }
  
  // Sort multi-year summary by year
  multiSourceReport.multi_year_summary.sort((a, b) => a.year - b.year);
  
  // Write the multi-source report to the frontend public data directory
  const outputPath = path.join(outputDir, 'multi_source_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(multiSourceReport, null, 2));
  
  console.log(`✅ Multi-source report generated with ${multiSourceReport.multi_year_summary.length} years of data`);
  console.log(`📊 Report written to: ${outputPath}`);
  
  // Also generate individual year data files for backward compatibility
  generateIndividualYearFiles(multiSourceReport);
}

/**
 * Generate individual year data files for backward compatibility
 */
function generateIndividualYearFiles(multiSourceReport) {
  const outputDir = path.join(__dirname, '../frontend/public/data/organized_documents/json');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate files for each year
  for (const yearData of multiSourceReport.multi_year_summary) {
    const year = yearData.year;
    
    // Create budget data file
    const budgetData = {
      year: year,
      total_budget: yearData.total_budget,
      total_executed: yearData.expenses,
      execution_rate: yearData.execution_rate,
      ...(multiSourceReport.sources.budget.structured_data[year] || {})
    };
    
    const budgetFilePath = path.join(outputDir, `budget_data_${year}.json`);
    fs.writeFileSync(budgetFilePath, JSON.stringify(budgetData, null, 2));
    
    // Create contracts data file
    const contractsData = {
      year: year,
      contracts: [],
      ...(multiSourceReport.sources.contracts.structured_data[year] || {})
    };
    
    const contractsFilePath = path.join(outputDir, `contracts_data_${year}.json`);
    fs.writeFileSync(contractsFilePath, JSON.stringify(contractsData, null, 2));
    
    // Create salary data file
    const salaryData = {
      year: year,
      salaries: [],
      ...(multiSourceReport.sources.salaries.structured_data[year] || {})
    };
    
    const salaryFilePath = path.join(outputDir, `salaries_data_${year}.json`);
    fs.writeFileSync(salaryFilePath, JSON.stringify(salaryData, null, 2));
    
    // Create debt data file
    const debtData = {
      year: year,
      total_debt: 0,
      debt_service: 0,
      ...(multiSourceReport.sources.debt.structured_data[year] || {})
    };
    
    const debtFilePath = path.join(outputDir, `debt_data_${year}.json`);
    fs.writeFileSync(debtFilePath, JSON.stringify(debtData, null, 2));
  }
  
  console.log('✅ Individual year data files generated for backward compatibility');
}

// Run the generation
generateMultiSourceReport();