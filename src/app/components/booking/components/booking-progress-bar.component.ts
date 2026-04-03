import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Wizard step descriptor used internally by the progress bar. */
interface WizardStep {
  readonly number: number;
  readonly label: string;
}

/** Steps displayed in the booking progress bar (UI text in Spanish). */
const WIZARD_STEPS: readonly WizardStep[] = [
  { number: 1, label: 'SERVICIO' },
  { number: 2, label: 'BARBERO' },
  { number: 3, label: 'FECHA' },
  { number: 4, label: 'CONFIRMAR' },
];

/**
 * Horizontal stepper that visually indicates the current booking step.
 * Pure presentational component – receives the active step via input.
 */
@Component({
  selector: 'app-booking-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Progreso de reserva" class="flex items-center justify-between max-w-md mx-auto mb-10 sm:mb-12">
      @for (step of steps; track step.number; let last = $last) {
        <div class="flex items-center" [class.flex-1]="!last">
          <!-- Step circle -->
          <div class="flex flex-col items-center gap-1.5">
            <div
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
              [class.bg-black]="step.number <= currentStep()"
              [class.text-white]="step.number <= currentStep()"
              [class.border]="step.number > currentStep()"
              [class.border-gray-300]="step.number > currentStep()"
              [class.text-gray-400]="step.number > currentStep()"
            >
              @if (step.number < currentStep()) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              } @else {
                {{ step.number }}
              }
            </div>
            <span
              class="text-[10px] sm:text-xs tracking-wider transition-colors duration-300 whitespace-nowrap"
              [class.text-black]="step.number <= currentStep()"
              [class.font-medium]="step.number === currentStep()"
              [class.text-gray-400]="step.number > currentStep()"
            >{{ step.label }}</span>
          </div>

          <!-- Connector line -->
          @if (!last) {
            <div class="flex-1 h-px mx-2 sm:mx-3 transition-colors duration-300"
              [class.bg-black]="step.number < currentStep()"
              [class.bg-gray-200]="step.number >= currentStep()"
            ></div>
          }
        </div>
      }
    </nav>
  `,
})
export class BookingProgressBarComponent {
  /** The currently active wizard step (1-based). */
  readonly currentStep = input.required<number>();

  /** Exposed to the template for iteration. */
  readonly steps = WIZARD_STEPS;
}
