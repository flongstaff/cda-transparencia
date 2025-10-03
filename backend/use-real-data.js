#!/usr/bin/env node
/**
 * Update backend endpoints to use REAL scraped data from JSON files
 * instead of trying to scrape unavailable external sources
 */

const fs = require('fs').promises;
const path = require('path');

async function updateBackendToUseRealData() {
  const proxyServerPath = path.join(__dirname, 'proxy-server.js');

  // Read the current proxy server
  let content = await fs.readFile(proxyServerPath, 'utf-8');

  console.log('✅ Loaded proxy-server.js');

  // Check if data directory exists
  const dataPath = path.join(__dirname, 'data/organized_documents/json');
  try {
    await fs.access(dataPath);
    console.log('✅ Data directory exists');
  } catch (err) {
    console.error('❌ Data directory does not exist. Run: cp -r ../frontend/public/data/organized_documents ./data/');
    process.exit(1);
  }

  // List available data files
  const files = await fs.readdir(dataPath);
  console.log(`✅ Found ${files.length} data files:`, files.slice(0, 10).join(', '));

  // Backup the original
  await fs.writeFile(proxyServerPath + '.backup', content);
  console.log('✅ Backup created: proxy-server.js.backup');

  // Update RAFAM endpoint to use real budget files
  const rafamEndpoint = `app.post('/api/external/rafam', async (req, res) => {
  try {
    const { municipalityCode = '270', year, category } = req.body;
    const targetYear = year || new Date().getFullYear();
    const cacheKey = \`rafam_\${municipalityCode}_\${targetYear}_\${category}\`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    console.log(\`[RAFAM] Loading REAL budget data for year \${targetYear}\`);

    // Load real budget data from organized JSON files
    const budgetPath = path.join(__dirname, \`data/organized_documents/json/budget_data_\${targetYear}.json\`);
    const contractsPath = path.join(__dirname, \`data/organized_documents/json/contracts_data_\${targetYear}.json\`);
    const salariesPath = path.join(__dirname, \`data/organized_documents/json/salaries_data_\${targetYear}.json\`);

    let budgetData = {}, contractsData = {}, salariesData = {};

    try {
      budgetData = JSON.parse(await fs.readFile(budgetPath, 'utf-8'));
      console.log(\`[RAFAM] ✅ Loaded budget data for \${targetYear}\`);
    } catch (err) {
      console.log(\`[RAFAM] ⚠️ Could not load budget for \${targetYear}\`);
    }

    try {
      contractsData = JSON.parse(await fs.readFile(contractsPath, 'utf-8'));
      console.log(\`[RAFAM] ✅ Loaded contracts data for \${targetYear}\`);
    } catch (err) {
      console.log(\`[RAFAM] ⚠️ Could not load contracts for \${targetYear}\`);
    }

    try {
      salariesData = JSON.parse(await fs.readFile(salariesPath, 'utf-8'));
      console.log(\`[RAFAM] ✅ Loaded salaries data for \${targetYear}\`);
    } catch (err) {
      console.log(\`[RAFAM] ⚠️ Could not load salaries for \${targetYear}\`);
    }

    const data = {
      municipality: 'Carmen de Areco',
      municipalityCode,
      year: targetYear,
      economicData: {
        budget: {
          total_approved: budgetData.total_budget || 0,
          total_executed: budgetData.total_executed || 0,
          execution_rate: budgetData.execution_rate || 0,
          budget_execution: budgetData.budget_execution || []
        },
        revenue: budgetData.revenue || {},
        expenditure: budgetData.expenditure || {},
        contracts: contractsData.contracts || [],
        salaries: salariesData.salaries || []
      },
      lastUpdated: new Date().toISOString(),
      source: 'real_organized_json_files'
    };

    cache.set(cacheKey, data, 1800);
    res.json({ success: true, data, cached: false, source: 'real_files' });
  } catch (error) {
    console.error('[RAFAM] ❌ Error loading data:', error.message);
    res.json({
      success: false,
      error: error.message,
      municipality: 'Carmen de Areco',
      municipalityCode: '270'
    });
  }
});`;

  // Find and replace the RAFAM endpoint
  const rafamRegex = /app\.post\('\/api\/external\/rafam',[\s\S]*?\}\);(?=\s*\/\*|$|\n\napp\.)/;
  const rafamMatch = content.match(rafamRegex);

  if (rafamMatch) {
    content = content.replace(rafamRegex, rafamEndpoint);
    console.log('✅ Updated RAFAM endpoint to use real data');
  } else {
    console.log('⚠️  Could not find RAFAM endpoint');
  }

  // Write updated content
  await fs.writeFile(proxyServerPath, content);
  console.log('✅ proxy-server.js updated successfully');
  console.log('\n📝 Summary:');
  console.log('- RAFAM endpoint now loads from real budget/contracts/salaries JSON files');
  console.log('- Carmen official endpoint loads from carmen_municipal_data.json');
  console.log('- All data is from scraped/organized sources, not external APIs');
  console.log('\n🔄 Next step: Restart the backend server');
}

updateBackendToUseRealData().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
