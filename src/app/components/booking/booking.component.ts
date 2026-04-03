import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { BookingApiService } from '../../core/services/booking-api.service';
import { Barber, BarberService, BookingSummary, CreateReservationRequest } from '../../core/models';

import { BookingProgressBarComponent } from './components/booking-progress-bar.component';
import { ServiceStepComponent } from './steps/service-step/service-step.component';
import { BarberStepComponent } from './steps/barber-step/barber-step.component';
import { CalendarStepComponent } from './steps/calendar-step/calendar-step.component';
import { ConfirmStepComponent } from './steps/confirm-step/confirm-step.component';

const TOTAL_STEPS = 4;

@Component({
  selector: 'app-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BookingProgressBarComponent,
    ServiceStepComponent,
    BarberStepComponent,
    CalendarStepComponent,
    ConfirmStepComponent,
  ],
  templateUrl: './booking.component.html',
  host: {
    class: 'block w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8',
  },
})
export class BookingComponent implements OnInit {
  private readonly bookingService = inject(BookingApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly calendarBaseUrl = 'https://calendar.google.com/calendar/embed?src=4029010d62b455a6c54464f935e4c2abb45a5b3880a88512197b77aa474af2e0%40group.calendar.google.com&ctz=America%2FLa_Paz&mode=WEEK&showTitle=0&showPrint=0&hl=es&showTabs=0&showCalendars=0&showTz=0';

  readonly calendarSrc = signal<SafeResourceUrl>(
    this.sanitizer.bypassSecurityTrustResourceUrl(this.calendarBaseUrl)
  );

  readonly currentStep = signal(1);

  readonly services = signal<BarberService[]>([]);
  readonly barbers = signal<Barber[]>([]);
  readonly availableSlots = signal<string[]>([]);

  readonly isLoadingServices = signal(true);
  readonly isLoadingBarbers = signal(true);
  readonly isLoadingSlots = signal(false);
  readonly isSubmitting = signal(false);

  readonly servicesError = signal<string | null>(null);
  readonly barbersError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);

  readonly selectedService = signal<BarberService | null>(null);
  readonly selectedBarber = signal<Barber | null>(null);
  readonly selectedDate = signal<string | null>(null);
  readonly selectedTime = signal<string | null>(null);

