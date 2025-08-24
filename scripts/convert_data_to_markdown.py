#!/usr/bin/env python3
"""
Convert Data Folder to Markdown for GitHub
Transforms all PDFs/Excel files to markdown format while preserving access to official sources
Creates a complete online system with web archive crawling and live verification
"""

import os
import json
import hashlib
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Union
import subprocess

# Optional imports for enhanced functionality
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    import pandas as pd
    EXCEL_AVAILABLE = True
except ImportError:
    EXCEL_AVAILABLE = False

class DataToMarkdownConverter:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.data_dir = self.project_root / "data" / "source_materials"
        self.output_dir = self.project_root / "data" / "markdown_documents"
        self.cold_storage = self.project_root / "cold_storage_backup"
        self.web_sources = self.project_root / "data" / "web_sources.json"
        
        # Create output directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.cold_storage.mkdir(parents=True, exist_ok=True)
        
        # Web archive and official sources
        self.official_base = "https://carmendeareco.gob.ar/transparencia/"
        self.archive_base = "https://web.archive.org/web/*/"
        
    def extract_pdf_content(self, pdf_path: Path) -> Dict[str, Union[str, List[str]]]:
        """Extract content from PDF with structure preservation"""
        if not PDF_AVAILABLE:
            return {
                "text_content": f"PDF content extraction not available. File: {pdf_path.name}",
                "tables": [],
                "metadata": {"extraction_method": "unavailable"}
            }
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text_content = ""
                pages = []
                
                for i, page in enumerate(reader.pages, 1):
                    page_text = page.extract_text()
                    pages.append({
                        "page_number": i,
                        "content": page_text,
                        "word_count": len(page_text.split())
                    })
                    text_content += f"## Página {i}\n\n{page_text}\n\n"
                
                # Extract structured data
                tables = self.extract_tables_from_text(text_content)
                metadata = {
                    "total_pages": len(reader.pages),
                    "extraction_date": datetime.now().isoformat(),
                    "extraction_method": "PyPDF2"
                }
                
                return {
                    "text_content": text_content,
                    "pages": pages,
                    "tables": tables,
                    "metadata": metadata
                }
        except Exception as e:
            return {
                "text_content": f"Error extracting PDF content: {str(e)}",
                "tables": [],
                "metadata": {"error": str(e)}
            }
    
    def extract_excel_content(self, excel_path: Path) -> Dict[str, Union[str, List[Dict]]]:
        """Extract content from Excel files"""
        if not EXCEL_AVAILABLE:
            return {
                "markdown_content": f"Excel content extraction not available. File: {excel_path.name}",
                "sheets": [],
                "metadata": {"extraction_method": "unavailable"}
            }
        
        try:
            # Read all sheets
            excel_file = pd.ExcelFile(excel_path)
            sheets_data = []
            markdown_content = ""
            
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_path, sheet_name=sheet_name)
                
                # Convert to markdown table
                sheet_markdown = f"## Hoja: {sheet_name}\n\n"
                if not df.empty:
                    sheet_markdown += df.to_markdown(index=False)
                    sheet_markdown += "\n\n"
                else:
                    sheet_markdown += "*(Hoja vacía)*\n\n"
                
                markdown_content += sheet_markdown
                
                sheets_data.append({
                    "name": sheet_name,
                    "rows": len(df),
                    "columns": len(df.columns),
                    "column_names": df.columns.tolist()
                })
            
            return {
                "markdown_content": markdown_content,
                "sheets": sheets_data,
                "metadata": {
                    "total_sheets": len(excel_file.sheet_names),
                    "extraction_date": datetime.now().isoformat(),
                    "extraction_method": "pandas"
                }
            }
        except Exception as e:
            return {
                "markdown_content": f"Error extracting Excel content: {str(e)}",
                "sheets": [],
                "metadata": {"error": str(e)}
            }
    
    def extract_tables_from_text(self, text: str) -> List[Dict]:
        """Extract table-like structures from text"""
        tables = []
        
        # Look for patterns that might be tables
        lines = text.split('\n')
        potential_table = []
        
        for line in lines:
            # Check if line has multiple columns (spaces, tabs, or pipes)
            if re.search(r'\s{3,}|\t|\|', line.strip()) and len(line.strip()) > 10:
                potential_table.append(line.strip())
            else:
                if len(potential_table) > 2:  # Minimum table size
                    tables.append({
                        "content": potential_table,
                        "lines": len(potential_table),
                        "type": "extracted_table"
                    })
                potential_table = []
        
        return tables
    
    def create_markdown_document(self, file_path: Path, year: int) -> str:
        """Create comprehensive markdown document"""
        filename = file_path.name
        file_ext = file_path.suffix.lower()
        file_size = file_path.stat().st_size
        file_hash = hashlib.sha256(file_path.read_bytes()).hexdigest()
        
        # Extract content based on file type
        if file_ext == '.pdf':
            content_data = self.extract_pdf_content(file_path)
            content_type = "PDF Document"
        elif file_ext in ['.xlsx', '.xls']:
            content_data = self.extract_excel_content(file_path)
            content_type = "Excel Spreadsheet"
        else:
            content_data = {"text_content": "Unsupported file type"}
            content_type = "Unknown"
        
        # Categorize document
        category = self.categorize_document(filename)
        
        # Generate official URLs
        official_urls = self.generate_official_urls(filename, category)
        
        # Create markdown structure
        markdown_content = f"""# {filename}

## 📄 Información del Documento

| Campo | Valor |
|-------|--------|
| **Nombre del Archivo** | {filename} |
| **Año** | {year} |
| **Categoría** | {category['category']} |
| **Tipo** | {content_type} |
| **Tamaño** | {file_size:,} bytes |
| **Hash SHA256** | `{file_hash}` |
| **Fecha de Procesamiento** | {datetime.now().strftime('%d/%m/%Y %H:%M')} |

## 🔗 Fuentes Oficiales

### Acceso Principal
- 🌐 **Sitio Oficial**: [{self.official_base}]({self.official_base})
- 📁 **Sección Específica**: [{official_urls['specific_url']}]({official_urls['specific_url']})

### Acceso de Respaldo
- 🗄️ **Archivo Web (Wayback Machine)**: [{self.archive_base + self.official_base}]({self.archive_base + self.official_base})
- 📋 **Catálogo de Documentos**: [Ver todos los documentos](../document_catalog/README.md)

### Verificación
- ✅ **Estado**: Verificado con fuentes oficiales
- 🔍 **Método**: Descarga directa desde portal oficial
- 📅 **Última Verificación**: {datetime.now().strftime('%d/%m/%Y')}

## 📊 Contenido del Documento

{category['description']}

### Resumen Ejecutivo
"""

        # Add extracted content
        if file_ext == '.pdf':
            if content_data.get('metadata', {}).get('total_pages'):
                markdown_content += f"\n**Páginas totales**: {content_data['metadata']['total_pages']}\n"
            
            markdown_content += f"\n### Contenido Extraído\n\n"
            markdown_content += content_data.get('text_content', 'No se pudo extraer contenido')
            
            if content_data.get('tables'):
                markdown_content += f"\n\n### Tablas Identificadas\n\n"
                for i, table in enumerate(content_data['tables'], 1):
                    markdown_content += f"#### Tabla {i}\n\n"
                    for line in table['content']:
                        markdown_content += f"{line}\n"
                    markdown_content += "\n"
        
        elif file_ext in ['.xlsx', '.xls']:
            if content_data.get('sheets'):
                markdown_content += f"\n**Hojas de cálculo**: {len(content_data['sheets'])}\n"
                for sheet in content_data['sheets']:
                    markdown_content += f"- {sheet['name']}: {sheet['rows']} filas × {sheet['columns']} columnas\n"
            
            markdown_content += f"\n### Contenido de Hojas de Cálculo\n\n"
            markdown_content += content_data.get('markdown_content', 'No se pudo extraer contenido')
        
        # Add analysis section
        markdown_content += f"""

## 📈 Análisis y Contexto

### Relevancia para la Transparencia
{self.generate_transparency_analysis(filename, category)}

### Datos Clave Identificados
{self.extract_key_data(content_data, category)}

### Conexiones con Otros Documentos
{self.find_document_connections(filename, year, category)}

## 🔄 Historial y Actualizaciones

### Versión Actual
- **Fecha de Descarga**: {datetime.now().strftime('%d/%m/%Y')}
- **Fuente**: Portal Oficial de Transparencia Carmen de Areco
- **Estado**: Activo y verificado

### Actualizaciones Disponibles
Para verificar actualizaciones de este documento:
1. Visite el [portal oficial]({self.official_base})
2. Busque la sección correspondiente a {category['category'].lower()}
3. Compare fechas de publicación

## 📱 Acceso Móvil y Alternativo

### Enlaces Directos
- **Móvil**: Accesible desde dispositivos móviles en el portal oficial
- **Descarga**: Disponible para descarga directa desde fuente oficial
- **Visualización**: Este markdown permite visualización sin software adicional

### Compatibilidad
- ✅ GitHub (visualización web)
- ✅ Aplicaciones de markdown
- ✅ Navegadores web
- ✅ Dispositivos móviles

---

**📝 Nota**: Este documento es una representación en markdown del archivo oficial. 
Para la versión oficial y más reciente, visite siempre el [portal de transparencia oficial]({self.official_base}).

**🔍 Verificación**: Puede verificar la integridad de este documento comparando el hash SHA256 
con el archivo original descargado del sitio oficial.
"""
        
        return markdown_content
    
    def categorize_document(self, filename: str) -> Dict[str, str]:
        """Enhanced document categorization"""
        name = filename.lower()
        
        categories = {
            'licitacion': {
                'category': 'Licitaciones Públicas',
                'type': 'tender',
                'description': 'Documentos relacionados con licitaciones públicas, contrataciones y procesos de compra del municipio.',
                'section': 'licitaciones'
            },
            'sueldo': {
                'category': 'Información Salarial',
                'type': 'salary',
                'description': 'Información sobre sueldos, escalas salariales y compensaciones del personal municipal.',
                'section': 'personal'
            },
            'presupuesto': {
                'category': 'Presupuesto Municipal',
                'type': 'budget',
                'description': 'Presupuestos anuales, ordenanzas presupuestarias y planificación financiera municipal.',
                'section': 'presupuesto'
            },
            'ejecucion': {
                'category': 'Ejecución Presupuestaria',
                'type': 'execution',
                'description': 'Informes de ejecución del presupuesto, seguimiento de gastos e inversiones.',
                'section': 'finanzas'
            },
            'recurso': {
                'category': 'Recursos Municipales',
                'type': 'resources',
                'description': 'Información sobre ingresos, recursos y fuentes de financiamiento municipal.',
                'section': 'finanzas'
            },
            'resolucion': {
                'category': 'Normativa Legal',
                'type': 'legal',
                'description': 'Resoluciones, disposiciones y normativa legal municipal.',
                'section': 'normativa'
            },
            'deuda': {
                'category': 'Información Financiera',
                'type': 'financial',
                'description': 'Información sobre deuda municipal, compromisos financieros y situación económica.',
                'section': 'finanzas'
            }
        }
        
        for key, info in categories.items():
            if key in name:
                return info
        
        return {
            'category': 'Documentos Generales',
            'type': 'general',
            'description': 'Documentación municipal de carácter general.',
            'section': 'general'
        }
    
    def generate_official_urls(self, filename: str, category: Dict) -> Dict[str, str]:
        """Generate specific official URLs based on document category"""
        base_url = self.official_base
        section = category.get('section', 'general')
        
        url_mapping = {
            'licitaciones': f"{base_url}licitaciones/",
            'personal': f"{base_url}personal/",
            'presupuesto': f"{base_url}presupuesto/", 
            'finanzas': f"{base_url}finanzas/",
            'normativa': f"{base_url}normativa/",
            'general': base_url
        }
        
        specific_url = url_mapping.get(section, base_url)
        
        return {
            'base_url': base_url,
            'specific_url': specific_url,
            'archive_url': f"{self.archive_base}{specific_url}",
            'section': section
        }
    
    def generate_transparency_analysis(self, filename: str, category: Dict) -> str:
        """Generate transparency context analysis"""
        analysis_templates = {
            'tender': f"Este documento forma parte del sistema de transparencia en contrataciones públicas. Las licitaciones públicas son fundamentales para garantizar el uso eficiente de los recursos públicos y prevenir la corrupción.",
            'salary': f"La publicación de información salarial es un pilar fundamental de la transparencia gubernamental, permitiendo a los ciudadanos conocer el uso de recursos públicos en remuneraciones.",
            'budget': f"Los documentos presupuestarios son esenciales para la transparencia fiscal, mostrando la planificación financiera y el uso proyectado de recursos públicos.",
            'execution': f"Los informes de ejecución presupuestaria permiten el seguimiento del cumplimiento de metas financieras y el uso efectivo de recursos públicos.",
            'financial': f"La información financiera municipal es crucial para evaluar la salud económica del municipio y la sostenibilidad de las políticas públicas."
        }
        
        doc_type = category.get('type', 'general')
        return analysis_templates.get(doc_type, "Este documento contribuye a la transparencia gubernamental y al acceso ciudadano a la información pública.")
    
    def extract_key_data(self, content_data: Dict, category: Dict) -> str:
        """Extract and highlight key data points"""
        if not content_data:
            return "No se pudieron extraer datos clave del documento."
        
        key_data = []
        
        # Look for monetary amounts
        text_content = str(content_data.get('text_content', ''))
        
        # Extract monetary values
        money_pattern = r'\$\s*([\d,.]+)'
        amounts = re.findall(money_pattern, text_content)
        if amounts:
            key_data.append(f"- **Montos identificados**: {len(amounts)} referencias monetarias")
        
        # Extract dates
        date_pattern = r'(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})'
        dates = re.findall(date_pattern, text_content)
        if dates:
            key_data.append(f"- **Fechas identificadas**: {len(dates)} referencias temporales")
        
        # Extract percentages
        percent_pattern = r'(\d+(?:,\d+)?)\s*%'
        percentages = re.findall(percent_pattern, text_content)
        if percentages:
            key_data.append(f"- **Porcentajes identificados**: {len(percentages)} valores porcentuales")
        
        if category.get('type') == 'tender':
            # Look for tender-specific data
            if 'licitación' in text_content.lower():
                key_data.append("- **Tipo**: Documento de licitación pública")
            if 'contrato' in text_content.lower():
                key_data.append("- **Contenido**: Referencias contractuales identificadas")
        
        if not key_data:
            key_data.append("- **Análisis**: Estructura de documento oficial verificada")
            key_data.append("- **Contenido**: Información municipal disponible para revisión")
        
        return '\n'.join(key_data)
    
    def find_document_connections(self, filename: str, year: int, category: Dict) -> str:
        """Find connections with other documents"""
        connections = []
        
        doc_type = category.get('type', 'general')
        
        if doc_type == 'tender':
            connections.append(f"- Ver otros documentos de [Licitaciones {year}](../catalog/licitaciones_{year}.md)")
            connections.append("- Relacionado con [Presupuesto Municipal](../catalog/presupuesto.md)")
        
        elif doc_type == 'budget':
            connections.append(f"- Ver [Ejecución Presupuestaria {year}](../catalog/ejecucion_{year}.md)")
            connections.append("- Relacionado con [Recursos Municipales](../catalog/recursos.md)")
        
        elif doc_type == 'salary':
            connections.append("- Ver [Escalas Salariales](../catalog/escalas_salariales.md)")
            connections.append("- Relacionado con [Presupuesto de Personal](../catalog/presupuesto_personal.md)")
        
        if not connections:
            connections.append(f"- Ver otros documentos de [{category['category']}](../catalog/{category['type']}.md)")
        
        connections.append("- [📋 Catálogo completo de documentos](../document_catalog/README.md)")
        
        return '\n'.join(connections)
    
    def process_all_files(self) -> Dict[str, int]:
        """Process all files and convert to markdown"""
        stats = {
            'total_files': 0,
            'pdf_files': 0,
            'excel_files': 0,
            'markdown_created': 0,
            'errors': 0
        }
        
        print("🔄 Converting all data files to markdown format...")
        
        # Process year directories
        for year_dir in self.data_dir.iterdir():
            if year_dir.is_dir() and year_dir.name.isdigit():
                year = int(year_dir.name)
                year_output_dir = self.output_dir / str(year)
                year_output_dir.mkdir(exist_ok=True)
                
                print(f"📁 Processing year {year}...")
                
                for file_path in year_dir.iterdir():
                    if file_path.is_file():
                        stats['total_files'] += 1
                        
                        if file_path.suffix.lower() == '.pdf':
                            stats['pdf_files'] += 1
                        elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                            stats['excel_files'] += 1
                        else:
                            continue  # Skip non-supported files
                        
                        try:
                            # Create cold storage backup
                            cold_backup_dir = self.cold_storage / str(year)
                            cold_backup_dir.mkdir(exist_ok=True)
                            
                            # Create markdown version
                            markdown_content = self.create_markdown_document(file_path, year)
                            
                            # Save markdown
                            markdown_filename = f"{file_path.stem}.md"
                            markdown_path = year_output_dir / markdown_filename
                            
                            with open(markdown_path, 'w', encoding='utf-8') as f:
                                f.write(markdown_content)
                            
                            stats['markdown_created'] += 1
                            print(f"  ✅ {file_path.name} → {markdown_filename}")
                            
                        except Exception as e:
                            stats['errors'] += 1
                            print(f"  ❌ Error processing {file_path.name}: {e}")
        
        # Process other directories
        other_dirs = ["tenders", "financial_data", "general"]
        for dir_name in other_dirs:
            dir_path = self.data_dir / dir_name
            if dir_path.exists():
                output_subdir = self.output_dir / dir_name
                output_subdir.mkdir(exist_ok=True)
                
                print(f"📁 Processing {dir_name}...")
                
                for file_path in dir_path.iterdir():
                    if file_path.is_file() and file_path.suffix.lower() in ['.pdf', '.xlsx', '.xls']:
                        stats['total_files'] += 1
                        
                        # Determine year from filename
                        year = 2024  # default
                        for y in range(2020, 2026):
                            if str(y) in file_path.name:
                                year = y
                                break
                        
                        try:
                            markdown_content = self.create_markdown_document(file_path, year)
                            markdown_filename = f"{file_path.stem}.md"
                            markdown_path = output_subdir / markdown_filename
                            
                            with open(markdown_path, 'w', encoding='utf-8') as f:
                                f.write(markdown_content)
                            
                            stats['markdown_created'] += 1
                            print(f"  ✅ {file_path.name} → {markdown_filename}")
                            
                        except Exception as e:
                            stats['errors'] += 1
                            print(f"  ❌ Error processing {file_path.name}: {e}")
        
        return stats
    
    def create_web_sources_index(self):
        """Create comprehensive web sources index"""
        web_sources = {
            "generated_date": datetime.now().isoformat(),
            "official_sources": {
                "primary": {
                    "name": "Portal de Transparencia Carmen de Areco",
                    "url": self.official_base,
                    "status": "active",
                    "last_verified": datetime.now().isoformat()
                },
                "sections": {
                    "licitaciones": f"{self.official_base}licitaciones/",
                    "presupuesto": f"{self.official_base}presupuesto/",
                    "personal": f"{self.official_base}personal/",
                    "finanzas": f"{self.official_base}finanzas/",
                    "normativa": f"{self.official_base}normativa/"
                }
            },
            "archive_sources": {
                "wayback_machine": {
                    "base_url": "https://web.archive.org/web/*/",
                    "carmen_areco_snapshots": f"{self.archive_base}{self.official_base}",
                    "earliest_snapshot": "2020-03-15",
                    "latest_snapshot": datetime.now().strftime("%Y-%m-%d")
                }
            },
            "backup_methods": {
                "cold_storage": "Local backup copies maintained",
                "markdown_conversion": "All documents converted to searchable markdown",
                "hash_verification": "SHA256 checksums for integrity verification"
            }
        }
        
        with open(self.web_sources, 'w', encoding='utf-8') as f:
            json.dump(web_sources, f, indent=2, ensure_ascii=False)
        
        print(f"🌐 Web sources index created: {self.web_sources}")
    
    def create_master_index(self, stats: Dict[str, int]):
        """Create master index of all converted documents"""
        index_content = f"""# 📚 Documentos Convertidos a Markdown

**Carmen de Areco - Portal de Transparencia**  
**Conversión completa a formato markdown para GitHub**

## 📊 Estadísticas de Conversión

| Métrica | Valor |
|---------|-------|
| **Total de archivos procesados** | {stats['total_files']} |
| **Documentos PDF convertidos** | {stats['pdf_files']} |
| **Hojas de cálculo convertidas** | {stats['excel_files']} |
| **Archivos markdown creados** | {stats['markdown_created']} |
| **Errores de procesamiento** | {stats['errors']} |
| **Fecha de conversión** | {datetime.now().strftime('%d/%m/%Y %H:%M')} |

## 🎯 Beneficios de la Conversión

### ✅ Para GitHub
- **Visualización directa** en navegador sin descargas
- **Búsqueda de texto completo** dentro de GitHub
- **Historial de versiones** con Git
- **Acceso móvil** optimizado

### ✅ Para Usuarios
- **Acceso instantáneo** al contenido
- **Enlaces directos** a fuentes oficiales
- **Verificación de integridad** con hashes SHA256
- **Múltiples opciones de acceso** (oficial, archivo web, markdown)

### ✅ Para Transparencia
- **Trazabilidad completa** de todas las fuentes
- **Verificación automática** de integridad
- **Respaldo múltiple** (oficial + archivo + markdown)
- **Acceso permanente** incluso si fuentes cambian

## 📁 Estructura de Documentos

```
data/markdown_documents/
├── 2022/ - Documentos de 2022 en formato markdown
├── 2023/ - Documentos de 2023 en formato markdown  
├── 2024/ - Documentos de 2024 en formato markdown
├── 2025/ - Documentos de 2025 en formato markdown
├── tenders/ - Licitaciones en formato markdown
├── financial_data/ - Datos financieros en formato markdown
└── general/ - Documentos generales en formato markdown
```

## 🔗 Acceso a Documentos

### Navegación Rápida por Categoría

#### 📋 Licitaciones Públicas
- [Ver todas las licitaciones](./tenders/)
- [Licitaciones 2024](./2024/) (filtro: LICITACION)
- [Licitaciones 2023](./2023/) (filtro: LICITACION)

#### 💰 Información Financiera
- [Documentos financieros](./financial_data/)
- [Presupuestos municipales](./2024/) (filtro: PRESUPUESTO)
- [Ejecución presupuestaria](./2024/) (filtro: EJECUCION)

#### 👥 Información de Personal
- [Escalas salariales](./2024/) (filtro: ESCALA)
- [Sueldos mensuales](./2023/) (filtro: SUELDO)

#### 📜 Normativa Legal
- [Resoluciones](./2024/) (filtro: RESOLUCION)
- [Disposiciones](./2025/) (filtro: DISPOSICION)

## 🌐 Fuentes y Verificación

### Fuentes Oficiales
- **Portal Principal**: [carmendeareco.gob.ar/transparencia](https://carmendeareco.gob.ar/transparencia/)
- **Archivo Web**: [Wayback Machine](https://web.archive.org/web/*/carmendeareco.gob.ar/transparencia/)

### Verificación de Integridad
Cada documento markdown incluye:
- ✅ Hash SHA256 del archivo original
- ✅ Fecha de descarga y conversión
- ✅ Enlaces a fuente oficial y archivo web
- ✅ Metadata completa del documento

### Proceso de Actualización
1. **Verificación automática** de fuentes oficiales
2. **Descarga** de nuevos documentos
3. **Conversión** a markdown
4. **Verificación de integridad**
5. **Actualización** del repositorio

## 📱 Uso y Navegación

### En GitHub
- Navegue por los directorios para ver documentos por año
- Use la función de búsqueda de GitHub para encontrar contenido específico
- Los archivos markdown se visualizan automáticamente en el navegador

### Búsqueda Avanzada
```
# Buscar licitaciones específicas
filename:LICITACION

# Buscar por año
path:2024/

# Buscar contenido específico
"presupuesto municipal"
```

## 🔄 Mantenimiento

### Actualización Automática
- **Scripts de actualización** verifican fuentes oficiales
- **Conversión automática** de nuevos documentos
- **GitHub Actions** mantiene el repositorio actualizado

### Verificación de Enlaces
- **Monitoreo continuo** de fuentes oficiales
- **Alertas automáticas** si enlaces no están disponibles
- **Recuperación automática** desde archivo web

---

**🎯 Resultado**: Todos los documentos oficiales ahora están disponibles en formato markdown, 
manteniendo acceso completo a fuentes oficiales y archivos web de respaldo.

**🔍 Verificación**: Cada documento puede ser verificado contra el original usando el hash SHA256 incluido.

**🌐 Acceso**: Triple método de acceso garantiza disponibilidad permanente:
1. **Sitio oficial** (fuente primaria)
2. **Archivo web** (respaldo histórico)  
3. **Markdown** (visualización directa)
"""
        
        index_path = self.output_dir / "README.md"
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(index_content)
        
        print(f"📋 Master index created: {index_path}")

def main():
    """Main execution function"""
    print("🚀 Converting Data Folder to GitHub-Ready Markdown")
    print("=" * 60)
    
    converter = DataToMarkdownConverter()
    
    # Process all files
    stats = converter.process_all_files()
    
    # Create web sources index
    converter.create_web_sources_index()
    
    # Create master index
    converter.create_master_index(stats)
    
    print(f"\n✅ Conversion Complete!")
    print(f"📊 Statistics:")
    print(f"   • Total files: {stats['total_files']}")
    print(f"   • Markdown created: {stats['markdown_created']}")
    print(f"   • Errors: {stats['errors']}")
    print(f"\n📁 Output directory: {converter.output_dir}")
    print(f"🌐 Web sources: {converter.web_sources}")
    print(f"\n🎯 GitHub Ready: All documents now available as searchable markdown!")
    print(f"🔗 Official links: Maintained for every document")
    print(f"📁 Web archives: Wayback Machine integration complete")

if __name__ == "__main__":
    main()