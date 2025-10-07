#!/usr/bin/env node
/**
 * EXTERNAL DATA SYNC SCRIPT
 *
 * Fetches data from all external sources and caches it locally for production use.
 * This eliminates runtime API calls and ensures data availability.
 *
 * Usage:
 *   node scripts/sync-external-data.js
 *   node scripts/sync-external-data.js --source=rafam
 *   node scripts/sync-external-data.js --year=2024
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BACKEND_URL = 'http://localhost:3001/api';
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/data/external');
const CACHE_MANIFEST = path.join(OUTPUT_DIR, 'cache_manifest.json');

// External data sources to sync
const EXTERNAL_SOURCES = [
  {
    id: 'rafam',
    name: 'RAFAM Provincial Data',
    endpoint: '/external/rafam',
    method: 'POST',
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
    category: 'provincial',
    priority: 'critical'
  },
  {
    id: 'carmen_official',
    name: 'Carmen de Areco Official',
    endpoint: '/carmen/official',
    method: 'GET',
    category: 'municipal',
    priority: 'critical'
  },
  {
    id: 'carmen_transparency',
    name: 'Carmen Transparency Portal',
    endpoint: '/carmen/transparency',
    method: 'GET',
    category: 'municipal',
    priority: 'critical'
  },
  {
    id: 'carmen_licitaciones',
    name: 'Carmen Licitaciones',
    endpoint: '/carmen/licitaciones',
    method: 'GET',
    category: 'municipal',
    priority: 'high'
  },
  {
    id: 'georef',
    name: 'Georef API (Geographic Data)',
    endpoint: '/external/georef/municipios',
    method: 'GET',
    params: { nombre: 'Carmen de Areco' },
    category: 'national',
    priority: 'high'
  },
  {
    id: 'bcra',
    name: 'BCRA Economic Indicators',
    endpoint: '/external/bcra/principales-variables',
    method: 'GET',
    category: 'national',
    priority: 'medium'
  },
  {
    id: 'datos_argentina',
    name: 'Datos Argentina Datasets',
    endpoint: '/external/datos-argentina/datasets',
    method: 'GET',
    params: { q: 'carmen de areco', limit: 50 },
    category: 'national',
    priority: 'medium'
  },
  {
    id: 'boletin_municipal',
    name: 'Boletín Oficial Municipal',
    endpoint: '/external/boletinoficial',
    method: 'GET',
    category: 'municipal',
    priority: 'medium'
  },
  {
    id: 'gba_provincial',
    name: 'GBA Provincial Open Data',
    endpoint: '/provincial/gba',
    method: 'GET',
    category: 'provincial',
    priority: 'low'
  }
];

// Utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function ensureDirectoryExists(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
}

async function fetchData(source, year = null) {
  const url = `${BACKEND_URL}${source.endpoint}`;
  const config = {
    method: source.method,
    url,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
  };

  if (source.method === 'POST') {
    config.data = year ? { municipalityCode: '270', year } : { municipalityCode: '270' };
  } else if (source.params) {
    config.params = source.params;
  }

  try {
    const response = await axios(config);
    return {
      success: true,
      data: response.data,
      source: source.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Error fetching ${source.name}:`, error.message);
    return {
      success: false,
      error: error.message,
      source: source.id,
      timestamp: new Date().toISOString()
    };
  }
}

async function saveToFile(data, filename) {
  const filePath = path.join(OUTPUT_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  const stats = await fs.stat(filePath);
  return {
    path: filePath,
    size: stats.size
  };
}

async function syncSource(source) {
  console.log(`\n📡 Syncing: ${source.name}`);
  console.log(`   Category: ${source.category} | Priority: ${source.priority}`);

  const results = [];

  if (source.years) {
    // Fetch for each year
    for (const year of source.years) {
      console.log(`   📅 Fetching year ${year}...`);
      const data = await fetchData(source, year);

      if (data.success) {
        const filename = `${source.id}_${year}.json`;
        const file = await saveToFile(data, filename);
        console.log(`   ✅ Saved: ${filename} (${(file.size / 1024).toFixed(2)} KB)`);
        results.push({ year, filename, size: file.size, success: true });
      } else {
        console.log(`   ❌ Failed for year ${year}`);
        results.push({ year, success: false, error: data.error });
      }

      await sleep(1000); // Rate limiting
    }
  } else {
    // Single fetch
    const data = await fetchData(source);

    if (data.success) {
      const filename = `${source.id}.json`;
      const file = await saveToFile(data, filename);
      console.log(`   ✅ Saved: ${filename} (${(file.size / 1024).toFixed(2)} KB)`);
      results.push({ filename, size: file.size, success: true });
    } else {
      console.log(`   ❌ Failed to fetch`);
      results.push({ success: false, error: data.error });
    }
  }

  return {
    source: source.id,
    name: source.name,
    category: source.category,
    priority: source.priority,
    results,
    completed: new Date().toISOString()
  };
}

async function updateManifest(syncResults) {
  const manifest = {
    last_sync: new Date().toISOString(),
    sources: syncResults.map(r => ({
      id: r.source,
      name: r.name,
      category: r.category,
      priority: r.priority,
      files: r.results.filter(res => res.success).length,
      total_size: r.results
        .filter(res => res.success)
        .reduce((sum, res) => sum + (res.size || 0), 0),
      last_updated: r.completed
    })),
    statistics: {
      total_sources: syncResults.length,
      successful_sources: syncResults.filter(r =>
        r.results.some(res => res.success)
      ).length,
      total_files: syncResults.reduce((sum, r) =>
        sum + r.results.filter(res => res.success).length, 0
      ),
      total_size_bytes: syncResults.reduce((sum, r) =>
        sum + r.results
          .filter(res => res.success)
          .reduce((s, res) => s + (res.size || 0), 0), 0
      )
    }
  };

  await fs.writeFile(CACHE_MANIFEST, JSON.stringify(manifest, null, 2), 'utf-8');
  return manifest;
}

async function main() {
  const args = process.argv.slice(2);
  const sourceFilter = args.find(a => a.startsWith('--source='))?.split('=')[1];
  const yearFilter = args.find(a => a.startsWith('--year='))?.split('=')[1];

  console.log('🚀 Carmen de Areco - External Data Sync');
  console.log('=' .repeat(60));
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  if (sourceFilter) {
    console.log(`🔍 Filtering by source: ${sourceFilter}`);
  }
  if (yearFilter) {
    console.log(`📅 Filtering by year: ${yearFilter}`);
  }

  // Ensure output directory exists
  await ensureDirectoryExists(OUTPUT_DIR);

  // Filter sources
  let sources = EXTERNAL_SOURCES;
  if (sourceFilter) {
    sources = sources.filter(s => s.id === sourceFilter);
  }
  if (yearFilter && sources.length === 1 && sources[0].years) {
    sources[0].years = [parseInt(yearFilter)];
  }

  console.log(`\n📊 Syncing ${sources.length} sources...`);

  // Sync all sources
  const syncResults = [];
  for (const source of sources) {
    const result = await syncSource(source);
    syncResults.push(result);
    await sleep(2000); // Rate limiting between sources
  }

  // Update manifest
  console.log('\n📝 Updating cache manifest...');
  const manifest = await updateManifest(syncResults);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ SYNC COMPLETE');
  console.log('='.repeat(60));
  console.log(`📊 Total sources synced: ${manifest.statistics.successful_sources}/${manifest.statistics.total_sources}`);
  console.log(`📁 Total files created: ${manifest.statistics.total_files}`);
  console.log(`💾 Total size: ${(manifest.statistics.total_size_bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🕒 Last sync: ${manifest.last_sync}`);
  console.log(`\n📄 Manifest saved to: ${CACHE_MANIFEST}`);

  // Print per-category summary
  console.log('\n📋 By Category:');
  const byCategory = {};
  manifest.sources.forEach(s => {
    if (!byCategory[s.category]) {
      byCategory[s.category] = { sources: 0, files: 0, size: 0 };
    }
    byCategory[s.category].sources++;
    byCategory[s.category].files += s.files;
    byCategory[s.category].size += s.total_size;
  });

  Object.entries(byCategory).forEach(([category, stats]) => {
    console.log(`   ${category}: ${stats.sources} sources, ${stats.files} files, ${(stats.size / 1024).toFixed(2)} KB`);
  });

  console.log('\n✨ External data is now cached and ready for production!');
  console.log('💡 Tip: Run this script daily to keep data fresh');
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
