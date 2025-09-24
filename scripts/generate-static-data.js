const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const dataDir = path.join(__dirname, '../data');
const publicDir = path.join(__dirname, '../frontend/public/data');

async function generateStaticData() {
  console.log('Generating static data...');

  const years = [2020, 2021, 2022, 2023, 2024, 2025]; // Add more years as needed

  const allJsonFiles = await glob.sync(path.join(dataDir, '**/*.json'));
  const allMdFiles = await glob.sync(path.join(dataDir, 'markdown_documents/**/*.md'));

  for (const year of years) {
    const yearData = {
      year,
      available_years: years,
      json_files: {},
    };

    for (const file of allJsonFiles) {
      if (file.includes(year)) {
        const fileName = path.basename(file);
        const fileContent = await fs.readJson(file);
        yearData.json_files[fileName] = fileContent;
      }
    }

    for (const file of allMdFiles) {
      if (file.includes(year)) {
        const fileName = path.basename(file);
        const fileContent = await fs.readFile(file, 'utf-8');
        if (!yearData.markdown_files) {
          yearData.markdown_files = {};
        }
        yearData.markdown_files[fileName] = fileContent;
      }
    }

    const filePath = path.join(publicDir, `data_index_${year}.json`);
    await fs.writeJson(filePath, yearData, { spaces: 2 });
    console.log(`Generated ${filePath}`);
  }

  console.log('Static data generation complete.');
}

generateStaticData();