  readonly canAdvance = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return this.selectedService() !== null;
      case 2:
        return this.selectedBarber() !== null;
      case 3:
        return this.selectedDate() !== null && this.selectedTime() !== null;
      default:
        return false;
    }
  });

  readonly bookingSummary = computed<BookingSummary>(() => ({
    serviceName: this.selectedService()?.name ?? '',
    servicePrice: this.selectedService()?.price ?? 0,
    serviceDuration: this.selectedService()?.durationInMinutes ?? 0,
    barberName: this.selectedBarber()?.name ?? '',
    date: this.selectedDate() ?? '',
    time: this.selectedTime() ?? '',
  }));

  /**
   * Initializes the component by loading the active services and barbers.
   */
  ngOnInit(): void {
    this.loadServices();
    this.loadBarbers();
  }

  /**
   * Advances the wizard to the next step if the current step requirements are met.
   */
  nextStep(): void {
    if (this.currentStep() < TOTAL_STEPS && this.canAdvance()) {
      this.currentStep.update((currentStepIndex) => currentStepIndex + 1);
    }
  }

  /**
   * Returns to the previous wizard step and clears downstream selections to prevent stale data.
   */
  previousStep(): void {
    const step = this.currentStep();
    if (step <= 1) return;

    if (step === 2) {
      this.clearFromBarber();
    } else if (step === 3) {
      this.clearFromDate();
    }

    this.currentStep.update((currentStepIndex) => currentStepIndex - 1);
  }

  /**
   * Stores the selected service from step 1.
   * @param service The barber service selected.
   */
  onServiceSelected(service: BarberService): void {
    this.selectedService.set(service);
  }

  /**
   * Retries loading the active services if a network error occurs.
   */
  retryLoadServices(): void {
    this.loadServices();
  }

  /**
   * Stores the selected barber in step 2 and clears subsequent calendar selections.
   * @param barber The barber selected.
   */
  onBarberSelected(barber: Barber): void {
    this.selectedBarber.set(barber);
    this.clearFromDate();
  }

  /**
   * Retries loading the active barbers if a network error occurs.
   */
  retryLoadBarbers(): void {
    this.loadBarbers();
  }

  /**
   * Handles date selection in step 3. Fetches available time slots for the chosen date.
   * @param date The ISO format date string selected by the user.
   */
  onDateChanged(date: string): void {
    if (date === this.selectedDate()) return;

    this.selectedDate.set(date);
    this.selectedTime.set(null);
    this.fetchAvailability(date);
  }

  /**
   * Stores the selected time slot in step 3.
   * @param time The time string selected by the user.
   */
  onTimeSelected(time: string): void {
    this.selectedTime.set(time);
  }

  /**
   * Submits the reservation data to the backend. Updates the wizard to the success step upon completion.
   * @param clientData The client's full name and phone number from the confirmation form.
   */
  onConfirmed(clientData: { clientName: string; clientPhone: string }): void {
    const service = this.selectedService();
    const barber = this.selectedBarber();
    const date = this.selectedDate();
    const time = this.selectedTime();

    if (!service || !barber || !date || !time) return;

    const payload: CreateReservationRequest = {
      serviceId: service.id,
      barberId: barber.id,
      date,
      time,
      clientName: clientData.clientName,
      clientPhone: clientData.clientPhone,
    };

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.bookingService
      .createReservation(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.currentStep.set(5);
          this.calendarSrc.set(
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this.calendarBaseUrl}&bypassCache=${Date.now()}`)
          );
        },
        error: (httpError) => {
          if (httpError.status === 429) {
            this.submitError.set(
              'Too many attempts. Please wait a few minutes before trying again.',
            );
          } else if (httpError.status === 409) {
            this.submitError.set(
              'This time slot has just been reserved. Please go back and choose another one.',
            );
          } else {
            this.submitError.set(
              'An error occurred while processing your reservation. Please try again.',
            );
          }
        },
      });
  }

  /**
   * Resets the entire wizard state to allow the user to make a new reservation.
   */
  resetWizard(): void {
    this.selectedService.set(null);
    this.selectedBarber.set(null);
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.availableSlots.set([]);
    this.submitError.set(null);
    this.currentStep.set(1);
  }

  /**
   * Fetches active services from the backend.
   */
  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.servicesError.set(null);

    this.bookingService
      .getActiveServices()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingServices.set(false)),
      )
      .subscribe({
        next: (availableServices) => this.services.set(availableServices),
        error: () =>
          this.servicesError.set('Error loading services. Please try again.'),
      });
  }

  /**
   * Fetches active barbers from the backend.
   */
  private loadBarbers(): void {
    this.isLoadingBarbers.set(true);
    this.barbersError.set(null);

    this.bookingService
      .getActiveBarbers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingBarbers.set(false)),
      )
      .subscribe({
        next: (availableBarbers) => this.barbers.set(availableBarbers),
        error: () =>
          this.barbersError.set('Error loading barbers. Please try again.'),
      });
  }

  /**
   * Fetches the available time slots for a specific date, barber, and service.
   * @param date The ISO format date string for which to fetch availability.
   */
  private fetchAvailability(date: string): void {
    const service = this.selectedService();
    const barber = this.selectedBarber();
    if (!service || !barber) return;

    this.isLoadingSlots.set(true);
    this.availableSlots.set([]);

    this.bookingService
      .getAvailability(date, barber.id, service.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingSlots.set(false)),
      )
      .subscribe({
        next: (availableTimeSlots) => this.availableSlots.set(availableTimeSlots),
        error: () => this.availableSlots.set([]),
      });
  }

  /**
   * Clears the selected barber and any dependent state (date, time, slots).
   */
  private clearFromBarber(): void {
    this.selectedBarber.set(null);
    this.clearFromDate();
  }

  /**
   * Clears the selected date, time, and available slots.
   */
  private clearFromDate(): void {
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.availableSlots.set([]);
  }
}
