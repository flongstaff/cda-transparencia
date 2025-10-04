/**
 * Feedback Controller for Carmen de Areco Transparency Portal
 * Handles user feedback API endpoints
 */
const FeedbackService = require('../services/FeedbackService');
const ErrorHandler = require('../utils/ErrorHandler');

class FeedbackController {
    constructor() {
        this.service = new FeedbackService();
    }

    /**
     * Submit feedback from users
     */
    async submitFeedback(req, res) {
        const context = 'submitFeedback';
        
        try {
            const feedbackData = {
                type: req.body.type,
                message: req.body.message,
                rating: req.body.rating,
                category: req.body.category || 'general',
                page_url: req.body.page_url,
                user_agent: req.get('User-Agent'),
                ip_address: req.ip,
                metadata: req.body.metadata || {}
            };

            const result = await this.service.submitFeedback(feedbackData);
            
            res.status(201).json({
                success: true,
                data: result,
                api_info: {
                    endpoint: 'submit_feedback',
                    purpose: 'Submit user feedback to the transparency portal',
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            const { response, statusCode } = ErrorHandler.createErrorResponse(error, context, 400);
            ErrorHandler.logError(error, context, { feedback_type: req.body.type });
            res.status(statusCode).json(response);
        }
    }

    /**
     * Get feedback by ID
     */
    async getFeedbackById(req, res) {
        const context = 'getFeedbackById';
        
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Missing feedback ID',
                        details: 'Feedback ID is required',
                        timestamp: new Date().toISOString(),
                        context: context
                    }
                });
            }

            const feedback = await this.service.getFeedbackById(id);
            
            res.json({
                success: true,
                data: feedback,
                api_info: {
                    endpoint: 'get_feedback_by_id',
                    purpose: 'Retrieve specific feedback by its ID',
                    feedback_id: id,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            const { response, statusCode } = ErrorHandler.createErrorResponse(error, context, 404);
            ErrorHandler.logError(error, context, { feedback_id: req.params.id });
            res.status(statusCode).json(response);
        }
    }

    /**
     * Get all feedback with optional filtering
     */
    async getAllFeedback(req, res) {
        const context = 'getAllFeedback';
        
        try {
            const filters = {
                type: req.query.type,
                resolved: req.query.resolved !== undefined ? req.query.resolved === 'true' : undefined,
                category: req.query.category,
                date_from: req.query.date_from,
                date_to: req.query.date_to
            };

            const feedback = await this.service.getAllFeedback(filters);
            
            res.json({
                success: true,
                data: feedback,
                api_info: {
                    endpoint: 'get_all_feedback',
                    purpose: 'Retrieve all feedback with optional filtering',
                    filters: filters,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            const { response, statusCode } = ErrorHandler.createErrorResponse(error, context, 500);
            ErrorHandler.logError(error, context, { filters: req.query });
            res.status(statusCode).json(response);
        }
    }

    /**
     * Update feedback resolution status
     */
    async updateFeedbackResolution(req, res) {
        const context = 'updateFeedbackResolution';
        
        try {
            const { id } = req.params;
            const { resolved, resolver_id } = req.body;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Missing feedback ID',
                        details: 'Feedback ID is required',
                        timestamp: new Date().toISOString(),
                        context: context
                    }
                });
            }
            
            if (resolved === undefined) {
                return res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Missing resolved status',
                        details: 'Resolved status (true/false) is required',
                        timestamp: new Date().toISOString(),
                        context: context
                    }
                });
            }

            const result = await this.service.updateFeedbackResolution(id, resolved, resolver_id);
            
            res.json({
                success: true,
                data: result,
                api_info: {
                    endpoint: 'update_feedback_resolution',
                    purpose: 'Update feedback resolution status',
                    feedback_id: id,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            const { response, statusCode } = ErrorHandler.createErrorResponse(error, context, 400);
            ErrorHandler.logError(error, context, { 
                feedback_id: req.params.id, 
                resolved: req.body.resolved 
            });
            res.status(statusCode).json(response);
        }
    }

    /**
     * Get feedback statistics
     */
    async getFeedbackStats(req, res) {
        const context = 'getFeedbackStats';
        
        try {
            const stats = await this.service.getFeedbackStats();
            
            res.json({
                success: true,
                data: stats,
                api_info: {
                    endpoint: 'get_feedback_stats',
                    purpose: 'Get statistics about feedback submissions',
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            const { response, statusCode } = ErrorHandler.createErrorResponse(error, context, 500);
            ErrorHandler.logError(error, context);
            res.status(statusCode).json(response);
        }
    }

    /**
     * Delete feedback by ID
     */
    async deleteFeedback(req, res) {
        const context = 'deleteFeedback';
        
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Missing feedback ID',
                        details: 'Feedback ID is required',
                        timestamp: new Date().toISOString(),
                        context: context
                    }
                });
            }

            const result = await this.service.deleteFeedback(id);
            
            res.json({
                success: true,
                data: result,
                api_info: {
                    endpoint: 'delete_feedback',
                    purpose: 'Delete specific feedback by its ID',
                    feedback_id: id,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            const { response, statusCode } = ErrorHandler.createErrorResponse(error, context, 404);
            ErrorHandler.logError(error, context, { feedback_id: req.params.id });
            res.status(statusCode).json(response);
        }
    }
}

module.exports = FeedbackController;