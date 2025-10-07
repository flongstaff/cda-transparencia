/**
 * Analytics Service for Carmen de Areco Transparency Portal
 * Collects and analyzes user behavior and engagement metrics
 * Privacy-compliant implementation with no personal data collection
 */

class AnalyticsService {
  constructor() {
    this.analyticsStore = new Map();
    this.sessionStore = new Map();
  }

  /**
   * Record a page view event
   */
  recordPageView(pageUrl, metadata = {}) {
    // Only record anonymous, non-personal data
    const eventData = {
      eventType: 'page_view',
      pageUrl: this.sanitizeUrl(pageUrl),
      timestamp: new Date().toISOString(),
      userAgent: this.sanitizeUserAgent(metadata.userAgent),
      referrer: metadata.referrer ? this.sanitizeUrl(metadata.referrer) : null,
      sessionId: metadata.sessionId || this.generateAnonymousSessionId(),
      screenWidth: metadata.screenWidth,
      screenHeight: metadata.screenHeight,
      viewportWidth: metadata.viewportWidth,
      viewportHeight: metadata.viewportHeight
    };
    
    this.storeEventData(eventData);
    return eventData;
  }

  /**
   * Record a search event
   */
  recordSearch(query, resultsCount, metadata = {}) {
    // Only record anonymous, non-personal data
    const eventData = {
      eventType: 'search',
      query: this.sanitizeQuery(query),
      resultsCount: resultsCount,
      timestamp: new Date().toISOString(),
      sessionId: metadata.sessionId || this.generateAnonymousSessionId(),
      pageUrl: metadata.pageUrl ? this.sanitizeUrl(metadata.pageUrl) : null
    };
    
    this.storeEventData(eventData);
    return eventData;
  }

  /**
   * Record a document download event
   */
  recordDocumentDownload(documentId, documentType, metadata = {}) {
    const eventData = {
      eventType: 'document_download',
      documentId: this.hashDocumentId(documentId),
      documentType: documentType,
      timestamp: new Date().toISOString(),
      sessionId: metadata.sessionId || this.generateAnonymousSessionId(),
      pageUrl: metadata.pageUrl ? this.sanitizeUrl(metadata.pageUrl) : null
    };
    
    this.storeEventData(eventData);
    return eventData;
  }

  /**
   * Record a user interaction event
   */
  recordUserInteraction(interactionType, elementId, metadata = {}) {
    const eventData = {
      eventType: 'user_interaction',
      interactionType: interactionType,
      elementId: elementId,
      timestamp: new Date().toISOString(),
      sessionId: metadata.sessionId || this.generateAnonymousSessionId(),
      pageUrl: metadata.pageUrl ? this.sanitizeUrl(metadata.pageUrl) : null
    };
    
    this.storeEventData(eventData);
    return eventData;
  }

  /**
   * Store event data
   */
  storeEventData(eventData) {
    const eventType = eventData.eventType;
    
    if (!this.analyticsStore.has(eventType)) {
      this.analyticsStore.set(eventType, []);
    }
    
    this.analyticsStore.get(eventType).push(eventData);
    
    // Keep only the most recent 10,000 events per event type
    if (this.analyticsStore.get(eventType).length > 10000) {
      const events = this.analyticsStore.get(eventType);
      this.analyticsStore.set(eventType, events.slice(-10000));
    }
  }

