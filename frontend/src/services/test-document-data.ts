import { documentDataService } from './DocumentDataService';

async function testDocumentDataService() {
  console.log('Testing DocumentDataService...');
  
  try {
    // Test getting available years
    console.log('Getting available years...');
    const years = await documentDataService.getAvailableYears();
    console.log('Available years:', years);
    
    // Test getting categories for a specific year
    if (years.length > 0) {
      const testYear = years[0];
      console.log(`Getting categories for year ${testYear}...`);
      const categories = await documentDataService.getCategoriesForYear(testYear);
      console.log(`Categories for year ${testYear}:`, categories);
      
      // Test getting documents for a specific year and category
      if (categories.length > 0) {
        const testCategory = categories[0];
        console.log(`Getting documents for year ${testYear} and category ${testCategory}...`);
        const documents = await documentDataService.getDocumentsForYearAndCategory(testYear, testCategory);
        console.log(`Found ${documents.length} documents`);
        if (documents.length > 0) {
          console.log('First document:', documents[0]);
        }
      }
      
      // Test getting yearly data
      console.log(`Getting yearly data for year ${testYear}...`);
      const yearlyData = await documentDataService.getYearlyData(testYear);
      console.log(`Yearly data for ${testYear}:`, {
        totalDocuments: yearlyData.totalDocuments,
        verifiedDocuments: yearlyData.verifiedDocuments,
        categories: Object.keys(yearlyData.categories)
      });
    }
    
    // Test searching documents
    console.log('Searching for documents with query "presupuesto"...');
    const searchResults = await documentDataService.searchDocuments('presupuesto');
    console.log(`Found ${searchResults.length} documents matching "presupuesto"`);
    
    console.log('DocumentDataService test completed successfully!');
  } catch (error) {
    console.error('Error testing DocumentDataService:', error);
  }
}

// Run the test
testDocumentDataService();