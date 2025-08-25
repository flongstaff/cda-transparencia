// Script to populate the database with sample data
const sequelize = require('./config/database');
const sampleData = require('./sample-data');
const {
  PropertyDeclaration,
  Salary,
  PublicTender,
  FinancialReport,
  TreasuryMovement,
  FeeRight,
  OperationalExpense,
  MunicipalDebt,
  InvestmentAsset,
  FinancialIndicator
} = require('./models');

async function populateDatabase() {
  try {
    // Authenticate and sync database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');
    
    // Populate Property Declarations
    await PropertyDeclaration.bulkCreate(sampleData.propertyDeclarations);
    console.log(`Inserted ${sampleData.propertyDeclarations.length} property declarations.`);
    
    // Populate Salaries
    await Salary.bulkCreate(sampleData.salaries);
    console.log(`Inserted ${sampleData.salaries.length} salary records.`);
    
    // Populate Public Tenders
    await PublicTender.bulkCreate(sampleData.publicTenders);
    console.log(`Inserted ${sampleData.publicTenders.length} public tenders.`);
    
    // Populate Financial Reports
    await FinancialReport.bulkCreate(sampleData.financialReports);
    console.log(`Inserted ${sampleData.financialReports.length} financial reports.`);
    
    // Populate Treasury Movements
    await TreasuryMovement.bulkCreate(sampleData.treasuryMovements);
    console.log(`Inserted ${sampleData.treasuryMovements.length} treasury movements.`);
    
    // Populate Fees and Rights
    await FeeRight.bulkCreate(sampleData.feesRights);
    console.log(`Inserted ${sampleData.feesRights.length} fees and rights records.`);
    
    // Populate Operational Expenses
    await OperationalExpense.bulkCreate(sampleData.operationalExpenses);
    console.log(`Inserted ${sampleData.operationalExpenses.length} operational expenses.`);
    
    // Populate Municipal Debt
    await MunicipalDebt.bulkCreate(sampleData.municipalDebt);
    console.log(`Inserted ${sampleData.municipalDebt.length} municipal debt records.`);
    
    // Populate Investments and Assets
    await InvestmentAsset.bulkCreate(sampleData.investmentsAssets);
    console.log(`Inserted ${sampleData.investmentsAssets.length} investments and assets.`);
    
    // Populate Financial Indicators
    await FinancialIndicator.bulkCreate(sampleData.financialIndicators);
    console.log(`Inserted ${sampleData.financialIndicators.length} financial indicators.`);
    
    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the population script
if (require.main === module) {
  populateDatabase();
}

module.exports = populateDatabase;