/**
 * Simple rate limiter for Cloudflare Workers
 */

/**
 * In-memory rate limiter
 * In production, this would use Cloudflare Durable Objects
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.maxRequests = 100; // requests per window
  }

  /**
   * Check if request is allowed
   */
  async check(request) {
    const clientIP = this.getClientIP(request);
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request history for this IP
    let requestHistory = this.requests.get(clientIP) || [];

    // Remove old requests outside the window
    requestHistory = requestHistory.filter(timestamp => timestamp > windowStart);

    // Check if under limit
    if (requestHistory.length >= this.maxRequests) {
      const oldestRequest = Math.min(...requestHistory);
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);

      return {
        allowed: false,
        retryAfter
      };
    }

    // Add current request
    requestHistory.push(now);
    this.requests.set(clientIP, requestHistory);

    return {
      allowed: true,
      remaining: this.maxRequests - requestHistory.length
    };
  }

  /**
   * Extract client IP from request
   */
  getClientIP(request) {
    // In Cloudflare Workers, we can get the real IP from headers
    const cfConnectingIP = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIP = request.headers.get('X-Real-IP');

    return cfConnectingIP || xForwardedFor?.split(',')[0] || xRealIP || 'unknown';
  }

  /**
   * Clean up old entries periodically
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [ip, requests] of this.requests.entries()) {
      const filteredRequests = requests.filter(timestamp => timestamp > windowStart);
      if (filteredRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, filteredRequests);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Clean up old entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);
