# Estructura de Datos Financieros - Portal de Transparencia

## Descripción General

Este documento describe la estructura de los datos financieros extraídos del Informe Económico Financiero del Municipio de Carmen de Areco para el año 2019. Los datos están organizados en varios archivos JSON que pueden ser consumidos fácilmente por aplicaciones web.

## Estructura de Archivos

```
/data/
  └── financial/
      └── 2019/
          ├── summary.json              # Resumen financiero completo
          ├── revenue_by_source.json    # Ingresos desglosados por fuente
          ├── expenditure_by_program.json # Gastos desglosados por programa
          ├── consolidated.json         # Datos consolidados en un solo archivo
          └── index.json               # Índice de archivos disponibles
```

## Estructura Detallada de Datos

### 1. summary.json - Resumen Financiero

Contiene un resumen completo de los ingresos, gastos y posición financiera del municipio.

```json
{
  "year": 2019,
  "title": "Informe Económico 2019",
  "revenue": {
    "total": {
      "budgeted": 243511982.00,
      "executed": 234125273.85,
      "percentage": 96.15
    },
    "current": {
      "budgeted": 241879702.14,
      "executed": 232492993.99,
      "percentage": 96.12
    },
    "capital": {
      "budgeted": 1632279.86,
      "executed": 1632279.86,
      "percentage": 100.00
    }
  },
  "expenditure": {
    "total": {
      "budgeted": 271899802.33,
      "executed": 266210998.09,
      "percentage": 97.91
    },
    "personnel": {
      "budgeted": 115221488.53,
      "executed": 115221488.53,
      "percentage": 100.00
    }
  },
  "financial_position": {
    "current_assets": {
      "budgeted": 0.00,
      "executed": 72871274.53,
      "percentage": 0.00
    }
  },
  "financial_result": {
    "operating_result": {
      "budgeted": 0.00,
      "executed": 832790.44,
      "percentage": 0.00
    }
  }
}
```

### 2. revenue_by_source.json - Ingresos por Fuente

Contiene un desglose detallado de los ingresos por diferentes fuentes.

```json
{
  "year": 2019,
  "title": "Ingresos por Fuente 2019",
  "sources": [
    {
      "source": "provincial_participation",
      "type": "taxes",
      "description": "Participación Impuestos Provinciales",
      "budgeted": 0.00,
      "executed": 379449.30,
      "percentage": 0.00
    }
  ]
}
```

### 3. expenditure_by_program.json - Gastos por Programa

Contiene un desglose detallado de los gastos por diferentes programas.

```json
{
  "year": 2019,
  "title": "Gastos por Programa 2019",
  "programs": [
    {
      "program_code": "1110101000-17",
      "program_name": "Planificacion y desarrollo de politicas sociales, salu",
      "budgeted": 17185446.15,
      "executed": 17143446.15,
      "paid": 16736420.07
    }
  ]
}
```

### 4. consolidated.json - Datos Consolidados

Contiene todos los datos financieros en un solo archivo para fácil acceso.

```json
{
  "metadata": {
    "year": 2019,
    "title": "Datos Financieros Consolidados 2019",
    "last_updated": "2025-09-27",
    "source": "Informe Económico 2019"
  },
  "summary": {
    "revenue": {
      "total": {
        "budgeted": 243511982.00,
        "executed": 234125273.85,
        "percentage": 96.15
      }
    }
  },
  "revenue_by_source": [
    {
      "source": "provincial_participation",
      "description": "Participación Impuestos Provinciales",
      "executed": 379449.30
    }
  ],
  "top_expenditure_programs": [
    {
      "program_name": "Servicios Urbanos",
      "executed": 61327344.23
    }
  ]
}
```

## API Endpoints

Los datos también están disponibles a través de una API REST simple:

- `GET /api/financial/2019/summary.json` - Resumen financiero
- `GET /api/financial/2019/revenue_by_source.json` - Ingresos por fuente
- `GET /api/financial/2019/expenditure_by_program.json` - Gastos por programa
- `GET /api/financial/2019/consolidated.json` - Datos consolidados

## Consideraciones Técnicas

1. **Formato de Moneda**: Todos los valores monetarios están en Pesos Argentinos (ARS)
2. **Precisión Decimal**: Los valores se presentan con dos decimales
3. **Codificación**: Los archivos están codificados en UTF-8
4. **Actualización**: Los datos se actualizaron por última vez el 2025-09-27

## Categorías de Datos

### Ingresos (Revenue)
- **Corrientes**: Ingresos operativos regulares
- **Capital**: Ingresos relacionados con activos e inversiones
- **Fuentes Financieras**: Ingresos de financiamiento
- **Libre Disponibilidad**: Ingresos sin restricciones específicas
- **Afectados**: Ingresos destinados a usos específicos

### Gastos (Expenditure)
- **Personal**: Gastos en sueldos y beneficios para empleados
- **Bienes de Consumo**: Gastos en materiales y suministros
- **Servicios No Personales**: Gastos en servicios externos
- **Bienes de Uso**: Gastos en activos fijos
- **Transferencias**: Transferencias a otras entidades
- **Activos Financieros**: Inversiones financieras
- **Servicio de la Deuda**: Pagos de intereses y principal de deuda

### Posición Financiera (Financial Position)
- **Activo Corriente**: Recursos líquidos y equivalentes
- **Activo No Corriente**: Activos a largo plazo
- **Pasivo Corriente**: Obligaciones a corto plazo
- **Pasivo No Corriente**: Obligaciones a largo plazo

### Resultados Financieros (Financial Result)
- **Resultado Artículo 44**: Resultado operativo
- **Resultado del Ejercicio**: Resultado neto incluyendo todas las partidas

## Fuentes de Datos

Los datos fueron extraídos del documento oficial "Informe Económico Financiero 2019" del Municipio de Carmen de Areco, disponible en el portal de transparencia del municipio.