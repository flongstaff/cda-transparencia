const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const dataDir = path.join(__dirname, '../data');
const publicDir = path.join(__dirname, '../frontend/public/data');

async function generateDataIndex() {
  console.log('Generating data index files...');

  const years = [2020, 2021, 2022, 2023, 2024, 2025]; // Add more years as needed

  const allJsonFiles = await glob.sync(path.join(dataDir, '**/*.json'));
  const allMdFiles = await glob.sync(path.join(dataDir, 'markdown_documents/**/*.md'));

  for (const year of years) {
    const yearData = {
      year,
      financial_data: {},
      documents: [],
      treasury_data: {},
      budget_breakdown: [],
      json_files: {},
      markdown_files: {},
    };

    for (const file of allJsonFiles) {
      if (file.includes(year)) {
        const fileName = path.basename(file);
        const fileContent = await fs.readJson(file);
        yearData.json_files[fileName] = fileContent;

        // Populate documents
        if (fileName.includes('document') || fileName.includes('transparency')) {
          if (fileContent.documents && Array.isArray(fileContent.documents)) {
            yearData.documents.push(...fileContent.documents);
          } else if (fileContent.files && Array.isArray(fileContent.files)) {
            yearData.documents.push(...fileContent.files);
          }
        }
      }
    }

    for (const file of allMdFiles) {
      if (file.includes(year)) {
        const fileName = path.basename(file);
        const fileContent = await fs.readFile(file, 'utf-8');
        yearData.markdown_files[fileName] = fileContent;
      }
    }

    // Process financial data
    const { financial_data, treasury_data, budget_breakdown, salary_data, contract_data, investment_data, audit_anomalies, property_data } = processFinancialData(yearData.json_files, year);
    yearData.financial_data = financial_data;
    yearData.treasury_data = treasury_data;
    yearData.budget_breakdown = budget_breakdown;
    yearData.salary_data = salary_data;
    yearData.contract_data = contract_data;
    yearData.investment_data = investment_data;
    yearData.audit_anomalies = audit_anomalies;
    yearData.property_data = property_data;

    const filePath = path.join(publicDir, `data_index_${year}.json`);
    await fs.writeJson(filePath, yearData, { spaces: 2 });
    console.log(`Generated ${filePath}`);
  }

  console.log('Data index generation complete.');
}

function processFinancialData(jsonFiles, year) {
  const financial_data = {
    total_budget: 0,
    total_executed: 0,
    execution_rate: 0,
    total_revenue: 0,
    total_debt: 0,
  };
  const treasury_data = {
    total_income: 0,
    total_expenses: 0,
    current_balance: 0,
    movements: [],
  };
  const budget_breakdown = [];
  const salary_data = [];
  const contract_data = [];
  const investment_data = [];
  const audit_anomalies = [];
  const property_data = [];

  for (const fileName in jsonFiles) {
    const content = jsonFiles[fileName];

    // Process budget data
    if (fileName.includes('budget') || fileName.includes('gastos') || fileName.includes('presupuesto')) {
      if (content && content.categories && Array.isArray(content.categories)) {
        budget_breakdown.push(...content.categories);
        financial_data.total_budget += content.totalBudget || 0;
        financial_data.total_executed += content.totalExecuted || 0;
      }
    }

    // Process treasury data
    if (fileName.includes('treasury') || fileName.includes('movimientos') || fileName.includes('recursos')) {
      if (content && content.movements && Array.isArray(content.movements)) {
        treasury_data.movements.push(...content.movements);
        treasury_data.total_income += content.totalIncome || 0;
        treasury_data.total_expenses += content.totalExpenses || 0;
        treasury_data.current_balance += content.currentBalance || 0;
      }
    }

    // Process salary data
    if (fileName.includes('salaries') || fileName.includes('sueldos')) {
      if (Array.isArray(content)) {
        salary_data.push(...content);
      } else if (content.positions && Array.isArray(content.positions)) {
        salary_data.push(...content.positions);
      }
    }

    // Process contract data
    if (fileName.includes('contracts') || fileName.includes('tenders') || fileName.includes('licitacion')) {
      if (Array.isArray(content)) {
        contract_data.push(...content);
      } else if (content.contract_documents && Array.isArray(content.contract_documents)) {
        contract_data.push(...content.contract_documents);
      }
    }

    // Process investment data
    if (fileName.includes('investment') || fileName.includes('inversion') || fileName.includes('activos')) {
      if (Array.isArray(content)) {
        investment_data.push(...content);
      } else if (content.items && Array.isArray(content.items)) {
        investment_data.push(...content.items);
      }
    }

    // Process audit anomalies
    if (fileName.includes('audit') || fileName.includes('anomalies')) {
      if (Array.isArray(content)) {
        audit_anomalies.push(...content);
      } else if (content.anomalies && Array.isArray(content.anomalies)) {
        audit_anomalies.push(...content.anomalies);
      }
    }

    // Process property declarations
    if (fileName.includes('declarations') || fileName.includes('patrimonial')) {
      if (Array.isArray(content)) {
        property_data.push(...content);
      } else if (content.declaration_documents && Array.isArray(content.declaration_documents)) {
        property_data.push(...content.declaration_documents);
      }
    }
  }

  // Calculate overall execution rate
  if (financial_data.total_budget > 0) {
    financial_data.execution_rate = (financial_data.total_executed / financial_data.total_budget) * 100;
  }

  return { financial_data, treasury_data, budget_breakdown, salary_data, contract_data, investment_data, audit_anomalies, property_data };
}

generateDataIndex();
