import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
 }
})
export class BookingComponent {
  
  openWhatsApp(): void {
    const phoneNumber = '59177326305';
    const message = encodeURIComponent(
      '¡Hola! Me gustaría reservar una cita en Neon Barber Club. ' +
      'He visto la disponibilidad en su calendario. ' +
      'Por favor, confirmen la fecha y hora que mejor les convenga.'
    );
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  }
}
