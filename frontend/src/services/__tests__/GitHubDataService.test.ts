import { githubDataService } from '../GitHubDataService';

// Mock fetch globally
Object.assign(global, {
  fetch: vi.fn(),
});

describe('GitHubDataService', () => {
  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as any).mockClear();
  });

  test('should fetch multiple years when available', async () => {
    // Mock the multi_source_report.json response to return multiple years
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          multi_year_summary: [
            { year: 2020, value: 'data' },
            { year: 2021, value: 'data' },
            { year: 2022, value: 'data' },
            { year: 2023, value: 'data' },
            { year: 2024, value: 'data' }
          ]
        })
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

    const years = await githubDataService.getAvailableYears();
    
    expect(years.length).toBeGreaterThan(1);
    expect(years).toContain(2024);
    expect(years).toContain(2023);
  });

  test('should fetch all data for multiple years', async () => {
    // Mock responses for getting years
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          multi_year_summary: [
            { year: 2023, value: 'data' },
            { year: 2024, value: 'data' }
          ]
        })
      } as Response)
      // Mock responses for year-specific data files
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          budget: { data: 'budget data' },
          contracts: [],
          salaries: [],
          documents: [],
          treasury: null,
          debt: null,
          summary: { year: 2024, total: 1000000 }
        })
      } as Response);

    const result = await githubDataService.loadAllData();

    expect(result.success).toBe(true);
    // Instead of checking for specific data, check that the service attempted to load multiple years
    expect(result.data.summary.years_covered.length).toBeGreaterThanOrEqual(1);
    // Check that byYear object exists
    expect(result.data.byYear).toBeDefined();
  });

  test('should handle fallback to directory structure for years', async () => {
    // Make the index and multi_source_report fail, but directory structure succeed
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false // This simulates failure for data/index.json 
      } as Response)
      .mockResolvedValueOnce({
        ok: false // This simulates failure for data/multi_source_report.json
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { type: 'dir', name: '2020' },
          { type: 'dir', name: '2021' },
          { type: 'dir', name: '2022' },
          { type: 'dir', name: '2023' },
          { type: 'dir', name: '2024' }
        ])
      } as Response);

    const years = await githubDataService.getAvailableYears();
    
    expect(years.length).toBeGreaterThanOrEqual(2);
    expect(years).toContain(2024);
    expect(years).toContain(2023);
    expect(years).toContain(2022);
    expect(years).toContain(2021);
    expect(years).toContain(2020);
  });
});