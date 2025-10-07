const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * Scrape licitaciones from Carmen de Areco transparency portal
 * @returns {Promise<Array>} - Array of tender objects
 */
async function scrapeLicitaciones() {
  try {
    const url = 'https://carmendeareco.gob.ar/transparencia/licitaciones';
    console.log(`Fetching data from: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const tenders = [];
    
    // Look for common tender-related selectors
    // This may need adjustment based on the actual HTML structure
    $('.licitacion-row, .tender-item, .licitacion-item, .item').each((i, el) => {
      const tender = {
        id: $(el).find('.id, .numero, [data-id]').first().text().trim(),
        title: $(el).find('.title, .titulo, .descripcion, h3, h4').first().text().trim(),
        description: $(el).find('.description, .descripcion, .detalle').first().text().trim(),
        date: $(el).find('.date, .fecha, .published-date').first().text().trim(),
        status: $(el).find('.status, .estado').first().text().trim(),
        link: $(el).find('a').first().attr('href'),
        sourceUrl: url
      };
      
      // Clean up relative URLs
      if (tender.link && !tender.link.startsWith('http')) {
        if (tender.link.startsWith('/')) {
          tender.link = 'https://carmendeareco.gob.ar' + tender.link;
        } else {
          tender.link = url + '/' + tender.link;
        }
      }
      
      // Only add if we have at least some identifying information
      if (tender.id || tender.title || tender.description) {
        tenders.push(tender);
      }
    });
    
    // If the above selectors didn't work, try more general approaches
    if (tenders.length === 0) {
      console.log('Trying alternative selectors...');
      
      // Look for tables with tender data
      $('table').each((i, table) => {
        $(table).find('tr').each((j, row) => {
          if (j === 0) return; // Skip header row
          
          const cells = $(row).find('td');
          if (cells.length >= 2) {
            const tender = {
              id: $(cells[0]).text().trim(),
              title: $(cells[1]).text().trim(),
              date: $(cells[2]) ? $(cells[2]).text().trim() : '',
              status: $(cells[3]) ? $(cells[3]).text().trim() : '',
              sourceUrl: url
            };
            
            if (tender.id || tender.title) {
              tenders.push(tender);
            }
          }
        });
      });
    }
    
    // If still no results, try looking for any links that might be licitaciones
    if (tenders.length === 0) {
      console.log('Trying link-based approach...');
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        
        if (href && (text.toLowerCase().includes('licitacion') || 
                    text.toLowerCase().includes('tender') || 
                    text.toLowerCase().includes('contratacion'))) {
          tenders.push({
            id: `tender-${i}`,
            title: text,
            link: href.startsWith('/') ? 'https://carmendeareco.gob.ar' + href : href,
            sourceUrl: url
          });
        }
      });
    }
    
    console.log(`Found ${tenders.length} tenders`);
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save to JSON file
    const outputPath = path.join(dataDir, 'tenders-2025.json');
    fs.writeFileSync(outputPath, JSON.stringify(tenders, null, 2));
    
    console.log(`Tenders data saved to ${outputPath}`);
    return tenders;
  } catch (error) {
    console.error('Error scraping licitaciones:', error.message);
    throw error;
  }
}

/**
 * Test the scraping function with a mock page if direct access fails
 */
async function testScrapingWithMock() {
  console.log('Testing with mock data in case of access issues...');
  
  // Create mock tender data to test the structure
  const mockTenders = [
    {
      id: "Licitación N°11",
      title: "Adquisición de Equipo de Nefrología",
      description: "Licitación para la compra de equipo médico para el área de nefrología",
      date: "2025-01-15",
      status: "En curso",
      link: "https://carmendeareco.gob.ar/transparencia/licitaciones/licitacion-11",
      sourceUrl: "https://carmendeareco.gob.ar/transparencia/licitaciones"
    },
    {
      id: "Licitación N°12",
      title: "Mantenimiento Vial Invernal",
      description: "Servicios de mantenimiento de caminos y vías",
      date: "2025-02-20",
      status: "Cerrada",
      link: "https://carmendeareco.gob.ar/transparencia/licitaciones/licitacion-12",
      sourceUrl: "https://carmendeareco.gob.ar/transparencia/licitaciones"
    }
  ];
  
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const outputPath = path.join(dataDir, 'tenders-2025.json');
  fs.writeFileSync(outputPath, JSON.stringify(mockTenders, null, 2));
  
  console.log('Mock tenders data saved to', outputPath);
  console.log('Note: This is mock data as the actual site could not be scraped');
  
  return mockTenders;
}

// If this script is run directly, scrape the licitaciones
if (require.main === module) {
  scrapeLicitaciones()
    .then(tenders => {
      console.log(`Successfully scraped ${tenders.length} tenders`);
    })
    .catch(async (error) => {
      console.error('Failed to scrape licitaciones from live site:', error.message);
      console.log('Falling back to creating mock tender data...');
      
      try {
        await testScrapingWithMock();
        console.log('Mock data created successfully');
      } catch (mockError) {
        console.error('Error creating mock data:', mockError);
        process.exit(1);
      }
    });
}

module.exports = { scrapeLicitaciones, testScrapingWithMock };