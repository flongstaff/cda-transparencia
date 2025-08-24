import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type Language = 'es' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
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
    'sidebar.budget': 'Presupuesto',
    'sidebar.spending': 'Gastos Públicos',
    'sidebar.revenue': 'Ingresos',
    'sidebar.contracts': 'Contratos',
    'sidebar.database': 'Base de Datos',
    'sidebar.reports': 'Informes',
    'sidebar.contact': 'Contacto',
    'sidebar.whistleblower': 'Denuncias',
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
  },
  it: {
    // Home page
    'home.title': 'Portale di Trasparenza Finanziaria',
    'home.description': 'Accedi alle informazioni pubbliche su bilanci, spese, entrate e processi di appalto del Comune di Carmen de Areco.',
    'home.budget.title': 'Bilancio Comunale',
    'home.budget.description': 'Distribuzione ed esecuzione del bilancio comunale per settori',
    'home.spending.title': 'Spese Pubbliche',
    'home.spending.description': 'Registrazioni dettagliate delle spese effettuate dal comune',
    'home.revenue.title': 'Entrate Comunali',
    'home.revenue.description': 'Fonti e distribuzione delle entrate pubbliche',
    'home.contracts.title': 'Contratti e Gare d\'Appalto',
    'home.contracts.description': 'Informazioni sui processi di appalto e gare',
    'home.database.title': 'Banca Dati Pubblica',
    'home.database.description': 'Consulta atti, gare d\'appalto e documentazione legale',
    'home.reports.title': 'Rapporti e Audit',
    'home.reports.description': 'Rapporti finanziari e rapporti di audit',
    'home.explore.title': 'Esplora i nostri servizi',
    'home.explore.description': 'Accedi alle informazioni finanziarie pubbliche organizzate per categorie',
    'home.updates.title': 'Aggiornamenti Recenti',
    'home.updates.description': 'Ultimi aggiornamenti di informazioni pubbliche',
    'home.whistleblower.title': 'Hai rilevato irregolarità?',
    'home.whistleblower.description': 'Qualsiasi cittadino può segnalare possibili casi di corruzione o uso improprio di fondi pubblici attraverso il nostro sistema anonimo.',
    'home.whistleblower.button': 'Segnala una Violazione',
    'home.budget.button': 'Visualizza Bilancio',
    'home.database.button': 'Consulta Banca Dati',
    'home.viewMore': 'Vedi di più',
    
    // Header
    'header.title': 'Portale di Trasparenza',
    'header.subtitle': 'Comune di Carmen de Areco',
    'header.search.placeholder': 'Cerca informazioni, atti, gare d\'appalto...',
    'header.search.mobile': 'Cerca...',
    'header.theme.light': 'Passa alla modalità chiara',
    'header.theme.dark': 'Passa alla modalità scura',
    'header.nav.home': 'Home',
    'header.nav.about': 'Chi Siamo',
    'header.nav.transparency': 'Trasparenza',
    'header.nav.reports': 'Rapporti',
    'header.nav.contact': 'Contatti',
    
    // Sidebar
    'sidebar.menu': 'Menu',
    'sidebar.home': 'Home',
    'sidebar.about': 'Chi Siamo',
    'sidebar.budget': 'Bilancio',
    'sidebar.spending': 'Spese Pubbliche',
    'sidebar.revenue': 'Entrate',
    'sidebar.contracts': 'Contratti',
    'sidebar.database': 'Banca Dati',
    'sidebar.reports': 'Rapporti',
    'sidebar.contact': 'Contatti',
    'sidebar.whistleblower': 'Segnalazioni',
    'sidebar.language': 'Lingua',
    'sidebar.theme': 'Tema',
    
    // Footer
    'footer.copyright': '© 2025 Portale di Trasparenza di Carmen de Areco. Tutti i diritti riservati.',
    'footer.accessibility': 'Accessibilità',
    'footer.privacy': 'Informativa sulla Privacy',
    'footer.terms': 'Termini di Utilizzo',
    
    // Pages
    'page.budget.title': 'Bilancio Comunale',
    'page.spending.title': 'Spese Pubbliche',
    'page.revenue.title': 'Entrate Comunali',
    'page.contracts.title': 'Contratti e Gare d\'Appalto',
    'page.database.title': 'Banca Dati Pubblica',
    'page.reports.title': 'Rapporti e Audit',
    'page.whistleblower.title': 'Sistema di Segnalazione',
    
    // About page
    'about.title': 'Chi Siamo',
    'about.introduction': 'Il Portale di Trasparenza Finanziaria di Carmen de Areco è una piattaforma digitale che consente ai cittadini di accedere facilmente e gratuitamente alle informazioni finanziarie e amministrative del comune.',
    'about.mission.title': 'La Nostra Missione',
    'about.mission.description': 'Promuovere la trasparenza e la rendicontazione nella gestione pubblica comunale mediante l\'accesso aperto alle informazioni, rafforzando così la partecipazione dei cittadini e la democrazia locale.',
    'about.transparency.title': 'Impegno per la Trasparenza',
    'about.transparency.description': 'Crediamo fermamente che la trasparenza sia un pilastro fondamentale di una gestione pubblica efficiente e democratica. Questo portale mira a portare ai cittadini tutte le informazioni rilevanti sulla gestione comunale.',
    'about.commitment.title': 'Impegno verso i Cittadini',
    'about.commitment.description': 'Ci impegniamo a mantenere aggiornate e accessibili le informazioni finanziarie e amministrative del comune, garantendo il diritto dei cittadini di conoscere come viene gestito il pubblico.',
    'about.data.title': 'Dati Pubblicati',
    'about.data.description': 'In questo portale troverai informazioni aggiornate su:',
    'about.data.point1': 'Bilancio comunale ed esecuzione',
    'about.data.point2': 'Spese ed entrate pubbliche',
    'about.data.point3': 'Contratti e gare d\'appalto',
    'about.data.point4': 'Documentazione amministrativa rilevante',
    'about.team.title': 'Il Nostro Team',
    'about.team.member1.name': 'Juan Pérez',
    'about.team.member1.role': 'Direttore della Trasparenza',
    'about.team.member1.description': 'Specialista in gestione pubblica e trasparenza amministrativa',
    'about.team.member2.name': 'María Sánchez',
    'about.team.member2.role': 'Coordinatrice dei Dati',
    'about.team.member2.description': 'Esperta in analisi dei dati e visualizzazione delle informazioni',
    'about.team.member3.name': 'Tomás Romero',
    'about.team.member3.role': 'Sviluppatore Web',
    'about.team.member3.description': 'Ingegnere informatico specializzato in applicazioni web',
    
    // Contact page
    'contact.title': 'Contatti',
    'contact.description': 'Ha domande, suggerimenti o ha bisogno di aiuto? Contattaci.',
    'contact.info.title': 'Informazioni di Contatto',
    'contact.info.address.title': 'Indirizzo',
    'contact.info.address.value': 'Comune di Carmen de Areco\nAv. 25 de Mayo 123\nCarmen de Areco, Buenos Aires',
    'contact.info.phone.title': 'Telefono',
    'contact.info.phone.value': '+54 2323 456789',
    'contact.info.email.title': 'Email',
    'contact.info.email.value': 'transparencia@carmendeareco.gob.ar',
    'contact.info.hours.title': 'Orario di Apertura',
    'contact.info.hours.value': 'Lunedì - Venerdì: 8:00 - 16:00',
    'contact.follow.title': 'Seguici',
    'contact.form.title': 'Invia un Messaggio',
    'contact.form.name': 'Nome',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Oggetto',
    'contact.form.message': 'Messaggio',
    'contact.form.send': 'Invia Messaggio',
    'contact.form.success': 'Messaggio inviato con successo! Ti contatteremo al più presto.',
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
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};