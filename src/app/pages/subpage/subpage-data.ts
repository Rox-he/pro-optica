import { SubpageData } from './subpage.component';

// Contenido de las páginas independientes de cada dropdown del navbar.
// Cada una es una ruta real (no un simple anchor) para que sean indexables,
// compartibles y bookmarkeables por separado.

export const SUBPAGES: Record<string, SubpageData> = {

  // ===== SERVICIOS =====
  'examen-visual': {
    eyebrow: 'Servicios', titulo: 'Examen visual computarizado',
    resumen: 'Un diagnóstico completo de tu salud ocular en menos de 30 minutos, con equipo de última generación operado por optometristas certificados.',
    icono: `<svg viewBox="0 0 40 40" width="32"><ellipse cx="20" cy="20" rx="18" ry="11" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`,
    puntos: [
      'Medición de agudeza visual y graduación exacta',
      'Evaluación de salud ocular (presión, retina, córnea)',
      'Resultados explicados en el momento, sin tecnicismos',
      'Duración aproximada: 25-30 minutos',
    ],
    ctaTexto: 'Agendar examen visual', ctaLink: '/contacto',
    volverLink: '/servicios', volverTexto: 'Volver a Servicios',
  },
  'mantenimiento': {
    eyebrow: 'Servicios', titulo: 'Mantenimiento y ajuste',
    resumen: 'Limpieza profesional, ajuste de armazón y cambio de micas sin costo adicional para clientes de Óptica Convicción.',
    icono: `<svg viewBox="0 0 40 40" width="32"><path d="M8 32 L14 18 L20 26 L26 14 L34 32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    puntos: [
      'Limpieza ultrasónica de armazón y micas',
      'Ajuste de varillas y plaquetas nasales',
      'Cambio de birlos y soldadura menor',
      'Servicio gratuito de por vida en compras con nosotros',
    ],
    ctaTexto: 'Agendar mantenimiento', ctaLink: '/contacto',
    volverLink: '/servicios', volverTexto: 'Volver a Servicios',
  },
  'venta-de-lentes': {
    eyebrow: 'Servicios', titulo: 'Venta de lentes',
    resumen: 'Armazones de diseñador y lentes de contacto de la más alta calidad óptica, con más de 20 marcas nacionales e internacionales.',
    icono: `<svg viewBox="0 0 40 40" width="32"><rect x="3" y="12" width="14" height="16" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="23" y="12" width="14" height="16" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/><line x1="17" y1="20" x2="23" y2="20" stroke="currentColor" stroke-width="2.5"/></svg>`,
    puntos: [
      'Micas con filtro de luz azul y antirreflejante',
      'Armazones para niños, adultos y personas mayores',
      'Lentes de contacto diarios, mensuales y de color',
      'Planes de pago a 3 y 6 meses sin intereses',
    ],
    ctaTexto: 'Ver catálogo de lentes', ctaLink: '/productos',
    volverLink: '/servicios', volverTexto: 'Volver a Servicios',
  },
  'atencion-especializada': {
    eyebrow: 'Servicios', titulo: 'Atención especializada',
    resumen: 'Optometristas certificados y asesoría personalizada para casos específicos: niños, adultos mayores y pacientes con condiciones visuales particulares.',
    icono: `<svg viewBox="0 0 40 40" width="32"><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M14 20a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="20" cy="17" r="1.6" fill="currentColor"/></svg>`,
    puntos: [
      'Atención visual pediátrica desde los 3 años',
      'Seguimiento de baja visión y adultos mayores',
      'Asesoría de imagen para elegir el armazón ideal',
      'Citas de seguimiento sin costo durante el primer año',
    ],
    ctaTexto: 'Solicitar asesoría', ctaLink: '/contacto',
    volverLink: '/servicios', volverTexto: 'Volver a Servicios',
  },

  
  
  
};
