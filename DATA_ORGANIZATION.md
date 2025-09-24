# Organización de Datos del Portal de Transparencia

Este documento explica cómo se han organizado y estructurado todos los datos del Portal de Transparencia de Carmen de Areco para facilitar su acceso y comprensión.

## 📁 Estructura General de Directorios

```
frontend/public/data/
├── organized_documents/           # Documentos principales organizados
│   ├── 2018/
│   ├── 2019/
│   ├── 2020/
│   ├── 2021/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
├── organized_pdfs/                 # PDFs originales organizados
│   ├── 2018/
│   ├── 2019/
│   ├── 2020/
│   ├── 2021/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
├── markdown_documents/            # Versiones en texto de documentos
│   ├── 2018/
│   ├── 2019/
│   ├── 2020/
│   ├── 2021/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
├── json/                          # Datos estructurados en JSON
│   ├── 2018/
│   ├── 2019/
│   ├── 2020/
│   ├── 2021/
│   ├── 2022/
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
└── validation_reports/            # Informes de validación de datos
```

## 📂 Estructura por Año y Categoría

Dentro de cada directorio anual, los documentos se organizan por categorías:

```
2024/
├── Contrataciones/
│   ├── json/
│   ├── markdown/
│   └── pdfs/
├── Declaraciones_Patrimoniales/
│   ├── json/
│   ├── markdown/
│   └── pdfs/
├── Documentos_Generales/
│   ├── json/
│   ├── markdown/
│   └── pdfs/
├── Ejecución_de_Gastos/
│   ├── json/
│   ├── markdown/
│   └── pdfs/
├── Ejecución_de_Recursos/
│   ├── json/
│   ├── markdown/
│   └── pdfs/
├── Estados_Financieros/
│   ├── json/
│   ├── markdown/
│   └── pdfs/
├── Recursos_Humanos/
│   ├── json/
│   ├── markdown/
│   └── pdfs/
├── Salud_Pública/
│   ├── json/
│   ├── markdown/
│   └── pdfs/
└── Presupuesto_Municipal/
    ├── json/
    ├── markdown/
    └── pdfs/
```

## 📄 Tipos de Archivos Disponibles

### 1. PDFs Originales
Los archivos PDF originales tal como fueron publicados por la Municipalidad.

**Ubicación:** `organized_pdfs/[año]/[categoría]/[nombre_del_documento].pdf`

### 2. Texto Extraído (Markdown)
Versiones en texto plano de los documentos PDF, ideales para búsqueda y análisis textual.

**Ubicación:** `markdown_documents/[año]/[categoría]/[nombre_del_documento].md`

### 3. Datos Estructurados (JSON)
Datos extraídos de los documentos formateados como objetos JSON para análisis programático.

**Ubicación:** `organized_documents/[año]/[categoría]/json/[nombre_del_documento].json`

### 4. Versiones Legibles (Markdown)
Versiones formateadas de los documentos para fácil lectura en navegadores.

**Ubicación:** `organized_documents/[año]/[categoría]/markdown/[nombre_del_documento].md`

## 📊 Archivos de Inventario y Metadatos

### Inventario Completo
Un archivo CSV que lista todos los documentos con sus metadatos.

**Ubicación:** `organized_documents/document_inventory.csv`

### Resumen de Inventario
Un archivo JSON con estadísticas y resumen de la organización de documentos.

**Ubicación:** `organized_documents/inventory_summary.json`

### Metadatos por Categoría
Archivos JSON con información detallada sobre cada categoría.

**Ubicación:** `organized_documents/[categoría]/metadata.json`

## 🔍 Ejemplos de Acceso

### Acceder a un Documento Específico
```bash
# PDF Original
frontend/public/data/organized_pdfs/2024/Ejecución_de_Gastos/Estado-de-Ejecucion-de-Gastos-Junio.pdf

# Texto Extraído
frontend/public/data/markdown_documents/2024/Ejecución_de_Gastos/Estado-de-Ejecucion-de-Gastos-Junio.md

# Datos Estructurados
frontend/public/data/organized_documents/2024/Ejecución_de_Gastos/json/Estado-de-Ejecucion-de-Gastos-Junio.json

# Versión Legible
frontend/public/data/organized_documents/2024/Ejecución_de_Gastos/markdown/Estado-de-Ejecucion-de-Gastos-Junio.md
```

### Archivos de Inventario
```bash
# Inventario completo
frontend/public/data/organized_documents/document_inventory.csv

# Resumen del inventario
frontend/public/data/organized_documents/inventory_summary.json

# Metadatos de una categoría específica
frontend/public/data/organized_documents/2024/Ejecución_de_Gastos/metadata.json
```

## 📈 Categorías de Documentos

### Ejecución de Gastos
Informes detallados sobre el uso de fondos municipales.

### Ejecución de Recursos
Documentos sobre ingresos y fuentes de financiamiento.

### Estados Financieros
Balances generales y estados contables completos.

### Documentos Generales
Resoluciones, ordenanzas, disposiciones y otros documentos administrativos.

### Declaraciones Patrimoniales
Declaraciones juradas de funcionarios municipales.

### Salud Pública
Informes de programas de salud y atención médica.

### Recursos Humanos
Documentos relacionados con personal municipal.

### Contrataciones
Licitaciones públicas, contratos y procesos de compra.

### Presupuesto Municipal
Documentos de planificación y ejecución presupuestaria.

## 🔄 Proceso de Organización

1. **Recolección**: Descarga automática de documentos desde el sitio oficial
2. **Clasificación**: Categorización por tipo de documento y año
3. **Extracción**: Conversión de PDFs a texto y datos estructurados
4. **Validación**: Verificación de integridad y calidad de datos
5. **Indexación**: Creación de inventarios y metadatos
6. **Publicación**: Disponibilidad en formatos abiertos

## 📈 Estadísticas Actuales

- **Años Cubiertos**: 2018-2025
- **Categorías**: 15+
- **Documentos Procesados**: 500+
- **Formatos Disponibles**: PDF, Markdown, JSON
- **Tamaño Total de Datos**: ~500MB

## 🛠️ Herramientas de Acceso

### Navegador Web
- Acceso directo a través de URLs
- Visualización en navegador de versiones Markdown
- Descarga de archivos PDF originales

### API de Datos
Endpoint para acceso programático a todos los datos estructurados.

### Archivos de Inventario
CSV y JSON para análisis masivo de metadatos.

## 🔐 Calidad y Verificación

Todos los documentos pasan por un proceso de verificación que incluye:

1. **Integridad**: Comprobación de hashes para detectar corrupción
2. **Autenticidad**: Verificación de fuentes oficiales
3. **Completitud**: Validación de cobertura temporal
4. **Consistencia**: Chequeo de datos duplicados o contradictorios

## 📅 Actualizaciones

Los datos se actualizan regularmente mediante:

- **Monitoreo automático**: Scraping programado del sitio oficial
- **Notificaciones**: Detección de nuevos documentos
- **Procesamiento**: Conversión automática a formatos abiertos
- **Validación**: Chequeo de calidad antes de publicación

## 📞 Soporte y Contacto

Para reportar problemas con datos o solicitar información adicional:

- **Email**: [correo de contacto]
- **GitHub Issues**: [enlace al repositorio]
- **Sitio Oficial**: [enlace al portal municipal]

---
*Última actualización: Septiembre 2025*
