#!/usr/bin/env python3
"""
FOIA Request Automation System
Automates Freedom of Information Act requests for missing transparency data
Based on Law 27.275 (Ley de Acceso a la Información Pública)
"""

import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import requests
from dataclasses import dataclass, asdict
import uuid

@dataclass
class FOIARequest:
    """Data class for FOIA requests"""
    request_id: str
    subject: str
    requester_name: str
    requester_email: str
    requester_organization: str
    target_entity: str
    target_contact: str
    legal_basis: str
    information_requested: str
    justification: str
    urgency_level: str
    date_submitted: str
    follow_up_date: str
    status: str = "draft"
    response_received: bool = False
    documents_received: List[str] = None

    def __post_init__(self):
        if self.documents_received is None:
            self.documents_received = []

class FOIAAutomationSystem:
    def __init__(self):
        self.requests_dir = Path("data/foia_requests")
        self.requests_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Legal framework configuration
        self.legal_framework = self._setup_legal_framework()
        
        # Request templates
        self.templates = self._setup_request_templates()
        
        # Missing data inventory for Carmen de Areco
        self.missing_data_inventory = self._setup_missing_data_inventory()
        
    def _setup_legal_framework(self):
        """Setup Argentine legal framework for transparency requests"""
        return {
            "primary_law": {
                "name": "Ley 27.275 - Derecho de Acceso a la Información Pública",
                "url": "http://servicios.infoleg.gob.ar/infolegInternet/anexos/265000-269999/265949/norma.htm",
                "key_articles": {
                    "article_2": "Derecho de acceso a la información pública",
                    "article_5": "Información que debe ser pública de oficio",
                    "article_11": "Plazos para la respuesta",
                    "article_13": "Prórroga del plazo"
                },
                "response_timeframes": {
                    "standard": "15 días hábiles",
                    "extension": "15 días hábiles adicionales",
                    "complex_cases": "hasta 30 días hábiles"
                }
            },
            "municipal_regulations": {
                "buenos_aires_province": {
                    "transparency_law": "Ley Provincial de Transparencia",
                    "municipal_organic_law": "Ley Orgánica Municipal",
                    "reporting_requirements": [
                        "Presupuesto anual",
                        "Ejecución presupuestaria trimestral",
                        "Contratos y licitaciones",
                        "Declaraciones juradas patrimoniales"
                    ]
                }
            },
            "enforcement_mechanisms": {
                "administrative_appeals": "Agencia de Acceso a la Información Pública (AAIP)",
                "judicial_appeals": "Fuero contencioso administrativo",
                "citizen_complaints": "Defensoría del Pueblo"
            }
        }
    
    def _setup_request_templates(self):
        """Setup standardized request templates"""
        return {
            "formal_request": {
                "subject_template": "Solicitud de Acceso a la Información Pública - {specific_subject}",
                "body_template": """
Estimados Señores:

Me dirijo a Ustedes en mi carácter de {requester_title}, con domicilio en {requester_address}, documento de identidad N° {requester_id}, al amparo de la Ley N° 27.275 de Derecho de Acceso a la Información Pública, para solicitar formalmente el acceso a la siguiente información:

INFORMACIÓN SOLICITADA:
{information_requested}

FUNDAMENTACIÓN LEGAL:
La presente solicitud se basa en:
- Ley N° 27.275 de Derecho de Acceso a la Información Pública (Artículos 2° y 5°)
- {additional_legal_basis}

JUSTIFICACIÓN:
{justification}

URGENCIA:
{urgency_justification}

FORMA DE ENTREGA SOLICITADA:
- Formato digital (PDF, Excel, CSV) cuando sea posible
- Copia en papel en caso de documentos no digitalizados
- Acceso para consulta en las oficinas municipales

De conformidad con el artículo 11 de la Ley 27.275, aguardo la respuesta en el plazo de 15 días hábiles. En caso de requerir prórroga, solicito se fundamente debidamente conforme al artículo 13 de la mencionada ley.

Saludo a Ustedes atentamente.

{requester_signature}
{requester_name}
{requester_title}
{contact_information}
                """
            },
            "follow_up": {
                "subject_template": "Seguimiento Solicitud de Información Pública - Expediente {request_id}",
                "body_template": """
Estimados Señores:

Me dirijo a Ustedes en relación a la solicitud de acceso a la información pública presentada en fecha {original_date}, registrada bajo número/expediente {request_id}.

Habiendo transcurrido el plazo legal de 15 días hábiles establecido en el artículo 11 de la Ley 27.275 sin haber recibido respuesta, solicito:

1. Información sobre el estado de tramitación de mi solicitud
2. Fecha estimada de respuesta
3. En su caso, los motivos de la demora

Recuerdo que el silencio administrativo está expresamente prohibido por el artículo 8° de la Ley 27.275, y que el incumplimiento constituye falta grave según el artículo 31.

Aguardo respuesta inmediata.

Atentamente,

{requester_signature}
                """
            },
            "appeal": {
                "subject_template": "Recurso por denegatoria/silencio - Solicitud {request_id}",
                "body_template": """
A la Agencia de Acceso a la Información Pública (AAIP):

Vengo a interponer formal RECURSO contra la denegatoria tácita/expresa de la solicitud de información pública presentada ante {target_entity} en fecha {original_date}.

ANTECEDENTES:
{case_background}

FUNDAMENTOS DEL RECURSO:
{appeal_grounds}

PETITORIO:
Solicito que se ordene al organismo requerido la entrega de la información solicitada, bajo apercibimiento de las sanciones correspondientes.

{requester_signature}
                """
            }
        }
    
    def _setup_missing_data_inventory(self):
        """Setup inventory of missing data for Carmen de Areco"""
        return {
            "2018_missing_data": {
                "budget_documents": [
                    "Presupuesto General 2018",
                    "Ejecución Presupuestaria Trimestral 2018",
                    "Balance General Ejercicio 2018",
                    "Cuenta de Ahorro, Inversión y Financiamiento 2018"
                ],
                "contracts_tenders": [
                    "Registro de Licitaciones Públicas 2018",
                    "Contratos firmados durante 2018",
                    "Adjudicaciones directas 2018",
                    "Modificaciones contractuales 2018"
                ],
                "salary_information": [
                    "Escalas salariales vigentes en 2018",
                    "Listado de personal municipal 2018",
                    "Horas extras pagadas en 2018",
                    "Bonificaciones y adicionales 2018"
                ],
                "asset_declarations": [
                    "Declaraciones juradas patrimoniales 2018",
                    "Régimen de incompatibilidades",
                    "Registro de conflictos de intereses"
                ],
                "regulatory_documents": [
                    "Ordenanzas sancionadas en 2018",
                    "Decretos del Ejecutivo Municipal 2018",
                    "Resoluciones administrativas 2018",
                    "Actas del Honorable Concejo Deliberante 2018"
                ]
            },
            "priority_levels": {
                "critical": ["Budget documents", "Major contracts >$100,000"],
                "high": ["Salary information", "Asset declarations"],
                "medium": ["All contracts", "Regulatory documents"],
                "low": ["Meeting minutes", "Administrative resolutions"]
            }
        }
    
    def create_foia_request(self, 
                          information_type: str,
                          specific_documents: List[str],
                          requester_info: Dict[str, str],
                          urgency_level: str = "medium") -> FOIARequest:
        """Create a formal FOIA request"""
        
        request_id = f"FOIA-CDA-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        
        # Build detailed information request
        info_requested = self._build_information_request(information_type, specific_documents)
        
        # Determine legal basis
        legal_basis = self._determine_legal_basis(information_type)
        
        # Create justification
        justification = self._create_justification(information_type, urgency_level)
        
        request = FOIARequest(
            request_id=request_id,
            subject=f"Solicitud de Información Pública - {information_type} - Carmen de Areco",
            requester_name=requester_info["name"],
            requester_email=requester_info["email"],
            requester_organization=requester_info.get("organization", "Ciudadano/Investigador"),
            target_entity="Municipalidad de Carmen de Areco",
            target_contact="transparencia@carmendeareco.gob.ar",
            legal_basis=legal_basis,
            information_requested=info_requested,
            justification=justification,
            urgency_level=urgency_level,
            date_submitted=datetime.now().isoformat(),
            follow_up_date=(datetime.now() + timedelta(days=15)).isoformat()
        )
        
        return request
    
    def _build_information_request(self, information_type: str, specific_documents: List[str]) -> str:
        """Build detailed information request text"""
        request_text = f"TIPO DE INFORMACIÓN: {information_type}\n\n"
        request_text += "DOCUMENTOS ESPECÍFICOS SOLICITADOS:\n"
        
        for i, doc in enumerate(specific_documents, 1):
            request_text += f"{i}. {doc}\n"
        
        request_text += "\nFORMATO SOLICITADO:\n"
        request_text += "- Formato digital (PDF original) cuando esté disponible\n"
        request_text += "- Formatos de datos abiertos (CSV, Excel) para información tabular\n"
        request_text += "- Metadatos asociados (fechas, versiones, responsables)\n\n"
        
        request_text += "PERÍODO TEMPORAL:\n"
        request_text += "- Año fiscal 2018 completo\n"
        request_text += "- Información complementaria de años adyacentes si es relevante\n"
        
        return request_text
    
    def _determine_legal_basis(self, information_type: str) -> str:
        """Determine specific legal basis for request"""
        legal_bases = {
            "2018_missing_data": [
                "Artículo 5° de la Ley 27.275 (información que debe ser pública de oficio)",
                "Artículo 2° de la Ley 27.275 (derecho de acceso)",
                "Ley Orgánica Municipal - obligaciones de publicidad",
                "Resoluciones del Tribunal de Cuentas sobre transparencia municipal"
            ]
        }
        
        return "\n".join([f"- {basis}" for basis in legal_bases.get(information_type, legal_bases["2018_missing_data"])])
    
    def _create_justification(self, information_type: str, urgency_level: str) -> str:
        """Create justification for the request"""
        base_justification = """
La información solicitada es esencial para:

1. TRANSPARENCIA GUBERNAMENTAL: Garantizar el cumplimiento de las obligaciones de transparencia activa establecidas por la normativa vigente.

2. CONTROL CIUDADANO: Permitir el ejercicio del control ciudadano sobre la gestión de recursos públicos, conforme al artículo 1° de la Ley 27.275.

3. INVESTIGACIÓN Y ANÁLISIS: Facilitar el análisis académico/periodístico sobre la evolución de las políticas públicas municipales.

4. DERECHO A LA INFORMACIÓN: Ejercer plenamente el derecho humano de acceso a la información pública reconocido por la jurisprudencia nacional e internacional.
        """
        
        urgency_justifications = {
            "critical": "\n5. URGENCIA CRÍTICA: La información es necesaria para investigación sobre posibles irregularidades o para cumplimiento de plazos judiciales/administrativos.",
            "high": "\n5. URGENCIA ALTA: La información es necesaria para análisis comparativo con ejercicios actuales y toma de decisiones ciudadanas.",
            "medium": "\n5. RELEVANCIA PÚBLICA: La información contribuye al fortalecimiento del sistema democrático y la transparencia institucional.",
            "low": ""
        }
        
        return base_justification + urgency_justifications.get(urgency_level, "")
    
    def format_request_email(self, request: FOIARequest) -> Dict[str, str]:
        """Format FOIA request as email"""
        template = self.templates["formal_request"]
        
        # Fill in template variables
        formatted_body = template["body_template"].format(
            requester_title=f"ciudadano/investigador representando a {request.requester_organization}",
            requester_address="[Domicilio del solicitante]",
            requester_id="[DNI del solicitante]",
            information_requested=request.information_requested,
            additional_legal_basis=request.legal_basis,
            justification=request.justification,
            urgency_justification=f"Nivel de urgencia: {request.urgency_level.upper()}",
            requester_signature="[Firma digital/manuscrita]",
            requester_name=request.requester_name,
            contact_information=f"Email: {request.requester_email}"
        )
        
        return {
            "subject": template["subject_template"].format(specific_subject=request.subject),
            "body": formatted_body,
            "to": request.target_contact,
            "from": request.requester_email
        }
    
    def generate_batch_requests_2018(self, requester_info: Dict[str, str]) -> List[FOIARequest]:
        """Generate batch of FOIA requests for all missing 2018 data"""
        self.logger.info("📝 Generating batch FOIA requests for missing 2018 data...")
        
        requests = []
        missing_data = self.missing_data_inventory["2018_missing_data"]
        
        for category, documents in missing_data.items():
            # Determine priority
            urgency = "high"
            if any(doc in str(documents) for doc in self.missing_data_inventory["priority_levels"]["critical"]):
                urgency = "critical"
            
            request = self.create_foia_request(
                information_type=f"2018_{category}",
                specific_documents=documents,
                requester_info=requester_info,
                urgency_level=urgency
            )
            
            requests.append(request)
            
        self.logger.info(f"✅ Generated {len(requests)} FOIA requests")
        return requests
    
    def save_request(self, request: FOIARequest):
        """Save FOIA request to file system"""
        request_file = self.requests_dir / f"{request.request_id}.json"
        
        with open(request_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(request), f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"💾 Saved request: {request_file}")
    
    def generate_request_documents(self, request: FOIARequest):
        """Generate formal documents for the request"""
        docs_dir = self.requests_dir / request.request_id
        docs_dir.mkdir(exist_ok=True)
        
        # Generate email content
        email_content = self.format_request_email(request)
        with open(docs_dir / "request_email.txt", 'w', encoding='utf-8') as f:
            f.write(f"To: {email_content['to']}\n")
            f.write(f"From: {email_content['from']}\n")
            f.write(f"Subject: {email_content['subject']}\n\n")
            f.write(email_content['body'])
        
        # Generate formal letter (for paper submission if needed)
        formal_letter = self._generate_formal_letter(request)
        with open(docs_dir / "formal_letter.txt", 'w', encoding='utf-8') as f:
            f.write(formal_letter)
        
        # Generate tracking sheet
        tracking_info = {
            "request_id": request.request_id,
            "submission_date": request.date_submitted,
            "legal_deadline": request.follow_up_date,
            "status": request.status,
            "follow_up_actions": [
                f"Envío inicial: {request.date_submitted}",
                f"Seguimiento programado: {request.follow_up_date}",
                "Recurso administrativo si no hay respuesta en 30 días",
                "Escalamiento a AAIP si persiste silencio administrativo"
            ]
        }
        
        with open(docs_dir / "tracking.json", 'w', encoding='utf-8') as f:
            json.dump(tracking_info, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"📄 Generated documents in: {docs_dir}")
    
    def _generate_formal_letter(self, request: FOIARequest) -> str:
        """Generate formal letter version of the request"""
        return f"""
SOLICITUD DE ACCESO A LA INFORMACIÓN PÚBLICA
Ley N° 27.275

Lugar y Fecha: Carmen de Areco, {datetime.now().strftime('%d de %B de %Y')}

A: {request.target_entity}
Ref: {request.request_id}

{self.format_request_email(request)['body']}

Nota: Esta solicitud también ha sido enviada por correo electrónico a {request.target_contact}
"""
    
    def create_monitoring_system(self):
        """Create system to monitor request status and automate follow-ups"""
        monitoring_config = {
            "check_frequency": "daily",
            "automated_actions": {
                "day_15": "send_followup_email",
                "day_30": "prepare_administrative_appeal", 
                "day_45": "escalate_to_aaip",
                "day_60": "consider_judicial_action"
            },
            "notification_channels": [
                "email_alerts",
                "dashboard_updates",
                "status_reports"
            ]
        }
        
        with open(self.requests_dir / "monitoring_config.json", 'w') as f:
            json.dump(monitoring_config, f, indent=2)
        
        return monitoring_config
    
    def generate_comprehensive_foia_campaign(self, requester_info: Dict[str, str]) -> Dict[str, Any]:
        """Generate comprehensive FOIA campaign for Carmen de Areco missing data"""
        self.logger.info("\n📋 GENERATING COMPREHENSIVE FOIA CAMPAIGN")
        self.logger.info("=" * 60)
        
        campaign_results = {
            "campaign_id": f"CDA-TRANSPARENCY-{datetime.now().strftime('%Y%m%d')}",
            "timestamp": datetime.now().isoformat(),
            "target_entity": "Carmen de Areco Municipality",
            "legal_framework": "Law 27.275",
            "requests_generated": [],
            "monitoring_setup": {},
            "estimated_timeline": {}
        }
        
        # Generate all requests
        requests = self.generate_batch_requests_2018(requester_info)
        
        for request in requests:
            # Save request
            self.save_request(request)
            
            # Generate documents
            self.generate_request_documents(request)
            
            campaign_results["requests_generated"].append({
                "request_id": request.request_id,
                "subject": request.subject,
                "urgency": request.urgency_level,
                "documents_path": str(self.requests_dir / request.request_id)
            })
        
        # Setup monitoring
        campaign_results["monitoring_setup"] = self.create_monitoring_system()
        
        # Calculate timeline
        campaign_results["estimated_timeline"] = {
            "immediate": "Submit all requests",
            "week_1": "Confirm receipt by municipality",
            "week_3": "Follow up on pending requests",
            "week_6": "File administrative appeals if needed",
            "week_10": "Escalate to AAIP if necessary"
        }
        
        # Generate campaign summary
        summary_report = self._generate_campaign_summary(campaign_results)
        
        with open(self.requests_dir / "campaign_summary.md", 'w', encoding='utf-8') as f:
            f.write(summary_report)
        
        self.logger.info(f"✅ Campaign generated with {len(requests)} requests")
        self.logger.info(f"📁 All files saved in: {self.requests_dir}")
        
        return campaign_results
    
    def _generate_campaign_summary(self, campaign_results: Dict[str, Any]) -> str:
        """Generate human-readable campaign summary"""
        return f"""
# CAMPAÑA FOIA - TRANSPARENCIA CARMEN DE ARECO

**ID de Campaña:** {campaign_results['campaign_id']}
**Fecha de Generación:** {datetime.now().strftime('%Y-%m-%d %H:%M')}

## OBJETIVO

Obtener información pública faltante del ejercicio 2018 de la Municipalidad de Carmen de Areco, conforme a la Ley 27.275 de Acceso a la Información Pública.

## SOLICITUDES GENERADAS

Total de solicitudes: **{len(campaign_results['requests_generated'])}**

### Por Nivel de Urgencia:
- 🔴 **Críticas:** Documentos presupuestarios principales
- 🟡 **Altas:** Información salarial y declaraciones juradas  
- 🟢 **Medias:** Contratos y documentos regulatorios

## CRONOGRAMA ESTIMADO

| Semana | Actividad |
|--------|-----------|
| 1 | Envío de todas las solicitudes |
| 2-3 | Seguimiento de confirmaciones de recibo |
| 4-5 | Evaluación de respuestas recibidas |
| 6-8 | Recursos administrativos si es necesario |
| 9-12 | Escalamiento a AAIP |

## MARCO LEGAL

- **Ley Principal:** 27.275 - Derecho de Acceso a la Información Pública
- **Plazos Legales:** 15 días hábiles (prorrogables 15 días más)
- **Recurso:** Agencia de Acceso a la Información Pública (AAIP)

## ARCHIVOS GENERADOS

Cada solicitud incluye:
- 📧 Texto del email formal
- 📄 Carta formal para presentación presencial
- 📊 Hoja de seguimiento con cronograma
- 📋 Datos estructurados en JSON

## PRÓXIMOS PASOS

1. **Revisar** todas las solicitudes generadas
2. **Personalizar** información del solicitante si es necesario
3. **Enviar** las solicitudes por email y/o presentación presencial
4. **Activar** sistema de monitoreo automático
5. **Documentar** todas las respuestas recibidas

---

🤖 *Generado por Sistema de Auditoría Carmen de Areco*

*Basado en mejores prácticas de transparencia y marco legal argentino*
"""

if __name__ == "__main__":
    # Example usage
    foia_system = FOIAAutomationSystem()
    
    # Sample requester information
    requester_info = {
        "name": "Sistema de Auditoría Transparencia",
        "email": "auditoria@transparencia-cda.org", 
        "organization": "Portal de Transparencia Carmen de Areco"
    }
    
    # Generate comprehensive campaign
    campaign_results = foia_system.generate_comprehensive_foia_campaign(requester_info)
    
    print(f"🎯 FOIA Campaign Generated Successfully!")
    print(f"📊 Requests Created: {len(campaign_results['requests_generated'])}")
    print(f"📁 Files Location: {foia_system.requests_dir}")
    print(f"📋 Next Steps: Review campaign_summary.md for detailed instructions")