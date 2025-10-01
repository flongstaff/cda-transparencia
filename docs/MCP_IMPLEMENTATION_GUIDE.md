# Model Context Protocol (MCP) Implementation Guide

## Overview
This document explains how the Carmen de Areco Transparency Portal implements Model Context Protocol (MCP) to improve reliability and performance.

## What is MCP?
Model Context Protocol ensures that all data processing maintains context, validation, and reliability across the entire system.

## Adding New PDFs

### Step 1: Prepare the PDF
1. Place new PDF in `data/raw/pdf/` directory
2. Ensure PDF is properly named with year and category:
   ```
   data/raw/pdf/2025_budget_analysis.pdf
   ```

### Step 2: Add to Processing Pipeline
1. Update the ETL configuration in `etl/mcp_etl_service.py`
2. Define processing context:
   ```python
   {
     'type': 'pdf',
     'path': 'data/raw/pdf/2025_budget_analysis.pdf',
     'context': {
       'source_context': {
         'year': 2025,
         'type': 'budget_analysis',
         'category': 'Financial'
       },
       'transformation_id': 'pdf_transform_v1',
       'required_fields': ['title', 'content']
     }
   }
   ```

### Step 3: Update Metadata
Update `data/metadata/index.json` to include the new document:
```json
{
  "processed_files": [
    // existing files...
    "2025_budget_analysis.pdf"
  ],
  "web_accessible_files": [
    // existing files...
    "2025_budget_analysis.pdf"
  ]
}
```

## Available Charts

### 1. Budget Execution Chart
- **Type**: Line/Bar Chart
- **Data Source**: `Budget_Execution` 
- **Description**: Shows how the municipal budget was executed over time
- **MCP Context**: Validates budget vs execution data consistency

### 2. Debt Report Chart
- **Type**: Pie/Stacked Bar Chart  
- **Data Source**: `Debt_Report`
- **Description**: Details the municipality's debt obligations
- **MCP Context**: Validates debt amount consistency and interest rates

### 3. Revenue Report Chart
- **Type**: Stacked Area Chart
- **Data Source**: `Revenue_Report`
- **Description**: Detailed breakdown of municipal revenue sources
- **MCP Context**: Validates revenue source categorization

### 4. Expenditure Report Chart
- **Type**: Treemap/Bar Chart
- **Data Source**: `Expenditure_Report`
- **Description**: Detailed breakdown of municipal expenditures by category
- **MCP Context**: Validates expenditure categorization and amounts

### 5. Financial Reserves Chart
- **Type**: Line Chart
- **Data Source**: `Financial_Reserves`
- **Description**: Information about financial reserves and contingency funds
- **MCP Context**: Validates reserve calculations

## Keeping Frontend + Backend in Sync

### 1. Data Service Synchronization
All data services now implement MCP context:
- `frontend/src/services/dataService.ts` - Uses MCP-compliant data fetching
- `backend/src/services/ComprehensiveTransparencyService.js` - Implements MCP validation

### 2. Cache Management
Both frontend and backend use MCP-compliant caching:
- Frontend cache in `frontend/src/hooks/useDataCache.ts`
- Backend cache in `backend/src/services/ComprehensiveTransparencyService.js`

### 3. Versioning
All MCP components use versioned context:
- Context includes timestamp and version information
- Cache keys are generated with context identifiers

## MCP Best Practices

### Data Validation
All data must pass validation before processing:
```javascript
// Example validation rule
const validateBudgetData = (data) => {
  if (!data.every(row => 
    row.budgeted !== undefined && 
    row.executed !== undefined &&
    row.year !== undefined
  )) {
    throw new Error('Invalid budget data structure');
  }
}
```

### Context Preservation
All operations maintain context:
- Every request includes context identifier
- Cache entries are tagged with context
- Logging includes context information

### Performance Monitoring
MCP-enabled components track performance:
- Cache hit/miss statistics
- Processing time measurements
- Error tracking with context

## Testing MCP Implementation

### Unit Tests
```bash
npm test -- --testPathPattern="mcp"
# or
python -m pytest etl/test_mcp.py
```

