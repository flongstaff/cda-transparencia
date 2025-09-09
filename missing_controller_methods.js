// Missing controller methods that need to be implemented

    /**
     * Get external financial data from government APIs
     */
    async getExternalFinancialData(req, res) {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year);

            if (!yearInt || isNaN(yearInt)) {
                return res.status(400).json({
                    error: 'Invalid year parameter',
                    message: 'Year must be a valid number'
                });
            }

            const externalData = await this.service.getExternalFinancialData(yearInt);
            
            res.json({
                year: yearInt,
                external_data: externalData,
                source: 'national_and_provincial_apis',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getExternalFinancialData:', error);
            res.status(500).json({
                error: 'Failed to get external financial data',
                details: error.message
            });
        }
    }

    /**
     * Get GitHub data from public repositories
     */
    async getGitHubData(req, res) {
        try {
            const { repo, path } = req.params;
            
            if (!repo) {
                return res.status(400).json({
                    error: 'Missing repository parameter',
                    message: 'Repository name is required'
                });
            }

            const githubData = await this.service.getGitHubData(repo, path || '');
            
            res.json({
                repository: repo,
                path: path || '',
                data: githubData,
                source: 'github_api',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getGitHubData:', error);
            res.status(500).json({
                error: 'Failed to get GitHub data',
                details: error.message
            });
        }
    }

    /**
     * Get local markdown documents
     */
    async getLocalMarkdownDocuments(req, res) {
        try {
            const { year, category } = req.params;
            const yearInt = parseInt(year);

            const documents = await this.service.getLocalMarkdownDocuments(yearInt, category || null);
            
            res.json({
                year: yearInt,
                category: category || 'all',
                documents: documents,
                count: documents.length,
                source: 'local_markdown_documents',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getLocalMarkdownDocuments:', error);
            res.status(500).json({
                error: 'Failed to get local markdown documents',
                details: error.message
            });
        }
    }

    /**
     * Get organized PDF documents
     */
    async getOrganizedPdfDocuments(req, res) {
        try {
            const { year, category } = req.params;
            const yearInt = parseInt(year);

            const documents = await this.service.getOrganizedPdfDocuments(yearInt, category || null);
            
            res.json({
                year: yearInt,
                category: category || 'all',
                documents: documents,
                count: documents.length,
                source: 'organized_pdf_documents',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getOrganizedPdfDocuments:', error);
            res.status(500).json({
                error: 'Failed to get organized PDF documents',
                details: error.message
            });
        }
    }

    /**
     * Get local transparency data analysis
     */
    async getLocalTransparencyData(req, res) {
        try {
            const transparencyData = await this.service.getLocalTransparencyData();
            
            if (!transparencyData) {
                return res.status(404).json({
                    error: 'No local transparency data available',
                    message: 'No analysis results found in local storage'
                });
            }
            
            res.json({
                data: transparencyData,
                source: 'local_analysis_results',
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getLocalTransparencyData:', error);
            res.status(500).json({
                error: 'Failed to get local transparency data',
                details: error.message
            });
        }
    }

    /**
     * Clear API cache
     */
    async clearCache(req, res) {
        try {
            this.service.clearCache();
            
            res.json({
                message: 'API cache cleared successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in clearCache:', error);
            res.status(500).json({
                error: 'Failed to clear cache',
                details: error.message
            });
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(req, res) {
        try {
            const stats = this.service.getCacheStats();
            
            res.json({
                cache_stats: stats,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getCacheStats:', error);
            res.status(500).json({
                error: 'Failed to get cache statistics',
                details: error.message
            });
        }
    }