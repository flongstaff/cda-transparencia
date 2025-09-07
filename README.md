# 🏛️ Portal de Transparencia - Carmen de Areco

**Portal oficial de transparencia financiera y datos abiertos del municipio**

[![Frontend CI](https://github.com/flongstaff/cda-transparencia/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/flongstaff/cda-transparencia/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/flongstaff/cda-transparencia/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/flongstaff/cda-transparencia/actions/workflows/backend-ci.yml)
[![Python CI](https://github.com/flongstaff/cda-transparencia/actions/workflows/python-ci.yml/badge.svg)](https://github.com/flongstaff/cda-transparencia/actions/workflows/python-ci.yml)
[![Deploy](https://github.com/flongstaff/cda-transparencia/actions/workflows/deploy.yml/badge.svg)](https://github.com/flongstaff/cda-transparencia/actions/workflows/deploy.yml)

## 🎯 Objetivo del Proyecto

**Análisis integral de transparencia municipal (2019-2025)**

Este portal combina tecnologías modernas con análisis de datos para:
- **Prevenir la corrupción** mediante transparencia total de datos
- **Facilitar el acceso ciudadano** a información financiera municipal
- **Garantizar la integridad** de datos a través de tecnologías seguras
- **Cumplir con marcos legales** de transparencia y acceso a la información

### 📈 Estadísticas del Sistema
- **610+** registros de datos activos
- **7** años de cobertura (2019-2025)  
- **6** fuentes de datos integradas
- **2,100+** documentos archivados totales
- **12/12** endpoints operacionales

## 🚀 Tecnología y Arquitectura

### Stack Principal
- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + PostgreSQL
- **Data Processing:** Python 3.8+ con múltiples librerías
- **Deployment:** Docker + GitHub Actions + Cloudflare Workers

### Características Técnicas
- **API REST** completa con documentación Swagger
- **Base de datos PostgreSQL** con Docker Compose
- **Extracción automatizada** de datos Power BI
- **Processing de documentos PDF** con OCR
- **Análisis financiero avanzado** con detección de anomalías
- **Sistema de verificación** de integridad de documentos
- **Dashboard interactivo** con visualizaciones en tiempo real

## 🗂️ Estructura del Proyecto

```
cda-transparencia/
├── 📁 frontend/                 # Dashboard interactivo React
│   ├── src/
│   │   ├── components/         # Componentes UI reutilizables
│   │   │   ├── charts/        # Visualizaciones de datos
│   │   │   ├── dashboard/     # Componentes de dashboard
│   │   │   ├── audit/         # Componentes de auditoría
│   │   │   └── documents/     # Componentes de gestión documental
│   │   ├── pages/             # Páginas principales de la aplicación
│   │   │   ├── Home.tsx           # Página de inicio
│   │   │   ├── Dashboard.tsx      # Panel de control financiero
│   │   │   ├── LiveDataDashboard.tsx  # Datos en vivo
│   │   │   ├── Financial.tsx      # Panel financiero consolidado (Presupuesto + Deuda + Estados Financieros)
│   │   │   ├── Contracts.tsx      # Contratos y licitaciones
│   │   │   ├── Salaries.tsx       # Nómina y salarios
│   │   │   ├── PropertyDeclarations.tsx  # Declaraciones patrimoniales
│   │   │   ├── Documents.tsx      # Gestión documental
│   │   │   ├── DocumentDetail.tsx # Vista detallada de documento
│   │   │   ├── Audit.tsx          # Sistema de auditoría
│   │   │   ├── Reports.tsx        # Reportes y análisis
│   │   │   ├── About.tsx          # Información del proyecto
│   │   │   └── Contact.tsx        # Contacto y sugerencias
│   │   ├── services/          # Servicios de integración de datos
│   │   │   ├── ConsolidatedApiService.ts  # Servicio principal de API
│   │   │   ├── ChartService.ts            # Servicio de gráficos
│   │   │   └── UnifiedDataService.ts      # Servicio de datos unificados
│   │   ├── utils/             # Utilidades y funciones auxiliares
│   │   │   ├── formatters.ts  # Funciones de formato
│   │   │   └── validators.ts  # Funciones de validación
│   │   └── contexts/          # Contextos de React
│   │       └── YearContext.ts # Contexto para selección de año
│   ├── public/                # Archivos públicos
│   └── package.json           # Dependencias y scripts del frontend
├── 📁 backend/                # Backend Node.js
│   ├── src/
│   │   ├── routes/            # Rutas de la API
│   │   ├── services/          # Servicios de backend
│   │   ├── controllers/       # Controladores
│   │   └── middleware/        # Middleware
│   ├── server.js              # Punto de entrada del servidor
│   └── package.json           # Dependencias y scripts del backend
├── 📁 data/                   # Datos procesados
│   ├── pdf_extracts/          # Extracciones de PDFs
│   ├── markdown_documents/    # Documentos en formato Markdown
│   ├── audit_results/         # Resultados de auditoría
│   └── db/                    # Base de datos SQLite
├── 📁 scripts/                # Scripts de procesamiento
│   ├── extract_pdfs.py        # Extracción de PDFs
│   ├── process_documents.py   # Procesamiento de documentos
│   └── run_powerbi_extraction.py  # Extracción de datos Power BI
├── 📁 docs/                   # Documentación del proyecto
│   ├── DATA_SOURCES.md        # Fuentes de datos
│   ├── FINANCIAL_ANALYSIS_GUIDE.md  # Guía de análisis financiero
│   └── POWER_BI_INTEGRATION.md      # Integración con Power BI
├── 📁 tests/                  # Pruebas
│   ├── frontend/              # Pruebas del frontend
│   ├── backend/               # Pruebas del backend
│   └── e2e/                   # Pruebas end-to-end
├── Dockerfile                 # Configuración de Docker
├── docker-compose.yml         # Configuración de Docker Compose
├── requirements.txt           # Dependencias de Python
└── README.md                 # Este archivo
```

## 🌐 Páginas Principales

1. **🏠 Inicio** - Vista general del portal con métricas clave
2. **📊 Panel de Control** - Dashboard financiero integral con visualizaciones
3. **🔴 Datos en Vivo** - Visualización en tiempo real de documentos nuevos
4. **💰 Panel Financiero** - Análisis consolidado de presupuesto, deuda y estados financieros
5. **📋 Contratos** - Seguimiento de licitaciones y contratos públicos
6. **👥 Salarios** - Nómina y estructura salarial municipal
7. **🏛️ Declaraciones** - Declaraciones juradas de funcionarios
8. **📄 Documentos** - Repositorio de documentos oficiales
9. **🔍 Auditoría** - Sistema de detección de irregularidades
10. **📊 Reportes** - Generación de reportes personalizados

## 🔧 Instalación y Uso

### Requisitos Previos
- Node.js v18+
- Python 3.8+
- PostgreSQL (opcional, para desarrollo avanzado)
- Docker (opcional, para despliegue)

### Instalación Frontend
```bash
cd frontend
npm install
npm run dev
```

### Instalación Backend
```bash
cd backend
npm install
npm start
```

### Procesamiento de Datos
```bash
# Activar entorno virtual de Python
source .venv/bin/activate

# Ejecutar scripts de extracción
python scripts/extract_pdfs.py
python scripts/process_documents.py
python scripts/run_powerbi_extraction.py
```

## 📊 Características Clave

### Transparencia Financiera
- **Visualización en tiempo real** de datos presupuestarios
- **Análisis comparativo** entre años y categorías
- **Indicadores de desempeño** financieros clave
- **Alertas automáticas** para valores fuera de rango

### Sistema de Auditoría
- **Detección de patrones sospechosos** en contrataciones
- **Verificación cruzada** de datos con fuentes oficiales
- **Historial de cambios** en documentos importantes
- **Reportes de riesgo** de corrupción

### Gestión Documental
- **Catálogo completo** de documentos oficiales
- **Búsqueda avanzada** por categoría, año y contenido
- **Verificación de integridad** de archivos
- **Acceso directo** a fuentes oficiales

## 🛡️ Seguridad y Privacidad

- Todos los datos son **públicos y oficiales**
- No se recopilan datos personales de usuarios
- Las conexiones usan **HTTPS seguro**
- Los documentos se verifican por **integridad criptográfica**
- El código es **abierto y auditado**

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/NuevaCaracteristica`)
3. Haz commit de tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Haz push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

Para preguntas o sugerencias, por favor contacta a:
- **Email:** transparency@carmendeareco.gob.ar
- **Sitio Oficial:** [carmendeareco.gob.ar](https://carmendeareco.gob.ar)

---
*Portal de Transparencia - Carmen de Areco © 2025 - Todos los derechos reservados*
│   │   │   └── audit/         # Componentes de auditoría
│   │   ├── pages/             # Páginas principales
│   │   ├── services/          # Servicios de datos
│   │   └── hooks/             # React hooks personalizados
│   └── public/data/           # Datos estáticos
├── 📁 backend/                  # API REST Node.js
│   ├── src/
│   │   ├── controllers/       # Controladores API
│   │   ├── services/          # Lógica de negocio
│   │   ├── routes/           # Rutas de la API
│   │   └── config/           # Configuración
│   └── data/                 # Base de datos y migraciones
├── 📁 scripts/                  # Scripts de automatización
│   ├── audit/                # Scripts de auditoría
│   ├── data-processing/      # Procesamiento de datos
│   └── verification/         # Scripts de verificación
├── 📁 data/                     # Repositorio de datos
│   ├── source_materials/     # PDFs originales por año
│   ├── preserved/           # Datos estructurados (JSON/CSV)
│   └── markdown_documents/  # Documentos procesados
├── 📁 docs/                     # Documentación
└── 📁 database/                 # Configuración de BD
```

## 🛠️ Desarrollo Local

### Requisitos Previos
- Node.js 18+
- Python 3.8+
- Docker & Docker Compose
- Git

### Instalación Rápida

1. **Clonar el repositorio:**
```bash
git clone https://github.com/flongstaff/cda-transparencia.git
cd cda-transparencia
```

2. **Instalar dependencias:**
```bash
# Frontend
cd frontend && npm install && cd ..

# Backend  
cd backend && npm install && cd ..

# Python dependencies
pip install -r requirements.txt
```

3. **Configurar base de datos:**
```bash
cd backend
docker-compose up -d
```

4. **Iniciar servicios:**
```bash
# Terminal 1: Backend API
cd backend && npm start

# Terminal 2: Frontend dev server
cd frontend && npm run dev
```

### URLs de Acceso
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Documentación API:** http://localhost:3001/api-docs

## 📊 Funcionalidades Principales

### 🌐 Portal Web
- **Dashboard financiero** con visualizaciones interactivas
- **Navegación por años** (2009-2025) con datos históricos
- **Visualización de documentos** con viewer PDF integrado
- **Búsqueda avanzada** por categoría, año y tipo de documento
- **Análisis comparativo** entre períodos administrativos

### 🔍 Análisis y Auditoría
- **Detección de anomalías** en gastos públicos
- **Auditoría financiera automatizada** 
- **Seguimiento de contratos** y licitaciones
- **Análisis salarial** y benchmarking
- **Alertas de transparencia** por irregularidades

### 📈 Dashboards Disponibles
- **Presupuesto Municipal:** Ejecución y análisis
- **Gastos Públicos:** Categorización y seguimiento
- **Ingresos y Recursos:** Fuentes y procedencia
- **Salarios:** Escalas y evolución histórica
- **Contratos:** Licitaciones y adjudicaciones
- **Inversiones:** Proyectos de infraestructura
- **Deuda Pública:** Estado y evolución

## 📡 API REST

### Endpoints Principales
```
GET  /api/yearly-data/:year          # Datos financieros por año
GET  /api/documents                  # Listado de documentos
GET  /api/budget/:year              # Presupuesto específico
GET  /api/salaries/:year            # Datos salariales
GET  /api/contracts/:year           # Contratos y licitaciones
GET  /api/audit/anomalies           # Detección de anomalías
```

### Documentación
- **Swagger UI:** `/api-docs` (en servidor local)
- **Postman Collection:** Disponible en `/docs/api/`

## 🚀 Despliegue

### Producción
- **GitHub Pages:** [https://flongstaff.github.io/cda-transparencia/](https://flongstaff.github.io/cda-transparencia/)
- **CI/CD:** Automatizado con GitHub Actions
- **Cloudflare Workers:** Soporte para edge computing

### Docker
```bash
# Build completo
docker-compose up --build

# Solo base de datos
docker-compose up postgres -d
```

## 🔍 Extracción y Procesamiento de Datos

### Fuentes de Datos
- **Portal oficial municipal:** Web scraping automatizado
- **Power BI:** Extracción de dashboards oficiales
- **Documentos PDF:** OCR y procesamiento automático
- **APIs externas:** Datos de comparación regional

### Scripts de Procesamiento
```bash
# Procesar documentos PDF
python scripts/scrapers/pdf_extractor.py

# Extraer datos de Power BI
python scripts/scrapers/power_bi.py

# Verificar integridad de datos
python scripts/verification/integrity_checker.py
```

## ⚖️ Compliance y Marco Legal

Este proyecto cumple con:
- **Ley 27.275** - Acceso a la Información Pública
- **Ley 25.326** - Protección de Datos Personales  
- **Decreto 434/2016** - Plan de Apertura de Datos
- **Normativa municipal** de transparencia
- **Estándares internacionales** de datos abiertos

## 🛡️ Seguridad y Privacidad

- ✅ **Datos anonimizados** según normativa
- ✅ **HTTPS en toda comunicación**
- ✅ **Headers de seguridad** implementados
- ✅ **Validación de inputs** en toda la API
- ✅ **Logs de auditoría** para acceso a datos sensibles

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

### Estándares de Código
- **Frontend:** ESLint + Prettier para TypeScript/React
- **Backend:** ESLint para Node.js
- **Python:** Black + flake8 para scripts
- **Testing:** Jest (Frontend), Mocha (Backend), pytest (Python)

## 🎯 Implementación de Sistemas de Auditoría

### Sistemas Implementados
- **Detección de anomalías** en patrones de gasto
- **Auditoría de registros financieros** automatizada
- **Screening de conflictos de interés** 
- **Mapeo de relaciones con proveedores**
- **Supervisión de contratos** y umbrales de licitación
- **Benchmarking salarial** con municipios pares
- **Dashboard de performance** de contratistas
- **Auditorías anuales** de proyectos de infraestructura

### Métricas de Éxito
- Reducción del 50% en tiempo de auditoría manual
- Mejora en precisión de detección de anomalías
- Mayor transparencia en procesos financieros
- Mejor cumplimiento de umbrales presupuestarios

## 📞 Soporte y Contacto

- **Issues:** [GitHub Issues](https://github.com/flongstaff/cda-transparencia/issues)
- **Documentación:** Ver carpeta `/docs/`
- **Portal Oficial:** [carmendeareco.gob.ar/transparencia](https://carmendeareco.gob.ar/transparencia/)

## 📄 Licencia

Proyecto desarrollado para fines de transparencia y rendición de cuentas públicas en Carmen de Areco, Buenos Aires, Argentina.

---

**🏛️ Transparencia Municipal • 📊 Datos Abiertos • 🔍 Análisis Integral**  
*Última actualización: Septiembre 2025*