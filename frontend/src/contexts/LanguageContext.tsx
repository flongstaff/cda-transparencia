import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type Language = 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary - Only Spanish Argentina for now
const translations: Record<Language, Record<string, string>> = {
  es: {
    // Home page
    'home.title': 'Portal de Transparencia Financiera',
    'home.description': 'Acceda a información pública sobre presupuestos, gastos, ingresos y procesos de contratación de la Municipalidad de Carmen de Areco.',
    'home.budget.title': 'Presupuesto Municipal',
    'home.budget.description': 'Distribución y ejecución del presupuesto municipal por áreas',
    'home.spending.title': 'Gastos Públicos',
    'home.spending.description': 'Registros detallados de los gastos realizados por la municipalidad',
    'home.revenue.title': 'Ingresos Municipales',
    'home.revenue.description': 'Fuentes y distribución de los ingresos públicos',
    'home.contracts.title': 'Contratos y Licitaciones',
    'home.contracts.description': 'Información sobre procesos de contratación y licitaciones',
    'home.database.title': 'Base de Datos Pública',
    'home.database.description': 'Consulta expedientes, licitaciones y documentación legal',
    'home.reports.title': 'Informes y Auditorías',
    'home.reports.description': 'Reportes financieros e informes de auditoría',
    'home.explore.title': 'Explore nuestros servicios',
    'home.explore.description': 'Acceda a información pública financiera organizada por categorías',
    'home.updates.title': 'Actualizaciones Recientes',
    'home.updates.description': 'Últimas actualizaciones de información pública',
    'home.whistleblower.title': '¿Detectó irregularidades?',
    'home.whistleblower.description': 'Cualquier ciudadano puede reportar posibles casos de corrupción o uso indebido de fondos públicos a través de nuestro sistema anónimo.',
    'home.whistleblower.button': 'Realizar Denuncia',
    'home.budget.button': 'Ver Presupuesto',
    'home.database.button': 'Consultar Base de Datos',
    'home.viewMore': 'Ver más',
    
    // Header
    'header.title': 'Portal de Transparencia',
    'header.subtitle': 'Municipalidad de Carmen de Areco',
    'header.search.placeholder': 'Buscar información, expedientes, licitaciones...',
    'header.search.mobile': 'Buscar...',
    'header.theme.light': 'Cambiar a modo claro',
    'header.theme.dark': 'Cambiar a modo oscuro',
    'header.nav.home': 'Inicio',
    'header.nav.about': 'Acerca de',
    'header.nav.transparency': 'Transparencia',
    'header.nav.reports': 'Informes',
    'header.nav.contact': 'Contacto',
    
    // Sidebar
    'sidebar.menu': 'Menú',
    'sidebar.home': 'Inicio',
    'sidebar.about': 'Acerca de',
    'sidebar.dashboard': 'Panel Financiero',
    'sidebar.budget': 'Presupuesto',
    'sidebar.spending': 'Gastos Públicos',
    'sidebar.revenue': 'Ingresos',
    'sidebar.contracts': 'Contratos',
    'sidebar.debt': 'Deuda',
    'sidebar.investments': 'Inversiones',
    'sidebar.treasury': 'Tesorería',
    'sidebar.property': 'Declaraciones Patrimoniales',
    'sidebar.salaries': 'Salarios',
    'sidebar.database': 'Base de Datos',
    'sidebar.documents': 'Documentos',
    'sidebar.reports': 'Informes',
    'sidebar.contact': 'Contacto',
    'sidebar.whistleblower': 'Denuncias',
    'sidebar.audit': 'Auditoría',
    'sidebar.apiExplorer': 'Explorador de API',
    'sidebar.language': 'Idioma',
    'sidebar.theme': 'Tema',
    
    // Footer
    'footer.copyright': '© 2025 Portal de Transparencia de Carmen de Areco. Todos los derechos reservados.',
    'footer.accessibility': 'Accesibilidad',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Uso',
    
    // Pages
    'page.budget.title': 'Presupuesto Municipal',
    'page.spending.title': 'Gastos Públicos',
    'page.revenue.title': 'Ingresos Municipales',
    'page.contracts.title': 'Contratos y Licitaciones',
    'page.database.title': 'Base de Datos Pública',
    'page.reports.title': 'Informes y Auditorías',
    'page.whistleblower.title': 'Sistema de Denuncias',
    
    // About page
    'about.title': 'Acerca del Portal de Transparencia',
    'about.introduction': 'El Portal de Transparencia Financiera de Carmen de Areco es una plataforma digital que permite a los ciudadanos acceder de forma fácil y gratuita a información financiera y administrativa del municipio.',
    'about.mission.title': 'Nuestra Misión',
    'about.mission.description': 'Promover la transparencia y rendición de cuentas en la gestión pública municipal mediante el acceso abierto a la información, fortaleciendo así la participación ciudadana y la democracia local.',
    'about.transparency.title': 'Compromiso con la Transparencia',
    'about.transparency.description': 'Creemos firmemente que la transparencia es un pilar fundamental de una gestión pública eficiente y democrática. Este portal busca acercar a los ciudadanos toda la información relevante sobre la administración municipal.',
    'about.commitment.title': 'Compromiso con la Ciudadanía',
    'about.commitment.description': 'Nos comprometemos a mantener actualizada y accesible la información financiera y administrativa del municipio, garantizando el derecho de los ciudadanos a conocer cómo se gestiona lo público.',
    'about.data.title': 'Datos Publicados',
    'about.data.description': 'En este portal encontrarás información actualizada sobre:',
    'about.data.point1': 'Presupuesto municipal y su ejecución',
    'about.data.point2': 'Gastos e ingresos públicos',
    'about.data.point3': 'Contratos y licitaciones',
    'about.data.point4': 'Documentación administrativa relevante',
    'about.team.title': 'Nuestro Equipo',
    'about.team.member1.name': 'Juan Pérez',
    'about.team.member1.role': 'Director de Transparencia',
    'about.team.member1.description': 'Especialista en gestión pública y transparencia administrativa',
    'about.team.member2.name': 'María Sánchez',
    'about.team.member2.role': 'Coordinadora de Datos',
    'about.team.member2.description': 'Experta en análisis de datos y visualización de información',
    'about.team.member3.name': 'Tomás Romero',
    'about.team.member3.role': 'Desarrollador Web',
    'about.team.member3.description': 'Ingeniero informático especializado en aplicaciones web',
    
    // Contact page
    'contact.title': 'Contacto',
    'contact.description': '¿Tiene preguntas, sugerencias o necesita ayuda? Póngase en contacto con nosotros.',
    'contact.info.title': 'Información de Contacto',
    'contact.info.address.title': 'Dirección',
    'contact.info.address.value': 'Municipalidad de Carmen de Areco\nAv. 25 de Mayo 123\nCarmen de Areco, Buenos Aires',
    'contact.info.phone.title': 'Teléfono',
    'contact.info.phone.value': '+54 2323 456789',
    'contact.info.email.title': 'Correo Electrónico',
    'contact.info.email.value': 'transparencia@carmendeareco.gob.ar',
    'contact.info.hours.title': 'Horario de Atención',
    'contact.info.hours.value': 'Lunes a Viernes: 8:00 AM - 4:00 PM',
    'contact.follow.title': 'Síganos',
    'contact.form.title': 'Enviar un Mensaje',
    'contact.form.name': 'Nombre',
    'contact.form.email': 'Correo Electrónico',
    'contact.form.subject': 'Asunto',
    'contact.form.message': 'Mensaje',
    'contact.form.send': 'Enviar Mensaje',
    'contact.form.success': '¡Mensaje enviado con éxito! Nos pondremos en contacto con usted pronto.',
  }
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Always default to Spanish Argentina
    return 'es';
  });

  // We don't need to save the language preference since we're only supporting Spanish Argentina

  const setLanguage = (newLanguage: Language) => {
    // We don't allow changing the language since we're only supporting Spanish Argentina
    console.warn('Language change is not supported. This portal only supports Spanish Argentina.');
  };

  const t = (key: string): string => {
    return translations.es[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'es', setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};