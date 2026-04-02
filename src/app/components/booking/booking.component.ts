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
import { finalize } from 'rxjs';

import { BookingApiService } from '../../core/services/booking-api.service';
import { Barber, BarberService, BookingSummary, CreateReservationRequest } from '../../core/models';

import { BookingProgressBarComponent } from './components/booking-progress-bar.component';
import { ServiceStepComponent } from './steps/service-step/service-step.component';
import { BarberStepComponent } from './steps/barber-step/barber-step.component';
import { CalendarStepComponent } from './steps/calendar-step/calendar-step.component';
import { ConfirmStepComponent } from './steps/confirm-step/confirm-step.component';

/** Total number of interactive wizard steps (excludes the success screen). */
const TOTAL_STEPS = 4;

/**
 * Primary booking wizard component.
 *
 * Orchestrates the multi-step reservation flow:
 *   1. Service selection
 *   2. Barber selection
 *   3. Date & time selection
 *   4. Client data & confirmation
 *   5. Success screen (read-only)
 *
 * All backend communication is centralised here; child step components
 * are purely presentational.
 */
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
  private readonly api = inject(BookingApiService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Wizard navigation ───────────────────────────────────────────────
  /** Current wizard step (1-based). Step 5 = success screen. */
  readonly currentStep = signal(1);

  // ── API data ────────────────────────────────────────────────────────
  readonly services = signal<BarberService[]>([]);
  readonly barbers = signal<Barber[]>([]);
  readonly availableSlots = signal<string[]>([]);

  // ── Loading flags ───────────────────────────────────────────────────
  readonly isLoadingServices = signal(true);
  readonly isLoadingBarbers = signal(true);
  readonly isLoadingSlots = signal(false);
  readonly isSubmitting = signal(false);

  // ── Error messages ──────────────────────────────────────────────────
  readonly servicesError = signal<string | null>(null);
  readonly barbersError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);

  // ── User selections ─────────────────────────────────────────────────
  readonly selectedService = signal<BarberService | null>(null);
  readonly selectedBarber = signal<Barber | null>(null);
  readonly selectedDate = signal<string | null>(null);
  readonly selectedTime = signal<string | null>(null);

  // ── Computed state ──────────────────────────────────────────────────

  /** Whether the "SIGUIENTE" button should be enabled for the current step. */
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

  /** Read-only summary used by the confirmation step. */
  readonly bookingSummary = computed<BookingSummary>(() => ({
    serviceName: this.selectedService()?.name ?? '',
    servicePrice: this.selectedService()?.price ?? 0,
    serviceDuration: this.selectedService()?.durationInMinutes ?? 0,
    barberName: this.selectedBarber()?.name ?? '',
    date: this.selectedDate() ?? '',
    time: this.selectedTime() ?? '',
  }));

  // ── Lifecycle ───────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadServices();
    this.loadBarbers();
  }

  // ── Step navigation ─────────────────────────────────────────────────

  /** Advances to the next wizard step. */
  nextStep(): void {
    if (this.currentStep() < TOTAL_STEPS && this.canAdvance()) {
      this.currentStep.update((s) => s + 1);
    }
  }

  /** Returns to the previous wizard step, clearing downstream selections. */
  previousStep(): void {
    const step = this.currentStep();
    if (step <= 1) return;

    // Clear selections that depend on later steps to avoid stale data.
    if (step === 2) {
      this.clearFromBarber();
    } else if (step === 3) {
      this.clearFromDate();
    } else if (step === 4) {
      // Going back from confirm – keep date/time, user might just want to review.
    }

    this.currentStep.update((s) => s - 1);
  }

  // ── Step 1 handlers ─────────────────────────────────────────────────

  /** Stores the selected service. */
  onServiceSelected(service: BarberService): void {
    this.selectedService.set(service);
  }

  /** Reloads services after a network error. */
  retryLoadServices(): void {
    this.loadServices();
  }

  // ── Step 2 handlers ─────────────────────────────────────────────────

  /** Stores the selected barber and clears downstream selections. */
  onBarberSelected(barber: Barber): void {
    this.selectedBarber.set(barber);
    this.clearFromDate();
  }

  /** Reloads barbers after a network error. */
  retryLoadBarbers(): void {
    this.loadBarbers();
  }

  // ── Step 3 handlers ─────────────────────────────────────────────────

  /** Fetches availability when the user picks a calendar day. */
  onDateChanged(date: string): void {
    this.selectedDate.set(date);
    this.selectedTime.set(null);
    this.fetchAvailability(date);
  }

  /** Stores the selected time slot. */
  onTimeSelected(time: string): void {
    this.selectedTime.set(time);
  }

  // ── Step 4 handlers ─────────────────────────────────────────────────

  /** Creates the reservation via the backend. */
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

    this.api
      .createReservation(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => this.currentStep.set(5), // Success screen
        error: (err) => {
          if (err.status === 429) {
            this.submitError.set(
              'Demasiados intentos. Por favor espera unos minutos antes de intentar de nuevo.',
            );
          } else if (err.status === 409) {
            this.submitError.set(
              'Este horario acaba de ser reservado. Por favor vuelve atrás y elige otro.',
            );
          } else {
            this.submitError.set(
              'Ocurrió un error al procesar tu reserva. Intenta de nuevo.',
            );
          }
        },
      });
  }

  // ── Step 5 handler ──────────────────────────────────────────────────

  /** Resets the wizard to allow a new booking. */
  resetWizard(): void {
    this.selectedService.set(null);
    this.selectedBarber.set(null);
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.availableSlots.set([]);
    this.submitError.set(null);
    this.currentStep.set(1);
  }

  // ── Private helpers ─────────────────────────────────────────────────

  /** Loads active services from the backend. */
  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.servicesError.set(null);

    this.api
      .getActiveServices()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingServices.set(false)),
      )
      .subscribe({
        next: (data) => this.services.set(data),
        error: () =>
          this.servicesError.set('Error al cargar los servicios. Intenta de nuevo.'),
      });
  }

  /** Loads active barbers from the backend. */
  private loadBarbers(): void {
    this.isLoadingBarbers.set(true);
    this.barbersError.set(null);

    this.api
      .getActiveBarbers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingBarbers.set(false)),
      )
      .subscribe({
        next: (data) => this.barbers.set(data),
        error: () =>
          this.barbersError.set('Error al cargar los barberos. Intenta de nuevo.'),
      });
  }

  /** Fetches available time-slots for the selected date, barber and service. */
  private fetchAvailability(date: string): void {
    const service = this.selectedService();
    const barber = this.selectedBarber();
    if (!service || !barber) return;

    this.isLoadingSlots.set(true);
    this.availableSlots.set([]);

    this.api
      .getAvailability(date, barber.id, service.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingSlots.set(false)),
      )
      .subscribe({
        next: (slots) => this.availableSlots.set(slots),
        error: () => this.availableSlots.set([]),
      });
  }

  /** Clears barber and all downstream selections. */
  private clearFromBarber(): void {
    this.selectedBarber.set(null);
    this.clearFromDate();
  }

  /** Clears date, time and availability data. */
  private clearFromDate(): void {
    this.selectedDate.set(null);
    this.selectedTime.set(null);
    this.availableSlots.set([]);
  }
}