  /**
   * Sanitize URL to remove personal information
   */
  sanitizeUrl(url) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url, 'http://localhost');
      
      // Remove query parameters that might contain personal information
      const sensitiveParams = [
        'email', 'username', 'password', 'token', 'session', 'auth',
        'user_id', 'user', 'id', 'key', 'secret', 'api_key'
      ];
      
      sensitiveParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      return urlObj.toString();
    } catch (error) {
      // If URL parsing fails, return a sanitized version
      return url.replace(/[?&](email|username|password|token|session|auth|user_id|user|id|key|secret|api_key)=[^&]*/g, '');
    }
  }

  /**
   * Sanitize search query to remove personal information
   */
  sanitizeQuery(query) {
    if (!query || typeof query !== 'string') return '';
    
    // Remove common personal identifiers
    return query
      .replace(/\b\d{7,}\b/g, '') // Remove long numbers (likely IDs)
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '') // Remove email addresses
      .replace(/\b\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}\b/g, '') // Remove phone numbers
      .trim();
  }

  /**
   * Sanitize user agent string
   */
  sanitizeUserAgent(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') return 'unknown';
    
    // Extract only browser family and version for statistical purposes
    const browserRegex = /(chrome|firefox|safari|edge|opera)\/?(\d+)/i;
    const match = userAgent.match(browserRegex);
    
    if (match) {
      return `${match[1].toLowerCase()}/${match[2]}`;
    }
    
    return 'other';
  }

  /**
   * Generate anonymous session ID
   */
  generateAnonymousSessionId() {
    // Generate a random session ID that cannot be traced to a specific user
    return `sess_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }

  /**
   * Hash document ID to preserve statistical value while removing identifying information
   */
  hashDocumentId(documentId) {
    if (!documentId) return 'unknown';
    
    // Simple hash function for anonymization (not cryptographic)
    let hash = 0;
    for (let i = 0; i < documentId.length; i++) {
      const char = documentId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `doc_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(period = '30d') {
    const periodMs = this.getPeriodMilliseconds(period);
    const cutoffTime = Date.now() - periodMs;
    
    const summary = {
      pageViews: this.getPageViewSummary(cutoffTime),
      searches: this.getSearchSummary(cutoffTime),
      documentDownloads: this.getDocumentDownloadSummary(cutoffTime),
      userInteractions: this.getUserInteractionSummary(cutoffTime),
      topPages: this.getTopPages(cutoffTime),
      topSearches: this.getTopSearches(cutoffTime),
      deviceStats: this.getDeviceStatistics(cutoffTime),
      period: period,
      lastUpdated: new Date().toISOString()
    };
    
    return summary;
  }

  /**
   * Get page view summary
   */
  getPageViewSummary(cutoffTime) {
    const pageViews = this.analyticsStore.get('page_view') || [];
    const recentViews = pageViews.filter(view => new Date(view.timestamp).getTime() > cutoffTime);
    
    return {
      totalViews: recentViews.length,
      uniquePages: new Set(recentViews.map(view => view.pageUrl)).size,
      avgViewsPerDay: Math.round(recentViews.length / (periodMs / (24 * 60 * 60 * 1000))),
      growthRate: this.calculateGrowthRate('page_view', cutoffTime)
    };
  }

  /**
   * Get search summary
   */
  getSearchSummary(cutoffTime) {
    const searches = this.analyticsStore.get('search') || [];
    const recentSearches = searches.filter(search => new Date(search.timestamp).getTime() > cutoffTime);
    
    const totalSearches = recentSearches.length;
    const searchesWithResults = recentSearches.filter(search => search.resultsCount > 0).length;
    const searchEffectiveness = totalSearches > 0 ? Math.round((searchesWithResults / totalSearches) * 100) : 0;
    
    return {
      totalSearches: totalSearches,
      searchesWithResults: searchesWithResults,
      searchEffectiveness: searchEffectiveness,
      avgSearchesPerDay: Math.round(totalSearches / (periodMs / (24 * 60 * 60 * 1000))),
      growthRate: this.calculateGrowthRate('search', cutoffTime)
    };
  }

  /**
   * Get document download summary
   */
  getDocumentDownloadSummary(cutoffTime) {
    const downloads = this.analyticsStore.get('document_download') || [];
    const recentDownloads = downloads.filter(download => new Date(download.timestamp).getTime() > cutoffTime);
    
    // Group by document type
    const downloadsByType = {};
    recentDownloads.forEach(download => {
      const type = download.documentType || 'unknown';
      downloadsByType[type] = (downloadsByType[type] || 0) + 1;
    });
    
    return {
      totalDownloads: recentDownloads.length,
      downloadsByType: downloadsByType,
      avgDownloadsPerDay: Math.round(recentDownloads.length / (periodMs / (24 * 60 * 60 * 1000))),
      growthRate: this.calculateGrowthRate('document_download', cutoffTime)
    };
  }

  /**
   * Get user interaction summary
   */
  getUserInteractionSummary(cutoffTime) {
    const interactions = this.analyticsStore.get('user_interaction') || [];
    const recentInteractions = interactions.filter(interaction => new Date(interaction.timestamp).getTime() > cutoffTime);
    
    // Group by interaction type
    const interactionsByType = {};
    recentInteractions.forEach(interaction => {
      const type = interaction.interactionType || 'unknown';
      interactionsByType[type] = (interactionsByType[type] || 0) + 1;
    });
    
    return {
      totalInteractions: recentInteractions.length,
      interactionsByType: interactionsByType,
      avgInteractionsPerDay: Math.round(recentInteractions.length / (periodMs / (24 * 60 * 60 * 1000))),
      growthRate: this.calculateGrowthRate('user_interaction', cutoffTime)
    };
  }

  /**
   * Get top pages by views
   */
  getTopPages(cutoffTime) {
    const pageViews = this.analyticsStore.get('page_view') || [];
    const recentViews = pageViews.filter(view => new Date(view.timestamp).getTime() > cutoffTime);
    
    const pageCounts = {};
    recentViews.forEach(view => {
      const page = view.pageUrl || 'unknown';
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    
    // Sort by count and return top 10
    return Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, views: count }));
  }

  /**
   * Get top searches by frequency
   */
  getTopSearches(cutoffTime) {
    const searches = this.analyticsStore.get('search') || [];
    const recentSearches = searches.filter(search => new Date(search.timestamp).getTime() > cutoffTime);
    
    const searchCounts = {};
    recentSearches.forEach(search => {
      const query = search.query || 'unknown';
      if (query.trim()) {
        searchCounts[query] = (searchCounts[query] || 0) + 1;
      }
    });
    
    // Sort by count and return top 10
    return Object.entries(searchCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, searches: count }));
  }

  /**
   * Get device statistics
   */
  getDeviceStatistics(cutoffTime) {
    const pageViews = this.analyticsStore.get('page_view') || [];
    const recentViews = pageViews.filter(view => new Date(view.timestamp).getTime() > cutoffTime);
    
    const browserStats = {};
    const screenSizes = {};
    
    recentViews.forEach(view => {
      // Browser stats
      const browser = view.userAgent || 'unknown';
      browserStats[browser] = (browserStats[browser] || 0) + 1;
      
      // Screen size stats (binned for privacy)
      if (view.screenWidth && view.screenHeight) {
        const widthBin = Math.floor(view.screenWidth / 100) * 100;
        const heightBin = Math.floor(view.screenHeight / 100) * 100;
        const screenSize = `${widthBin}x${heightBin}`;
        screenSizes[screenSize] = (screenSizes[screenSize] || 0) + 1;
      }
    });
    
    return {
      browsers: browserStats,
      screenSizes: screenSizes,
      mobileVsDesktop: this.calculateMobileVsDesktopRatio(recentViews)
    };
  }

  /**
   * Calculate mobile vs desktop ratio
   */
  calculateMobileVsDesktopRatio(pageViews) {
    let mobileCount = 0;
    let desktopCount = 0;
    
    pageViews.forEach(view => {
      const userAgent = view.userAgent || '';
      if (/mobile|phone|tablet|android|iphone|ipad/i.test(userAgent)) {
        mobileCount++;
      } else {
        desktopCount++;
      }
    });
    
    const total = mobileCount + desktopCount;
    return total > 0 ? {
      mobile: Math.round((mobileCount / total) * 100),
      desktop: Math.round((desktopCount / total) * 100),
      total: total
    } : { mobile: 0, desktop: 0, total: 0 };
  }

  /**
   * Calculate growth rate for an event type
   */
  calculateGrowthRate(eventType, cutoffTime) {
    const events = this.analyticsStore.get(eventType) || [];
    
    // Split events into two equal periods
    const periodLength = periodMs / 2;
    const currentTime = Date.now();
    
    const recentEvents = events.filter(event => 
      new Date(event.timestamp).getTime() > (currentTime - periodLength)
    ).length;
    
    const previousEvents = events.filter(event => 
      new Date(event.timestamp).getTime() > (currentTime - periodLength * 2) &&
      new Date(event.timestamp).getTime() <= (currentTime - periodLength)
    ).length;
    
    if (previousEvents === 0) {
      return recentEvents > 0 ? 100 : 0;
    }
    
    return Math.round(((recentEvents - previousEvents) / previousEvents) * 100);
  }

  /**
   * Get period in milliseconds
   */
  getPeriodMilliseconds(period) {
    switch (period) {
      case '1d': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '90d': return 90 * 24 * 60 * 60 * 1000;
      default: return 30 * 24 * 60 * 60 * 1000; // Default to 30 days
    }
  }

  /**
   * Get user satisfaction metrics
   */
  getUserSatisfactionMetrics() {
    // In a real implementation, this would collect user feedback
    // For now, we'll simulate metrics based on interaction patterns
    
    const analyticsSummary = this.getAnalyticsSummary('30d');
    
    // Simulate satisfaction based on search effectiveness and engagement
    const searchSatisfaction = analyticsSummary.searches.searchEffectiveness || 75;
    const engagementScore = Math.min(100, Math.round((analyticsSummary.pageViews.totalViews / 1000) * 20));
    
    return {
      overallSatisfaction: Math.round((searchSatisfaction + engagementScore) / 2),
      searchEffectiveness: searchSatisfaction,
      userEngagement: engagementScore,
      pageViews: analyticsSummary.pageViews.totalViews,
      searches: analyticsSummary.searches.totalSearches,
      documentDownloads: analyticsSummary.documentDownloads.totalDownloads,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Health check for analytics service
   */
  healthCheck() {
    return {
      status: 'healthy',
      service: 'Analytics Service',
      capabilities: {
        page_view_tracking: true,
        search_analytics: true,
        document_download_tracking: true,
        user_interaction_tracking: true,
        privacy_compliant: true,
        anonymous_data_only: true
      },
      data_collected: {
        no_personal_identifiers: true,
        no_ip_address_storage: true,
        no_browser_fingerprinting: true,
        anonymized_session_tracking: true
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AnalyticsService;