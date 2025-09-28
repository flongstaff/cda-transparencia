# Portal de Transparencia - Estructura de Datos

## Descripción

Este directorio contiene todos los datos estructurados utilizados por el Portal de Transparencia del Municipio de Carmen de Areco. Los datos han sido extraídos de documentos oficiales del municipio y organizados en formatos fáciles de consumir para aplicaciones web.

## Estructura de Directorios

```
/public/
├── api/                    # API endpoints simulados
│   └── financial/         # Datos financieros accesibles vía API
│       └── 2019/         # Datos del año 2019
├── data/                  # Datos estructurados
│   ├── financial/         # Datos financieros principales
│   │   └── 2019/         # Datos financieros del año 2019
│   ├── api_routes.json    # Mapa de rutas de la API
│   ├── chart_data.json    # Datos preparados para gráficos
│   ├── master_index.json  # Índice maestro de todas las fuentes de datos
│   └── ...
└── ...
```

## Datos Financieros (2019)

Los datos financieros del año 2019 están organizados en los siguientes archivos:

### Archivos Principales

1. **summary.json** - Resumen financiero completo con ingresos, gastos y resultados
2. **revenue_by_source.json** - Desglose de ingresos por diferentes fuentes
3. **expenditure_by_program.json** - Desglose de gastos por programas
4. **consolidated.json** - Todos los datos financieros en un solo archivo

### Acceso a los Datos

#### Vía API
```
GET /api/financial/2019/summary.json
GET /api/financial/2019/revenue_by_source.json
GET /api/financial/2019/expenditure_by_program.json
GET /api/financial/2019/consolidated.json
```

#### Vía Frontend Components
```typescript
import { useFinancialData } from '../hooks/useFinancialData';
import FinancialDashboard from '../components/FinancialDashboard';
```

## Componentes del Frontend

### Hooks
- `useFinancialData.ts` - Hook personalizado para acceder a los datos financieros
- `useFinancialSummary.ts` - Hook para acceder al resumen financiero
- `useRevenueBySource.ts` - Hook para acceder a ingresos por fuente
- `useExpenditureByProgram.ts` - Hook para acceder a gastos por programa

### Componentes
- `FinancialDashboard.tsx` - Panel principal de visualización de datos
- `FinancialSummaryCard.tsx` - Tarjeta con resumen financiero
- `RevenueBySourceChart.tsx` - Gráfico de ingresos por fuente
- `ExpenditureByProgramChart.tsx` - Gráfico de gastos por programa

## Actualizaciones

Los datos se actualizaron por última vez el 2025-09-27, basados en el Informe Económico Financiero 2019 del Municipio de Carmen de Areco.

## Licencia

Los datos son de dominio público y provienen de documentos oficiales del municipio. Se proporcionan bajo la licencia MIT para su uso en este proyecto.