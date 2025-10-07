const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * Discover PDFs from Carmen de Areco website uploads directory
 * This script scrapes the website to find all available PDFs in the wp-content/uploads structure
 */
async function discoverCarmenDeArecoPDFs() {
  const baseUrl = 'https://carmendeareco.gob.ar';
  const uploadsUrl = `${baseUrl}/wp-content/uploads`;
  
  console.log(`Discovering PDFs from Carmen de Areco website...`);
  console.log(`Base URL: ${baseUrl}`);
  
  // Known years for Carmen de Areco documents
  const years = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const pdfLinks = [];
  
  // Check both patterns:
  // 1. http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}.pdf
  // 2. http://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{filename}.pdf
  
  for (const year of years) {
    console.log(`Checking year: ${year}`);
    
    // First try the year-only pattern
    try {
      const yearUrl = `${uploadsUrl}/${year}`;
      const yearResponse = await axios.get(yearUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
        }
      });
      
      const $year = cheerio.load(yearResponse.data);
      const yearPdfLinks = [];
      
      // Look for PDF links on the year page
      $year('a').each((i, elem) => {
        const href = $year(elem).attr('href');
        if (href && href.toLowerCase().endsWith('.pdf')) {
          const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
          yearPdfLinks.push(fullUrl);
        } else if (href && !href.includes('.')) {
          // If it's a directory (no file extension), check if it's a month
          const directoryName = path.basename(href);
          const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', 
                         '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
                         'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
                         'ene', 'feb', 'mar', 'abr', 'may', 'jun', 
                         'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
          
          if (months.some(month => directoryName.toLowerCase().includes(month.toString().toLowerCase())) || 
              directoryName.match(/^\d{2}$/)) { // Two-digit month
            // This looks like a month directory, add to check later
            const fullDirUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
            checkMonthDirectory(fullDirUrl, pdfLinks);
          }
        }
      });
      
      pdfLinks.push(...yearPdfLinks);
      console.log(`  Found ${yearPdfLinks.length} PDFs directly in ${year} directory`);
    } catch (yearError) {
      console.log(`  Year directory ${year} not accessible: ${yearError.message}`);
    }
    
    // Now try common month subdirectories for this year
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    
    for (const month of months) {
      try {
        const monthUrl = `${uploadsUrl}/${year}/${month}`;
        const monthResponse = await axios.get(monthUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
          }
        });
        
        const $month = cheerio.load(monthResponse.data);
        const monthPdfLinks = [];
        
        // Look for PDF links in the month directory
        $month('a').each((i, elem) => {
          const href = $month(elem).attr('href');
          if (href && href.toLowerCase().endsWith('.pdf')) {
            const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
            monthPdfLinks.push(fullUrl);
          }
        });
        
        pdfLinks.push(...monthPdfLinks);
        console.log(`    Found ${monthPdfLinks.length} PDFs in ${year}/${month} directory`);
      } catch (monthError) {
        // Month directory may not exist, which is normal
      }
    }
  }
  
  // Remove duplicates
  const uniquePdfLinks = [...new Set(pdfLinks)];
  
  console.log(`\nTotal PDFs found: ${uniquePdfLinks.length}`);
  
  // Create a report
  const report = {
    timestamp: new Date().toISOString(),
    totalPdfs: uniquePdfLinks.length,
    pdfLinks: uniquePdfLinks,
    baseUrl: baseUrl,
    pattern: [
      "http://carmendeareco.gob.ar/wp-content/uploads/{year}/{filename}.pdf",
      "http://carmendeareco.gob.ar/wp-content/uploads/{year}/{month}/{filename}.pdf"
    ],
    yearsChecked: years
  };
  
  // Save to file
  const outputDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'carmen_de_areco_pdfs_2025.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log(`Report saved to: ${outputPath}`);
  
  // Also save a simple list
  const listPath = path.join(outputDir, 'carmen_de_areco_pdfs_2025.txt');
  fs.writeFileSync(listPath, uniquePdfLinks.join('\n'));
  
  console.log(`Simple list saved to: ${listPath}`);
  
  return uniquePdfLinks;
}

async function checkMonthDirectory(dirUrl, pdfLinks) {
  try {
    const response = await axios.get(dirUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
      }
    });
    
    const $ = cheerio.load(response.data);
    const monthPdfLinks = [];
    
    // Look for PDF links in the month directory
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.toLowerCase().endsWith('.pdf')) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, dirUrl).href;
        monthPdfLinks.push(fullUrl);
      }
    });
    
    pdfLinks.push(...monthPdfLinks);
    console.log(`  Found ${monthPdfLinks.length} PDFs in ${dirUrl}`);
  } catch (error) {
    // Directory may not exist or be accessible
  }
}

// Run the discovery if this script is executed directly
if (require.main === module) {
  discoverCarmenDeArecoPDFs()
    .then(pdfLinks => {
      console.log('\nPDF discovery completed successfully!');
      console.log(`Found ${pdfLinks.length} unique PDFs from Carmen de Areco website`);
    })
    .catch(error => {
      console.error('Error during PDF discovery:', error);
    });
}

module.exports = { discoverCarmenDeArecoPDFs };