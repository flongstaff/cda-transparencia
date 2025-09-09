// UI Strings Constants
export const STRINGS = {
  // Loading states
  loading: "Cargando análisis presupuestario...",
  loadingValidation: "Validando datos...",
  loadingTimeout: "La carga está tardando más de lo esperado.",
  
  // Error states
  errorLoad: "No se pudieron cargar los datos del presupuesto",
  errorFallback: "Mostrando datos en caché debido a problemas de conexión",
  errorTitle: "Error al cargar los datos",
  errorTimeout: "Tiempo de carga excedido",
  
  // Empty states
  noData: "Datos no disponibles",
  noConnection: "Sin conexión a datos",
  
  // Actions
  retry: "Reintentar",
  refresh: "Actualizar",
  
  // Chart labels
  chartTotal: "Presupuesto Total",
  chartCategories: "Categorías Presupuestarias",
  chartSourceOfficial: "Datos oficiales del municipio",
  chartSourceCategories: "Datos de categorías presupuestarias",
  
  // Validation
  validationSuccess: "Datos verificados",
  validationPending: "Verificación pendiente",
  
  // Data quality
  dataQualityHigh: "Alta Calidad",
  dataQualityMedium: "Calidad Media",
  dataQualityLow: "Calidad Básica",
  
  // Sources
  sourcePortal: "Portal de Transparencia - Carmen de Areco",
  sourceMunicipal: "Datos municipales oficiales",
  
  // Chart series
  seriesBudgeted: "Presupuestado",
  seriesExecuted: "Ejecutado",
  
  // Metadata
  metadataLastUpdated: "Última actualización",
  metadataSource: "Fuente",
  metadataQuality: "Calidad de datos",
  
  // Accessibility
  accessibilityLoading: "Cargando contenido...",
  accessibilityError: "Error en el contenido",
  accessibilityChart: "Gráfico de análisis presupuestario"
} as const;

export type StringKey = keyof typeof STRINGS;