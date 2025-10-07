const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Check Carmen de Areco document URLs following the known pattern
 * Pattern: https://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{document_name}.pdf
 * Example: https://carmendeareco.gob.ar/wp-content/uploads/2025/02/Estado-de-Ejecucion-de-Recursos-por-Procedencia-4toTrimestres.pdf
 */

async function checkCarmenDeArecoDocumentURLs() {
  const baseUrl = 'https://carmendeareco.gob.ar/wp-content/uploads';
  const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  
  // Common document patterns based on our local repository
  const commonDocumentNames = [
    'Estado-de-Ejecucion-de-Gastos',
    'Estado-de-Ejecucion-de-Recursos',
    'Estado-de-Ejecucion-de-Gastos-por-Finalidad-y-Funcion',
    'Estado-de-Ejecucion-de-Gastos-por-Caracter-Economico',
    'Estado-de-Ejecucion-de-Recursos-por-Procedencia',
    'Estado-de-Ejecucion-de-Recursos-Afectados-vs-Gastos',
    'Estado-de-Ejecucion-de-Gastos-con-Perspectiva-de-Genero',
    'GASTOS-POR-CARACTER-ECONOMICO',
    'ESTADO-DE-EJECUCION-DE-GASTOS',
    'ESTADO-DE-EJECUCION-DE-RECURSOS',
    'RECURSOS-AFECTADOS-VS-GASTOS',
    'SUELDOS',
    'LICITACION-PUBLICA-N°7',
    'LICITACION-PUBLICA-N°8',
    'LICITACION-PUBLICA-N°9',
    'LICITACION-PUBLICA-N°10',
    'LICITACION-PUBLICA-N°11',
    'ddjj'
  ];
  
  const foundUrls = [];
  const checkedUrls = [];
  
  console.log(`Checking Carmen de Areco document URLs...`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Years to check: ${years.join(', ')}`);
  console.log(`Months to check: ${months.join(', ')}`);
  console.log(`Common document patterns: ${commonDocumentNames.length} patterns\n`);
  
  for (const year of years) {
    console.log(`Checking year: ${year}`);
    
    // First, check year-only pattern (some documents might be stored without month subdirectory)
    for (const docName of commonDocumentNames) {
      // For salary documents, we need to add month/year suffix
      if (docName === 'SUELDOS') {
        for (const month of months) {
          const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
          const monthName = monthNames[parseInt(month) - 1];
          
          // Try different patterns for salary docs
          const salaryPatterns = [
            `${docName}-${monthName}-${year}`,
            `${docName}-${month}-${year}`,
            `${docName}-${year}-${month}`
          ];
          
          for (const salaryPattern of salaryPatterns) {
            const url = `${baseUrl}/${year}/${salaryPattern}.pdf`;
            checkedUrls.push(url);
            await checkUrl(url, foundUrls);
          }
        }
      } 
      // For asset declarations
      else if (docName === 'ddjj') {
        const ddjjUrl = `${baseUrl}/${year}/${docName}-${year}.pdf`;
        checkedUrls.push(ddjjUrl);
        await checkUrl(ddjjUrl, foundUrls);
      }
      // For regular documents
      else {
        // Try different quarter patterns
        const quarterPatterns = ['', '-1', '-2', '-3', '-4', '-1eroTrimestre', '-2doTrimestre', 
                                '-3erTrimestre', '-4toTrimestre', '-1°Trimestre', '-2°Trimestre', 
                                '-3°Trimestre', '-4°Trimestre', '-PrimerTrimestre', '-SegundoTrimestre', 
                                '-TercerTrimestre', '-CuartoTrimestre', '-Enero', '-Febrero', '-Marzo',
                                '-Abril', '-Mayo', '-Junio', '-Julio', '-Agosto', '-Septiembre', 
                                '-Octubre', '-Noviembre', '-Diciembre', '-1T', '-2T', '-3T', '-4T'];
        
        for (const quarterPattern of quarterPatterns) {
          const docPattern = `${docName}${quarterPattern}`;
          
          // Try both patterns: with and without month subdirectory
          const yearOnlyUrl = `${baseUrl}/${year}/${docPattern}.pdf`;
          checkedUrls.push(yearOnlyUrl);
          await checkUrl(yearOnlyUrl, foundUrls);
          
          // Try with month subdirectories
          for (const month of months) {
            const url = `${baseUrl}/${year}/${month}/${docPattern}.pdf`;
            checkedUrls.push(url);
            await checkUrl(url, foundUrls);
          }
        }
      }
    }
    
    console.log(`  Checked ${checkedUrls.filter(u => u.includes(`/${year}/`)).length} URLs for year ${year}`);
  }
  
  console.log(`\nTotal URLs checked: ${checkedUrls.length}`);
  console.log(`Found accessible documents: ${foundUrls.length}`);
  
  // Create report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: baseUrl,
    yearsChecked: years,
    monthsChecked: months,
    documentPatterns: commonDocumentNames,
    totalUrlsChecked: checkedUrls.length,
    accessibleDocuments: foundUrls.length,
    foundUrls: foundUrls,
    checkedUrls: checkedUrls
  };
  
  // Save report
  const outputDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const reportPath = path.join(outputDir, 'carmen_de_areco_document_availability.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\nReport saved to: ${reportPath}`);
  
  // Save accessible URLs to text file
  const accessiblePath = path.join(outputDir, 'accessible_documents.txt');
  fs.writeFileSync(accessiblePath, foundUrls.join('\n'));
  
  console.log(`Accessible document URLs saved to: ${accessiblePath}`);
  
  return foundUrls;
}

/**
 * Check if a URL is accessible
 */
async function checkUrl(url, foundUrls) {
  try {
    // Only check a few sample URLs to avoid too many requests
    if (foundUrls.length >= 10) {  // Stop after finding 10 accessible documents to be respectful
      return;
    }
    
    const response = await axios.head(url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
      }
    });
    
    if (response.status === 200) {
      console.log(`  ✅ Found: ${url}`);
      foundUrls.push(url);
    }
  } catch (error) {
    // URL not accessible, continue without adding to foundUrls
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkCarmenDeArecoDocumentURLs()
    .then(foundUrls => {
      console.log('\nDocument availability check completed!');
      console.log(`Found ${foundUrls.length} accessible documents`);
      
      if (foundUrls.length > 0) {
        console.log('\nAccessible documents:');
        foundUrls.forEach(url => console.log(`  - ${url}`));
      }
    })
    .catch(error => {
      console.error('Error during document availability check:', error);
    });
}

module.exports = { checkCarmenDeArecoDocumentURLs };