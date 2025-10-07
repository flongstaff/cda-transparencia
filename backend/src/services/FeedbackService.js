/**
 * Feedback Service for Carmen de Areco Transparency Portal
 * Handles user feedback, suggestions, and complaints
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FeedbackService {
    constructor() {
        this.feedbackDir = path.join(__dirname, '../../../feedback');
        this.feedbackFile = path.join(this.feedbackDir, 'feedback.json');
        this.ensureFeedbackDirectory();
    }

    /**
     * Ensure the feedback directory exists
     */
    async ensureFeedbackDirectory() {
        try {
            await fs.mkdir(this.feedbackDir, { recursive: true });
            // Initialize feedback file if it doesn't exist
            try {
                await fs.access(this.feedbackFile);
            } catch {
                await fs.writeFile(this.feedbackFile, JSON.stringify([], null, 2));
            }
        } catch (error) {
            console.error('Error ensuring feedback directory:', error);
        }
    }

    /**
     * Submit user feedback
     */
    async submitFeedback(feedbackData) {
        try {
            // Validate feedback data
            if (!feedbackData.type || !feedbackData.message) {
                throw new Error('Type and message are required for feedback');
            }

            // Create feedback object
            const feedback = {
                id: uuidv4(),
                type: feedbackData.type, // 'suggestion', 'complaint', 'bug_report', 'general'
                message: feedbackData.message,
                rating: feedbackData.rating || null, // Optional rating (1-5)
                category: feedbackData.category || 'general', // Optional category
                page_url: feedbackData.page_url || null, // Optional page where feedback originated
                user_agent: feedbackData.user_agent || null, // Optional user agent
                ip_address: feedbackData.ip_address || null, // Optional IP address
                metadata: feedbackData.metadata || {}, // Optional additional metadata
                created_at: new Date().toISOString(),
                resolved: false,
                resolved_at: null,
                resolved_by: null
            };

            // Read existing feedback
            const existingFeedback = await this.getAllFeedback();
            
            // Add new feedback
            existingFeedback.push(feedback);
            
            // Save to file
            await fs.writeFile(this.feedbackFile, JSON.stringify(existingFeedback, null, 2));

            return {
                success: true,
                message: 'Feedback submitted successfully',
                feedback_id: feedback.id
            };
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    }

    /**
     * Get feedback by ID
     */
    async getFeedbackById(id) {
        try {
            const feedback = await this.getAllFeedback();
            const foundFeedback = feedback.find(f => f.id === id);
            
            if (!foundFeedback) {
                throw new Error('Feedback not found');
            }

            return foundFeedback;
        } catch (error) {
            console.error('Error getting feedback by ID:', error);
            throw error;
        }
    }

    /**
     * Get all feedback with optional filtering
     */
    async getAllFeedback(filters = {}) {
        try {
            const data = await fs.readFile(this.feedbackFile, 'utf8');
            let feedback = JSON.parse(data);

            // Apply filters
            if (filters.type) {
                feedback = feedback.filter(f => f.type === filters.type);
            }
            if (filters.resolved !== undefined) {
                feedback = feedback.filter(f => f.resolved === filters.resolved);
            }
            if (filters.category) {
                feedback = feedback.filter(f => f.category === filters.category);
            }
            if (filters.date_from) {
                const fromDate = new Date(filters.date_from).toISOString();
                feedback = feedback.filter(f => f.created_at >= fromDate);
            }
            if (filters.date_to) {
                const toDate = new Date(filters.date_to).toISOString();
                feedback = feedback.filter(f => f.created_at <= toDate);
            }

            // Sort by creation date (newest first)
            feedback.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return feedback;
        } catch (error) {
            console.error('Error getting all feedback:', error);
            return [];
        }
    }

    /**
     * Update feedback resolution status
     */
    async updateFeedbackResolution(id, resolved, resolverId = null) {
        try {
            const feedback = await this.getAllFeedback();
            const feedbackIndex = feedback.findIndex(f => f.id === id);

            if (feedbackIndex === -1) {
                throw new Error('Feedback not found');
            }

            feedback[feedbackIndex].resolved = resolved;
            feedback[feedbackIndex].resolved_at = resolved ? new Date().toISOString() : null;
            feedback[feedbackIndex].resolved_by = resolverId;

            await fs.writeFile(this.feedbackFile, JSON.stringify(feedback, null, 2));

            return {
                success: true,
                message: `Feedback ${resolved ? 'marked as resolved' : 'marked as unresolved'}`
            };
        } catch (error) {
            console.error('Error updating feedback resolution:', error);
            throw error;
        }
    }

    /**
     * Get feedback statistics
     */
    async getFeedbackStats() {
        try {
            const feedback = await this.getAllFeedback();
            
            const stats = {
                total: feedback.length,
                resolved: feedback.filter(f => f.resolved).length,
                unresolved: feedback.filter(f => !f.resolved).length,
                by_type: {},
                by_category: {},
                by_rating: {},
                monthly_breakdown: {}
            };

            // Calculate type and category distributions
            feedback.forEach(f => {
                // By type
                stats.by_type[f.type] = (stats.by_type[f.type] || 0) + 1;
                
                // By category
                stats.by_category[f.category] = (stats.by_category[f.category] || 0) + 1;
                
                // By rating
                if (f.rating) {
                    stats.by_rating[f.rating] = (stats.by_rating[f.rating] || 0) + 1;
                }

                // By month
                const month = f.created_at.substring(0, 7); // YYYY-MM
                stats.monthly_breakdown[month] = (stats.monthly_breakdown[month] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting feedback stats:', error);
            throw error;
        }
    }

    /**
     * Delete feedback by ID
     */
    async deleteFeedback(id) {
        try {
            const feedback = await this.getAllFeedback();
            const updatedFeedback = feedback.filter(f => f.id !== id);

            await fs.writeFile(this.feedbackFile, JSON.stringify(updatedFeedback, null, 2));

            return {
                success: true,
                message: 'Feedback deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    }
}

module.exports = FeedbackService;