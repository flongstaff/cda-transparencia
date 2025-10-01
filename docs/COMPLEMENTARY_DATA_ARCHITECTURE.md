# Complementary Data Architecture for Transparency Portal

## Current State Analysis

After reviewing the codebase, I can see that the system already implements a multi-source data architecture:

1. **Multiple Data Sources**: External APIs, local CSV/JSON files, and generated data
2. **Integration Layer**: `DataIntegrationService` combines sources with prioritization
3. **Unified Distribution**: `useMasterData` hook delivers integrated data to all pages

However, to ensure each page truly gets **complementary data** (data that enhances and supports other data rather than duplicating it), we need to enhance the architecture.

## Enhancement Strategy

### 1. Specialized Data Services for Each Domain

Create domain-specific services that focus on unique aspects of each data category:

```typescript
// services/BudgetAnalysisService.ts
class BudgetAnalysisService {
  async getExecutionAnalysis(year: number) {
    // Focus on budget execution rates, variances, trends
    return {
      executionRate: number,
      varianceAnalysis: VarianceData[],
      trendAnalysis: TrendData[],
      efficiencyMetrics: EfficiencyMetrics
    };
  }
}

// services/ContractAnalysisService.ts
class ContractAnalysisService {
  async getContractCompliance(year: number) {
    // Focus on contract compliance, vendor analysis, procurement patterns
    return {
      complianceRate: number,
      vendorPerformance: VendorPerformance[],
      procurementPatterns: PatternAnalysis[],
      riskIndicators: RiskIndicator[]
    };
  }
}

// services/SalaryAnalysisService.ts
class SalaryAnalysisService {
  async getCompensationAnalysis(year: number) {
    // Focus on salary equity, market comparisons, compensation trends
    return {
      equityAnalysis: EquityData[],
      marketComparison: MarketComparisonData[],
      trendAnalysis: SalaryTrendData[],
      positionAnalysis: PositionAnalysis[]
    };
  }
}
```

### 2. Cross-Domain Data Enrichment

Each service should provide data that complements other domains:

```typescript
// Budget data should reference relevant contracts and salary impacts
interface BudgetData {
  // Core budget data
  total_budget: number;
  execution_rate: number;
  
  // Complementary references
  related_contracts: ContractReference[];
  salary_impact: SalaryImpactAnalysis;
  compliance_status: ComplianceStatus[];
}

// Contract data should reference budget allocations and outcomes
interface ContractData {
  // Core contract data
  id: string;
  amount: number;
  status: string;
  
  // Complementary references
  budget_allocation: BudgetReference;
  deliverables_outcomes: OutcomeAnalysis[];
  compliance_history: ComplianceHistory[];
}
```

### 3. Enhanced Master Data Structure

Restructure the master data to ensure complementary relationships:

```typescript
// types/complementaryData.ts
interface ComplementaryMasterData {
  // Core domain data
  budget: BudgetDomainData;
  contracts: ContractsDomainData;
  salaries: SalariesDomainData;
  treasury: TreasuryDomainData;
  debt: DebtDomainData;
  documents: DocumentsDomainData;
  
  // Cross-domain insights
  crossDomainInsights: {
    budget_contract_alignment: AlignmentAnalysis[];
    salary_budget_impact: ImpactAnalysis[];
    treasury_contract_liquidity: LiquidityAnalysis[];
    debt_service_capacity: CapacityAnalysis[];
  };
  
  // Integrated views for specific pages
  pageViews: {
    budget: BudgetPageView;
    contracts: ContractsPageView;
    salaries: SalariesPageView;
    treasury: TreasuryPageView;
    debt: DebtPageView;
  };
}
```

## Implementation Plan

### Phase 1: Enhance Data Services

1. **Create specialized analysis services** for each domain:
   - BudgetAnalysisService
   - ContractComplianceService
   - SalaryEquityService
   - TreasuryLiquidityService
   - DebtSustainabilityService

