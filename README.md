# 🏛️ Portal de Transparencia - Carmen de Areco

**Portal oficial de transparencia financiera y datos abiertos**

[![Frontend CI](https://github.com/flongstaff/cda-transparencia/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/flongstaff/cda-transparencia/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/flongstaff/cda-transparencia/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/flongstaff/cda-transparencia/actions/workflows/backend-ci.yml)
[![Deploy](https://github.com/flongstaff/cda-transparencia/actions/workflows/deploy.yml/badge.svg)](https://github.com/flongstaff/cda-transparencia/actions/workflows/deploy.yml)

## 📊 Investigación de Transparencia Municipal (2009-2025)

### 🎯 Objetivo
Análisis integral de 15 años de gestión municipal para identificar:
- Patrones en la ejecución presupuestaria
- Transparencia en contrataciones públicas
- Evolución salarial del sector público
- Cumplimiento de normativa de transparencia

### 📈 Estadísticas del Proyecto

- **270** documentos procesados
- **9** años de datos
- **124** documentos de alta prioridad
- **100%** de verificación de integridad

## 🚀 Tecnologías

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express API
- **Base de Datos:** PostgreSQL (Docker)
- **Procesamiento de Datos:** Python scripts para Excel/PDF
- **Despliegue:** GitHub Pages + GitHub Actions

## 🗂️ Estructura del Repositorio

```
├── data/
│   ├── preserved/           # Datos estructurados (JSON, CSV)
│   ├── markdown_documents/ # Documentos en formato markdown
│   └── source_materials/   # Archivos originales por año
├── frontend/              # Dashboard interactivo (React)
├── backend/               # API REST (Node.js + PostgreSQL)
├── scripts/               # Scripts de procesamiento
└── docs/                  # Documentación del proyecto
```

## 🛠️ Desarrollo Local

### Requisitos Previos
- Node.js 18+
- Python 3.8+
- Docker (para la base de datos)

### Frontend

```bash
cd frontend
npm install
npm run dev
# Acceder a http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm start
# API disponible en http://localhost:3000/api
```

### Base de Datos

```bash
cd backend
docker-compose up -d
```

## 📱 Acceso a los Datos

### 🌐 Dashboard Web
```bash
cd frontend && npm install && npm run dev
# Acceder a http://localhost:5173
```

### 🔍 API REST
```bash
cd backend && npm install && npm start
# API disponible en http://localhost:3000/api
```

### 📊 Datos Estructurados
- [`data/preserved/json/`](./data/preserved/json/) - Formato JSON
- [`data/preserved/csv/`](./data/preserved/csv/) - Formato CSV
- [`data/markdown_documents/`](./data/markdown_documents/) - Documentos markdown

## 🔍 Búsqueda de Documentos

Utiliza la búsqueda de GitHub para encontrar información específica:
- `filename:presupuesto` - Buscar documentos de presupuesto
- `path:2024/` - Documentos del año 2024
- `"licitación pública"` - Buscar licitaciones

## ⚖️ Marco Legal

Este proyecto cumple con:
- **Ley 27.275** (Acceso a la Información Pública)
- **Ley 25.326** (Protección de Datos Personales)
- **Normativa municipal** de transparencia

## 🤝 Contribuciones

1. Fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Contacto

Para consultas sobre transparencia municipal:
- **Portal Oficial:** [carmendeareco.gob.ar/transparencia](https://carmendeareco.gob.ar/transparencia/)
- **Archivo Web:** [Wayback Machine](https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/)

---

**🎯 Proyecto de investigación de transparencia municipal**
*Última actualización: 26/08/2025*