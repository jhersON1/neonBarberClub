import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BUSINESS_CONFIG, BUSINESS_LINKS } from '../../core/config/business.config';

interface FrequentlyAskedQuestion {
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'app-local-info',
  templateUrl: './local-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalInfoComponent {
  readonly business = BUSINESS_CONFIG;
  readonly links = BUSINESS_LINKS;

  readonly questions: readonly FrequentlyAskedQuestion[] = [
    {
      question: '¿Dónde queda Neon Barber Club?',
      answer:
        'Estamos sobre la avenida principal del Plan 3 Mil, en Santa Cruz de la Sierra. Puedes abrir la ubicación exacta en Google Maps desde esta página.',
    },
    {
      question: '¿Qué servicios ofrece la barbería?',
      answer:
        'Realizamos cortes de cabello para hombre, arreglo de barba y perfilado de cejas. Los servicios, precios y duraciones vigentes se muestran en la sección Servicios.',
    },
    {
      question: '¿Cómo reservo una cita?',
      answer:
        'Elige el servicio, selecciona a tu barbero, escoge una fecha y un horario disponible y confirma tus datos. La pre-reserva se valida enviando el comprobante del adelanto por WhatsApp.',
    },
    {
      question: '¿Cuál es el horario de atención?',
      answer:
        'Atendemos lunes, martes y de jueves a domingo, de 10:00 a 19:00. Los miércoles la barbería permanece cerrada.',
    },
    {
      question: '¿Cuánto se paga para confirmar la reserva?',
      answer: `El adelanto actual es de ${BUSINESS_CONFIG.booking.depositAmountBob} Bs. Después de crear la pre-reserva verás el QR y el acceso directo a WhatsApp para enviar el comprobante.`,
    },
  ];
}