### Integration Tests
1. Test data fetching with context
2. Test cache behavior with multiple contexts  
3. Test validation rules
4. Test error handling

## Troubleshooting

### Common Issues
1. **Cache Invalidation**: Clear cache with `dataService.clearCache()` 
2. **Context Mismatch**: Check that all context fields are included
3. **Validation Errors**: Review data structure against validation rules

### Debugging
```javascript
// Enable detailed logging
const mcpContext = {
  debug: true,
  logLevel: 'debug',
  traceId: 'unique-trace-id'
};
```
```

### 5. Jupyter Notebook Integration

Now let's create a notebook that demonstrates the MCP implementation:

```python notebooks/MCP_Data_Pipeline_Demo.ipynb
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# MCP Data Pipeline Demo\n",
    "\n",
    "This notebook demonstrates how the Model Context Protocol (MCP) implementation works in the Carmen de Areco Transparency Portal."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Import required libraries\n",
    "import pandas as pd\n",
    "import json\n",
    "from datetime import datetime\n",
    "import os\n",
    "\n",
    "# Mock ETL service for demonstration\n",
    "class MCPEtlService:\n",
    "    def __init__(self):\n",
    "        self.context = {\n",
    "            'version': '1.0',\n",
    "            'timestamp': datetime.now().isoformat(),\n",
    "            'source': 'Carmen de Areco Transparency Portal'\n",
    "        }\n",
    "        \n",
    "    def process_with_context(self, data, context_info):\n",
    "        \"\"\"\n",
    "        Process data with MCP context\n",
    "        \"\"\"\n",
    "        # Validate context\n",
    "        if not self._validate_context(context_info):\n",
    "            raise ValueError(\"Invalid MCP context\")\n",
    "            \n",
    "        # Apply transformations\n",
    "        processed_data = self._transform_data(data, context_info)\n",
    "        \n",
    "        # Validate results\n",
    "        validation = self._validate_data(processed_data, context_info)\n",
    "        \n",
    "        return {\n",
    "            'status': 'success',\n",
    "            'context': {**self.context, **context_info},\n",
    "            'data': processed_data,\n",
    "            'validation': validation\n",
    "        }\n",
    "        \n",
    "    def _validate_context(self, context):\n",
    "        required_fields = ['source_context', 'transformation_id']\n",
    "        return all(field in context for field in required_fields)\n",
    "        \n",
    "    def _transform_data(self, data, context):\n",
    "        # Simple transformation example\n",
    "        return {\n",
    "            'processed_at': datetime.now().isoformat(),\n",
    "            'metadata': {\n",
    "                'source_context': context['source_context'],\n",
    "                'transformation_id': context['transformation_id'],\n",
    "                'data_shape': {\n",
    "                    'rows': len(data) if hasattr(data, '__len__') else 0,\n",
    "                    'columns': len(data.columns) if hasattr(data, 'columns') else 0\n",
    "                }\n",
    "            },\n",
    "            'data': data.tolist() if hasattr(data, 'tolist') else data\n",
    "        }\n",
    "        \n",
    "    def _validate_data(self, data, context):\n",
    "        return {\n",
    "            'timestamp': datetime.now().isoformat(),\n",
    "            'passed': True,\n",
    "            'issues': []\n",
    "        }\n"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Data Processing Example"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Sample data\n",
    "sample_data = pd.DataFrame({\n",
    "    'year': [2020, 2021, 2022, 2023, 2024],\n",
    "    'budgeted': [1000000, 1200000, 1300000, 1400000, 1500000],\n",
    "    'executed': [980000, 1180000, 1280000, 1380000, 1450000]\n",
    "})\n",
    "\n",
    "# MCP Context\n",
    "mcp_context = {\n",
    "    'source_context': {\n",
    "        'year': 2024,\n",
    "        'type': 'budget_execution',\n",
    "        'category': 'Financial'\n",
    "    },\n",
    "    'transformation_id': 'budget_execution_transform_v1',\n",
    "    'required_fields': ['year', 'budgeted', 'executed']\n",
    "}\n",
    "\n",
    "# Process with MCP\n",
    "etl_service = MCPEtlService()\n",
    "result = etl_service.process_with_context(sample_data, mcp_context)\n",
    "\n",
    "print(\"MCP Processing Result:\")\n",
    "print(json.dumps(result, indent=2, default=str))"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Chart Data Integration"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Simulate chart data loading with MCP context\n",
    "def load_chart_data(chart_type, years):\n",
    "    \"\"\"\n",
    "    Simulate loading chart data with MCP context\n",
    "    \"\"\"\n",
    "    context = {\n",
    "        'chart_type': chart_type,\n",
    "        'years': years,\n",
    "        'context_id': f\"mcp-chart-{chart_type}-{datetime.now().timestamp()}\"\n",
    "    }\n",
    "    \n",
    "    # Simulate loading data\n",
    "    chart_data = {\n",
    "        'chart_type': chart_type,\n",
    "        'years': years,\n",
    "        'data': [\n",
    "            {'year': year, 'value': 1000000 + (year - 2020) * 100000} \n",
    "            for year in years\n",
    "        ]\n",
    "    }\n",
    "    \n",
    "    return {\n",
    "        'context': context,\n",
    "        'data': chart_data,\n",
    "        'processed_at': datetime.now().isoformat()\n",
    "    }\n",
    "\n",
    "# Load different types of chart data\n",
    "chart_types = ['Budget_Execution', 'Debt_Report', 'Revenue_Report']\n",
    "years = [2019, 2020, 2021, 2022, 2023, 2024]\n",
    "\n",
    "for chart_type in chart_types:\n",
    "    result = load_chart_data(chart_type, years)\n",
    "    print(f\"{chart_type} Chart Data:\")\n",
    "    print(json.dumps(result['data'], indent=2))\n",
    "    print(\"\\n\")"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Performance Monitoring"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Simulate performance monitoring\n",
    "import time\n",
    "\n",
    "def monitor_mcp_performance(data):\n",
    "    start_time = time.time()\n",
    "    \n",
    "    # Simulate processing\n",
    "    time.sleep(0.1)  # Simulate processing time\n",
    "    \n",
    "    end_time = time.time()\n",
    "    processing_time = end_time - start_time\n",
    "    \n",
    "    return {\n",
    "        'processing_time_ms': processing_time * 1000,\n",
    "        'data_points_processed': len(data) if hasattr(data, '__len__') else 0,\n",
    "        'performance_score': 100 - (processing_time * 10) if processing_time < 1 else 0\n",
    "    }\n",
    "\n",
    "# Test performance\n",
    "performance = monitor_mcp_performance(sample_data)\n",
    "print(\"MCP Performance Metrics:\")\n",
    "print(json.dumps(performance, indent=2))"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Context Validation Example"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Validate different contexts\n",
    "def validate_mcp_context(context):\n",
    "    required_fields = ['source_context', 'transformation_id']\n",
    "    missing_fields = [field for field in required_fields if field not in context]\n",
    "    \n",
    "    return {\n",
    "        'valid': len(missing_fields) == 0,\n",
    "        'missing_fields': missing_fields,\n",
    "        'context_id': context.get('transformation_id', 'unknown')\n",
    "    }\n",
    "\n",
    "# Test valid context\n",
    "valid_context = {\n",
    "    'source_context': {'year': 2024, 'type': 'budget'},\n",
    "    'transformation_id': 'budget_transform_v1'\n",
    "}\n",
    "\n",
    "print(\"Valid Context Validation:\")\n",
    "print(json.dumps(validate_mcp_context(valid_context), indent=2))\n",
    "\n",
    "# Test invalid context\n",
    "invalid_context = {\n",
    "    'source_context': {'year': 2024, 'type': 'budget'}\n",
    "    # Missing transformation_id\n",
    "}\n",
    "\n",
    "print(\"\\nInvalid Context Validation:\")\n",
    "print(json.dumps(validate_mcp_context(invalid_context), indent=2))"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.8.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}
