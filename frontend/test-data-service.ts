// Test script to verify data loading
import { dataService } from './src/services/dataService';

(async () => {
  console.log('Testing data loading...');
  
  try {
    const data = await dataService.getAllYears();
    console.log('Loaded data:', data);
    console.log('Number of years:', data.length);
  } catch (error) {
    console.error('Error loading data:', error);
  }
})();