/**
 * Scraping Scheduler Routes
 * API endpoints for managing scheduled scraping tasks
 */

const express = require('express');
const router = express.Router();
const scrapingScheduler = require('../services/ScrapingScheduler');

/**
 * Get list of scheduled tasks
 */
router.get('/tasks', (req, res) => {
  try {
    const tasks = scrapingScheduler.getTasks();
    res.json({ 
      success: true, 
      tasks,
      message: `Found ${tasks.length} scheduled tasks`
    });
  } catch (error) {
    console.error('Error getting scheduled tasks:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Start the scheduler
 */
router.post('/start', (req, res) => {
  try {
    scrapingScheduler.start();
    res.json({ 
      success: true, 
      message: 'Scraping scheduler started successfully'
    });
  } catch (error) {
    console.error('Error starting scheduler:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Stop the scheduler
 */
router.post('/stop', (req, res) => {
  try {
    scrapingScheduler.stop();
    res.json({ 
      success: true, 
      message: 'Scraping scheduler stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping scheduler:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Run a specific task immediately
 */
router.post('/run-task/:taskName', async (req, res) => {
  try {
    const { taskName } = req.params;
    
    if (!taskName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Task name is required' 
      });
    }

    const result = await scrapingScheduler.runTaskNow(taskName);
    res.json({ 
      success: true, 
      result,
      message: `Task ${taskName} executed immediately`
    });
  } catch (error) {
    console.error(`Error running task ${req.params.taskName}:`, error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Health check for scheduler
 */
router.get('/health', (req, res) => {
  try {
    const tasks = scrapingScheduler.getTasks();
    const activeTasks = tasks.filter(task => task.scheduled);
    
    res.json({ 
      success: true,
      service: 'Scraping Scheduler',
      status: 'active',
      tasksCount: tasks.length,
      activeTasksCount: activeTasks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Scheduler health check error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;