2. **Implement cross-referencing** in each service:
   ```typescript
   // services/BudgetAnalysisService.ts
   class BudgetAnalysisService {
     async getBudgetWithCrossReferences(year: number) {
       const coreBudget = await this.getCoreBudgetData(year);
       const relatedContracts = await contractService.getRelatedContracts(year, coreBudget.categories);
       const salaryImpacts = await salaryService.getBudgetImpact(year);
       
       return {
         ...coreBudget,
         crossReferences: {
           contracts: relatedContracts,
           salaryImpact: salaryImpacts,
           // Add more cross-references
         }
       };
     }
   }
   ```

### Phase 2: Restructure Master Data Hook

Modify `useMasterData` to provide page-specific complementary data:

```typescript
// hooks/useMasterData.ts
export const useMasterData = (selectedYear?: number) => {
  // ... existing implementation
  
  // Enhanced page-specific data
  const budgetPageData = useMemo(() => {
    if (!masterData) return null;
    
    return {
      // Core budget data
      core: masterData.currentBudget,
      
      // Complementary data from other domains
      contracts: masterData.currentContracts?.filter(c => 
        c.budget_category === masterData.currentBudget?.category
      ),
      salaryImpact: masterData.salaryBudgetAnalysis?.[masterData.currentBudget?.category],
      compliance: masterData.budgetCompliance?.[masterData.currentBudget?.category],
      
      // Cross-domain insights specifically for budget analysis
      insights: masterData.crossDomainInsights?.budget_contract_alignment
    };
  }, [masterData, selectedYear]);
  
  return {
    // ... existing returns
    budgetPageData,
    contractsPageData,
    salariesPageData,
    // ... other page-specific data
  };
};
```

### Phase 3: Page-Specific Data Integration

Each page should consume complementary data:

```typescript
// pages/Budget.tsx
const BudgetPage: React.FC = () => {
  const { budgetPageData, loading, error } = useMasterData(selectedYear);
  
  return (
    <div>
      {/* Core budget visualization */}
      <BudgetChart data={budgetPageData.core} />
      
      {/* Complementary contract data */}
      <ContractImpactSection 
        data={budgetPageData.contracts} 
        budgetCategory={budgetPageData.core.category}
      />
      
      {/* Salary impact analysis */}
      <SalaryImpactChart data={budgetPageData.salaryImpact} />
      
      {/* Compliance insights */}
      <ComplianceStatus data={budgetPageData.compliance} />
      
      {/* Cross-domain insights */}
      <CrossDomainInsights data={budgetPageData.insights} />
    </div>
  );
};
```

## Benefits of Complementary Data Architecture

1. **Richer Insights**: Pages show relationships between data domains
2. **Reduced Redundancy**: Each data source contributes unique value
3. **Enhanced User Experience**: Users understand holistic picture
4. **Better Decision Making**: Cross-domain analysis enables informed decisions
5. **Data Integrity**: Cross-referencing validates data consistency

## Specific Implementation for Each Page

### Budget Page
- **Core Data**: Budget allocations and execution
- **Complementary Data**: Related contracts, salary impacts, compliance status
- **Unique Value**: Financial planning and resource allocation analysis

### Contracts Page
- **Core Data**: Contract details and status
- **Complementary Data**: Budget allocations, vendor performance, deliverable outcomes
- **Unique Value**: Procurement transparency and vendor accountability

### Salaries Page
- **Core Data**: Compensation data and position information
- **Complementary Data**: Budget impact, equity analysis, market comparisons
- **Unique Value**: Personnel cost transparency and equity assessment

### Treasury Page
- **Core Data**: Cash flow and liquidity
- **Complementary Data**: Contract payments, debt service, revenue timing
- **Unique Value**: Financial sustainability and cash management

### Debt Page
- **Core Data**: Debt levels and structure
- **Complementary Data**: Debt capacity, service obligations, credit ratings
- **Unique Value**: Fiscal risk assessment and creditworthiness

This approach ensures each page offers unique insights while leveraging complementary data from multiple sources, creating a truly integrated transparency portal.