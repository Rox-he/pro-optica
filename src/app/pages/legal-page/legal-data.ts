import { LegalData } from './legal-page.component';

export const AVISO_PRIVACIDAD: LegalData = {
  titulo: 'Aviso de Privacidad',
  actualizado: 'Enero 2026',
  secciones: [
    { h: '1. Responsable de tus datos', p: 'Óptica Convicción, con domicilio en Av. Belén 802, Lomas de San Pedrito, Querétaro, es responsable del tratamiento de tus datos personales conforme a esta política.' },
    { h: '2. Datos que recabamos', p: 'Nombre, teléfono, correo electrónico y servicio de interés que proporcionas al llenar el formulario de contacto para agendar una cita.' },
    { h: '3. Finalidad', p: 'Tus datos se usan únicamente para contactarte, confirmar citas y darte seguimiento sobre el servicio solicitado.' },
    { h: '4. Derechos ARCO', p: 'Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos personales escribiendo a contacto@opticaconviccion.mx.' },
  ],
};

export const TERMINOS_CONDICIONES: LegalData = {
  titulo: 'Términos y Condiciones',
  actualizado: 'Enero 2026',
  secciones: [
    { h: '1. Uso del sitio', p: 'Este sitio web es informativo y permite agendar citas en las sucursales de Óptica Convicción. El uso del sitio implica la aceptación de estos términos.' },
    { h: '2. Citas y disponibilidad', p: 'Agendar una cita a través del formulario no garantiza disponibilidad inmediata; un asesor confirmará el horario por teléfono o correo.' },
    { h: '3. Precios', p: 'Los precios mostrados en el catálogo son referenciales y pueden variar según promociones vigentes en sucursal.' },
    { h: '4. Garantías', p: 'Los armazones cuentan con garantía de 1 año contra defectos de fabricación, válida únicamente presentando el comprobante de compra.' },
  ],
};
