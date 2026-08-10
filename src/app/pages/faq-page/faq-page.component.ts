import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

interface FaqItem { pregunta: string; respuesta: string; abierta: boolean; }

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.css'
})
export class FaqPageComponent {
  preguntas: FaqItem[] = [
    { pregunta: '¿Necesito cita previa para el examen visual?', respuesta: 'No es obligatorio, pero te recomendamos agendar para evitar tiempos de espera. Puedes hacerlo desde la sección de Contacto.', abierta: false },
    { pregunta: '¿Cuánto tarda en estar listo mi armazón con graduación?', respuesta: 'En la mayoría de los casos, entre 2 y 4 días hábiles, dependiendo del tipo de mica solicitada.', abierta: false },
    { pregunta: '¿Tienen planes de pago?', respuesta: 'Sí, ofrecemos planes a 3 y 6 meses sin intereses con tarjetas participantes.', abierta: false },
    { pregunta: '¿El mantenimiento de mis lentes tiene costo?', respuesta: 'No, la limpieza y ajuste de armazón es gratuita de por vida para clientes de Óptica Convicción.', abierta: false },
    { pregunta: '¿Puedo ir a cualquiera de las 2 sucursales indistintamente?', respuesta: 'Sí, ambas sucursales (Lomas de San Pedrito y Nacional) ofrecen el mismo catálogo y nivel de atención.', abierta: false },
  ];

  toggle(item: FaqItem) { item.abierta = !item.abierta; }
}
