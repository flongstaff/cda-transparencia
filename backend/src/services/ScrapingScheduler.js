/**
 * Automated Scraping Scheduler
 * Schedules automated scraping tasks for transparency data
 */

const cron = require('node-cron');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

class ScrapingScheduler {
  constructor() {
    this.tasks = new Map();
    this.scrapingResultsDir = path.join(__dirname, '..', 'data', 'scraping_results');
    this.ensureDirectoryExists(this.scrapingResultsDir);
    this.active = false;
  }

  /**
   * Ensure directory exists, create if not
   */
  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory: ${dirPath}`, error.message);
    }
  }

  /**
   * Schedule a scraping task
   */
  scheduleTask(taskName, cronExpression, scrapingFunction, options = {}) {
    if (this.tasks.has(taskName)) {
      console.warn(`Task ${taskName} already exists, cancelling existing task`);
      this.cancelTask(taskName);
    }

    const task = cron.schedule(cronExpression, async () => {
      console.log(`Running scheduled scraping task: ${taskName}`);
      
      try {
        const result = await scrapingFunction();
        await this.saveScrapingResult(taskName, result);
        
        console.log(`Completed scheduled scraping task: ${taskName}`);
      } catch (error) {
        console.error(`Error in scheduled scraping task ${taskName}:`, error.message);
        
        // Save error result
        await this.saveScrapingResult(taskName, {
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, {
      scheduled: this.active, // Only schedule if scheduler is active
      timezone: 'America/Argentina/Buenos_Aires'
    });

    this.tasks.set(taskName, {
      task,
      cronExpression,
      scrapingFunction,
      options
    });

    console.log(`Scheduled scraping task: ${taskName} with cron ${cronExpression}`);
    return task;
  }

  /**
   * Start the scheduler
   */
  start() {
    this.active = true;
    for (const [taskName, taskInfo] of this.tasks) {
      taskInfo.task.start();
      console.log(`Started scheduled task: ${taskName}`);
    }
    console.log('Scraping scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    this.active = false;
    for (const [taskName, taskInfo] of this.tasks) {
      taskInfo.task.stop();
      console.log(`Stopped scheduled task: ${taskName}`);
    }
    console.log('Scraping scheduler stopped');
  }

  /**
   * Cancel a specific task
   */
  cancelTask(taskName) {
    if (this.tasks.has(taskName)) {
      const taskInfo = this.tasks.get(taskName);
      taskInfo.task.stop();
      this.tasks.delete(taskName);
      console.log(`Cancelled scheduled task: ${taskName}`);
    }
  }

  /**
   * Run a task immediately (for testing)
   */
  async runTaskNow(taskName) {
    if (this.tasks.has(taskName)) {
      const taskInfo = this.tasks.get(taskName);
      try {
        const result = await taskInfo.scrapingFunction();
        await this.saveScrapingResult(taskName, result);
        console.log(`Ran task ${taskName} immediately`);
        return result;
      } catch (error) {
        console.error(`Error running task ${taskName} immediately:`, error.message);
        return { error: error.message, timestamp: new Date().toISOString() };
      }
    } else {
      throw new Error(`Task ${taskName} does not exist`);
    }
  }

  /**
   * Save scraping result to file
   */
  async saveScrapingResult(taskName, result) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${taskName}_${timestamp}.json`;
    const filePath = path.join(this.scrapingResultsDir, fileName);
    
    const resultWithMetadata = {
      ...result,
      taskName,
      executedAt: new Date().toISOString(),
      source: 'scheduled_scraping'
    };

