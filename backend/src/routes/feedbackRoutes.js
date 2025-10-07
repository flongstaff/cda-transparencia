/**
 * Feedback Routes for Carmen de Areco Transparency Portal
 * API endpoints for user feedback functionality
 */
const express = require('express');
const router = express.Router();
const FeedbackController = require('../controllers/FeedbackController');

const controller = new FeedbackController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the feedback
 *         type:
 *           type: string
 *           description: Type of feedback (suggestion, complaint, bug_report, general)
 *         message:
 *           type: string
 *           description: The feedback message
 *         rating:
 *           type: integer
 *           description: Optional rating (1-5)
 *         category:
 *           type: string
 *           description: Category of feedback
 *         page_url:
 *           type: string
 *           description: URL of the page where feedback was submitted
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when feedback was created
 *         resolved:
 *           type: boolean
 *           description: Whether the feedback has been resolved
 *         resolved_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when feedback was resolved
 */

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: User feedback management
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit user feedback
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of feedback (suggestion, complaint, bug_report, general)
 *                 example: suggestion
 *               message:
 *                 type: string
 *                 description: The feedback message
 *                 example: The search functionality could be improved
 *               rating:
 *                 type: integer
 *                 description: Optional rating (1-5)
 *                 example: 4
 *               category:
 *                 type: string
 *                 description: Optional category
 *                 example: search
 *               page_url:
 *                 type: string
 *                 description: Optional URL of the page where feedback was submitted
 *                 example: /search
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     feedback_id:
 *                       type: string
 *       400:
 *         description: Invalid feedback data
 */
router.post('/', (req, res) => {
    controller.submitFeedback(req, res);
});

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Get all feedback with optional filtering
 *     tags: [Feedback]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by feedback type
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: Filter by resolution status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date range (from)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date range (to)
 *     responses:
 *       200:
 *         description: List of feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 */
router.get('/', (req, res) => {
    controller.getAllFeedback(req, res);
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: Get feedback by ID
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       404:
 *         description: Feedback not found
 */
router.get('/:id', (req, res) => {
    controller.getFeedbackById(req, res);
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   put:
 *     summary: Update feedback resolution status
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolved:
 *                 type: boolean
 *                 description: Whether the feedback is resolved
 *               resolver_id:
 *                 type: string
 *                 description: Optional ID of the resolver
 *     responses:
 *       200:
 *         description: Feedback resolution status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Feedback not found
 */
router.put('/:id', (req, res) => {
    controller.updateFeedbackResolution(req, res);
});

/**
 * @swagger
 * /api/feedback/stats:
 *   get:
 *     summary: Get feedback statistics
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: Feedback statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 resolved:
 *                   type: integer
 *                 unresolved:
 *                   type: integer
 *                 by_type:
 *                   type: object
 *                 by_category:
 *                   type: object
 *                 by_rating:
 *                   type: object
 *                 monthly_breakdown:
 *                   type: object
 */
router.get('/stats', (req, res) => {
    controller.getFeedbackStats(req, res);
});

/**
 * @swagger
 * /api/feedback/{id}:
 *   delete:
 *     summary: Delete feedback by ID
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       404:
 *         description: Feedback not found
 */
router.delete('/:id', (req, res) => {
    controller.deleteFeedback(req, res);
});

module.exports = router;