const express = require('express');
const router = express.Router();
const CarmenController = require('../controllers/CarmenController');

const controller = new CarmenController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CarmenTransparencyData:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Response status
 *         data:
 *           type: object
 *           description: Transparency data for Carmen de Areco
 *         message:
 *           type: string
 *           description: Response message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the response
 *         source_data:
 *           type: object
 *           description: Information about data sources
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CarmenLicitacionesData:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Response status
 *         data:
 *           type: object
 *           description: Licitaciones data for Carmen de Areco
 *         message:
 *           type: string
 *           description: Response message
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the response
 */

/**
 * @swagger
 * tags:
 *   name: Carmen
 *   description: Carmen de Areco specific endpoints
 */

/**
 * @swagger
 * /api/carmen/transparency:
 *   get:
 *     summary: Get transparency data for Carmen de Areco
 *     tags: [Carmen]
 *     responses:
 *       200:
 *         description: Transparency data for Carmen de Areco
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarmenTransparencyData'
 *       500:
 *         description: Internal server error
 */
router.get('/transparency', (req, res) => {
    controller.getTransparencyData(req, res);
});

/**
 * @swagger
 * /api/carmen/licitaciones:
 *   get:
 *     summary: Get licitaciones data for Carmen de Areco
 *     tags: [Carmen]
 *     responses:
 *       200:
 *         description: Licitaciones data for Carmen de Areco
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarmenLicitacionesData'
 *       500:
 *         description: Internal server error
 */
router.get('/licitaciones', (req, res) => {
    controller.getLicitacionesData(req, res);
});

module.exports = router;