    try {
      await fs.writeFile(filePath, JSON.stringify(resultWithMetadata, null, 2));
    } catch (error) {
      console.error(`Error saving scraping result for ${taskName}:`, error.message);
    }
  }

  /**
   * Get list of scheduled tasks
   */
  getTasks() {
    const tasks = [];
    for (const [taskName, taskInfo] of this.tasks) {
      tasks.push({
        name: taskName,
        cronExpression: taskInfo.cronExpression,
        scheduled: taskInfo.task.running,
        options: taskInfo.options
      });
    }
    return tasks;
  }

  /**
   * Initialize default scraping tasks for Carmen de Areco
   */
  initializeDefaultTasks() {
    // Schedule daily check for transparency portal updates
    this.scheduleTask(
      'carmen_transparency_daily',
      '0 8 * * *', // Every day at 8am Argentina time
      this.scrapeCarmenTransparency.bind(this),
      { description: 'Daily check for Carmen de Areco transparency portal' }
    );

    // Schedule weekly check for licitaciones
    this.scheduleTask(
      'carmen_licitaciones_weekly',
      '0 9 * * 1', // Every Monday at 9am Argentina time
      this.scrapeCarmenLicitaciones.bind(this),
      { description: 'Weekly check for Carmen de Areco licitaciones' }
    );

    // Schedule weekly check for declaraciones juradas
    this.scheduleTask(
      'carmen_declaraciones_weekly',
      '0 10 * * 1', // Every Monday at 10am Argentina time
      this.scrapeCarmenDeclaraciones.bind(this),
      { description: 'Weekly check for Carmen de Areco declaraciones juradas' }
    );

    // Schedule monthly check for budgets and financial reports
    this.scheduleTask(
      'carmen_budget_monthly',
      '0 11 1 * *', // First day of every month at 11am Argentina time
      this.scrapeCarmenBudget.bind(this),
      { description: 'Monthly check for Carmen de Areco budget documents' }
    );

    // Schedule daily check for national data sources
    this.scheduleTask(
      'national_data_daily',
      '30 8 * * *', // Every day at 8:30am Argentina time
      this.scrapeNationalData.bind(this),
      { description: 'Daily check for national transparency data' }
    );

    console.log('Default scraping tasks initialized');
  }

  /**
   * Scraping functions for each data source
   */
  async scrapeCarmenTransparency() {
    try {
      const response = await axios.get('https://carmendeareco.gob.ar/transparencia', {
        timeout: 10000,
        headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
      });

      // Use Cheerio to parse the response
      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);

      const data = {
        budget_links: [],
        contracts_links: [],
        salaries_links: [],
        documents: []
      };

      // Extract PDF links and document references
      $('a[href$=".pdf"], a[href*="pdf"]').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim();

        const doc = {
          title: text,
          url: href.startsWith('http') ? href : `https://carmendeareco.gob.ar${href}`,
          type: 'pdf'
        };

        if (text.toLowerCase().includes('presupuesto') || text.toLowerCase().includes('budget')) {
          data.budget_links.push(doc);
        } else if (text.toLowerCase().includes('contrat') || text.toLowerCase().includes('licitac')) {
          data.contracts_links.push(doc);
        } else if (text.toLowerCase().includes('sueldo') || text.toLowerCase().includes('salari')) {
          data.salaries_links.push(doc);
        } else {
          data.documents.push(doc);
        }
      });

      return {
        success: true,
        data,
        source: 'carmen_transparency',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'carmen_transparency',
        timestamp: new Date().toISOString()
      };
    }
  }

  async scrapeCarmenLicitaciones() {
    try {
      const response = await axios.get('https://carmendeareco.gob.ar/licitaciones/', {
        timeout: 10000,
        headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
      });

      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);
      const tenders = [];

      // Extract tender notices
      $('.tender, .licitacion, .contrato, article, .post').each((i, elem) => {
        const title = $(elem).find('h2, h3, .title, .titulo').text().trim();
        const date = $(elem).find('.date, .fecha, time').text().trim();
        const status = $(elem).find('.status, .estado').text().trim();
        const link = $(elem).find('a').first().attr('href');

        if (title) {
          tenders.push({
            title,
            date,
            status,
            url: link ? (link.startsWith('http') ? link : `https://carmendeareco.gob.ar${link}`) : null
          });
        }
      });

      return {
        success: true,
        data: { tenders, count: tenders.length },
        source: 'carmen_licitaciones',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'carmen_licitaciones',
        timestamp: new Date().toISOString()
      };
    }
  }

  async scrapeCarmenDeclaraciones() {
    try {
      const response = await axios.get('https://carmendeareco.gob.ar/declaraciones-juradas/', {
        timeout: 10000,
        headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
      });

      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);
      const declarations = [];

      // Extract declarations
      $('.declaration, .declaracion, .document, article, .post').each((i, elem) => {
        const official = $(elem).find('.official, .funcionario, .nombre').text().trim();
        const year = $(elem).find('.year, .anio').text().trim();
        const type = $(elem).find('.type, .tipo').text().trim();
        const link = $(elem).find('a').first().attr('href');

        if (official) {
          declarations.push({
            official,
            year,
            type,
            url: link ? (link.startsWith('http') ? link : `https://carmendeareco.gob.ar${link}`) : null
          });
        }
      });

      return {
        success: true,
        data: { declarations, count: declarations.length },
        source: 'carmen_declaraciones',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'carmen_declaraciones',
        timestamp: new Date().toISOString()
      };
    }
  }

  async scrapeCarmenBudget() {
    try {
      // This would typically look for budget documents
      // For now we'll just check the transparency section
      const response = await axios.get('https://carmendeareco.gob.ar/transparencia', {
        timeout: 10000,
        headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
      });

      const cheerio = require('cheerio');
      const $ = cheerio.load(response.data);
      const budgetDocs = [];

      // Look for budget-related documents
      $('a[href$=".pdf"], a[href*="pdf"]').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim().toLowerCase();

        if (text.includes('presupuesto') || text.includes('budget') || 
            text.includes('gasto') || text.includes('costo')) {
          budgetDocs.push({
            title: $(elem).text().trim(),
            url: href.startsWith('http') ? href : `https://carmendeareco.gob.ar${href}`,
            type: 'budget'
          });
        }
      });

      return {
        success: true,
        data: { budgetDocs, count: budgetDocs.length },
        source: 'carmen_budget',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'carmen_budget',
        timestamp: new Date().toISOString()
      };
    }
  }

  async scrapeNationalData() {
    try {
      // Check national open data portal for updates related to Carmen de Areco
      const response = await axios.get('https://datos.gob.ar/api/3/action/package_search?q=carmen+de+areco', {
        timeout: 15000,
        headers: { 'User-Agent': 'Carmen-Transparency-Portal/1.0' }
      });

      const datasets = response.data.result?.results || [];
      const relevantDatasets = datasets.map(dataset => ({
        id: dataset.id,
        title: dataset.title,
        description: dataset.notes?.substring(0, 200),
        organization: dataset.organization?.name,
        last_updated: dataset.metadata_modified,
        resources: dataset.resources?.length || 0
      }));

      return {
        success: true,
        data: { datasets: relevantDatasets, count: relevantDatasets.length },
        source: 'national_data',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'national_data',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and configure the scheduler
const scrapingScheduler = new ScrapingScheduler();
scrapingScheduler.initializeDefaultTasks();

module.exports = scrapingScheduler;