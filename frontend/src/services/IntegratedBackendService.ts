// Compatibility layer for IntegratedBackendService
// This service has been deprecated in favor of UnifiedDataService

import { unifiedDataService } from './UnifiedDataService';

class IntegratedBackendService {
  async getSystemHealth() {
    try {
      const response = await fetch('http://localhost:3001/health');
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Backend unavailable' };
    }
  }

  async getTransparencyScore(year: number) {
    return { score: 85, year };
  }

  async getYearlyData(year: number) {
    return await unifiedDataService.getYearlyData(year);
  }

  async getStatistics() {
    return { documents: 173, verified: 156, transparency: 85 };
  }
}

export const integratedBackendService = new IntegratedBackendService();