const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * Discover PDFs from Carmen de Areco transparency portal
 * This script scrapes the actual transparency portal pages to find available PDFs
 */
async function discoverTransparencyPDFs() {
  const baseUrl = 'https://carmendeareco.gob.ar';
  const transparencyUrl = `${baseUrl}/transparencia`;
  
  console.log(`Discovering PDFs from Carmen de Areco transparency portal...`);
  console.log(`Transparency URL: ${transparencyUrl}`);
  
  const allPdfLinks = [];
  
  try {
    // Get the main transparency page
    const response = await axios.get(transparencyUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Find all PDF links on the transparency page and subpages
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.toLowerCase().endsWith('.pdf')) {
        // Convert relative URLs to absolute URLs
        let fullUrl;
        if (href.startsWith('http')) {
          fullUrl = href;
        } else if (href.startsWith('/')) {
          fullUrl = `${baseUrl}${href}`;
        } else {
          fullUrl = `${transparencyUrl}/${href}`;
        }
        allPdfLinks.push(fullUrl);
      }
    });
    
    // Also look for links that might lead to pages with PDFs
    const potentialPages = [];
    $('a').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        let fullUrl;
        if (href.startsWith('http')) {
          fullUrl = href;
        } else if (href.startsWith('/')) {
          fullUrl = `${baseUrl}${href}`;
        } else {
          fullUrl = `${transparencyUrl}/${href}`;
        }
        
        // Check if this looks like a page that might contain PDFs
        if (fullUrl.includes('transparencia') || 
            fullUrl.includes('gobierno') || 
            fullUrl.includes('documento') || 
            fullUrl.includes('pdf') ||
            fullUrl.includes('licitacion') ||
            fullUrl.includes('contratacion') ||
            fullUrl.includes('presupuesto') ||
            fullUrl.includes('boletin')) {
          potentialPages.push(fullUrl);
        }
      }
    });
    
    // Remove duplicates
    const uniquePotentialPages = [...new Set(potentialPages)];
    
    console.log(`Found ${allPdfLinks.length} direct PDF links`);
    console.log(`Found ${uniquePotentialPages.length} potential pages to check`);
    
    // Now check each potential page for PDFs
    for (const pageUrl of uniquePotentialPages) {
      if (pageUrl !== transparencyUrl) { // Don't re-check the main page
        try {
          console.log(`Checking page: ${pageUrl}`);
          const pageResponse = await axios.get(pageUrl, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; CarmenDeArecoTransparencyBot/1.0)'
            }
          });
          
          const $page = cheerio.load(pageResponse.data);
          
          // Look for PDF links on this page
          $page('a').each((i, elem) => {
            const href = $page(elem).attr('href');
            if (href && href.toLowerCase().endsWith('.pdf')) {
              let fullUrl;
              if (href.startsWith('http')) {
                fullUrl = href;
              } else if (href.startsWith('/')) {
                fullUrl = `${baseUrl}${href}`;
              } else {
                fullUrl = new URL(href, pageUrl).href;
              }
              allPdfLinks.push(fullUrl);
            }
          });
        } catch (pageError) {
          console.log(`  Could not access page ${pageUrl}: ${pageError.message}`);
        }
      }
    }
    
    // Remove duplicates
    const uniquePdfLinks = [...new Set(allPdfLinks)];
    
    console.log(`\nTotal unique PDFs found: ${uniquePdfLinks.length}`);
    
    // Categorize PDFs by type
    const categorizedPdfs = {
      budgets: [],
      execution: [],
      contracts: [],
      bulletins: [],
      declarations: [],
      other: []
    };
    
    uniquePdfLinks.forEach(pdfUrl => {
      const lowerUrl = pdfUrl.toLowerCase();
      
      if (lowerUrl.includes('presupuesto') || lowerUrl.includes('budget')) {
        categorizedPdfs.budgets.push(pdfUrl);
      } else if (lowerUrl.includes('ejecucion') || lowerUrl.includes('gasto') || lowerUrl.includes('recurso')) {
        categorizedPdfs.execution.push(pdfUrl);
      } else if (lowerUrl.includes('licitacion') || lowerUrl.includes('contratacion') || lowerUrl.includes('tender')) {
        categorizedPdfs.contracts.push(pdfUrl);
      } else if (lowerUrl.includes('boletin') || lowerUrl.includes('bulletin')) {
        categorizedPdfs.bulletins.push(pdfUrl);
      } else if (lowerUrl.includes('declaracion') || lowerUrl.includes('declaration')) {
        categorizedPdfs.declarations.push(pdfUrl);
      } else {
        categorizedPdfs.other.push(pdfUrl);
      }
    });
    
    console.log('\nCategorized PDFs:');
    console.log(`Budgets: ${categorizedPdfs.budgets.length}`);
    console.log(`Budget Execution: ${categorizedPdfs.execution.length}`);
    console.log(`Contracts: ${categorizedPdfs.contracts.length}`);
    console.log(`Bulletins: ${categorizedPdfs.bulletins.length}`);
    console.log(`Declarations: ${categorizedPdfs.declarations.length}`);
    console.log(`Other: ${categorizedPdfs.other.length}`);
    
    // Create a detailed report
    const report = {
      timestamp: new Date().toISOString(),
      totalPdfs: uniquePdfLinks.length,
      categorizedPdfs: categorizedPdfs,
      allPdfLinks: uniquePdfLinks,
      baseUrl: baseUrl,
      transparencyUrl: transparencyUrl,
      pagesChecked: [transparencyUrl, ...uniquePotentialPages]
    };
    
    // Save to file
    const outputDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'transparency_portal_pdfs_2025.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log(`\nDetailed report saved to: ${outputPath}`);
    
    // Also save a simple list
    const listPath = path.join(outputDir, 'transparency_portal_pdfs_2025.txt');
    fs.writeFileSync(listPath, uniquePdfLinks.join('\n'));
    
    console.log(`Simple list saved to: ${listPath}`);
    
    return uniquePdfLinks;
  } catch (error) {
    console.error('Error accessing transparency portal:', error.message);
    throw error;
  }
}

// Run the discovery if this script is executed directly
if (require.main === module) {
  discoverTransparencyPDFs()
    .then(pdfLinks => {
      console.log('\nTransparency portal PDF discovery completed successfully!');
      console.log(`Found ${pdfLinks.length} unique PDFs from Carmen de Areco transparency portal`);
    })
    .catch(error => {
      console.error('Error during transparency portal PDF discovery:', error);
    });
}

module.exports = { discoverTransparencyPDFs };