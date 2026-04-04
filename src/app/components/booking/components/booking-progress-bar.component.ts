import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Wizard step descriptor used internally by the progress bar. */
interface WizardStep {
  readonly number: number;
  readonly label: string;
  readonly icon: string;
}

/** Steps displayed in the booking progress bar (UI text in Spanish). */
const WIZARD_STEPS: readonly WizardStep[] = [
  { number: 1, label: 'SERVICIO', icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z' },
  { number: 2, label: 'BARBERO', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { number: 3, label: 'FECHA', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
  { number: 4, label: 'CONFIRMAR', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

/**
 * Horizontal stepper that visually indicates the current booking step.
 * Pure presentational component – receives the active step via input.
 */
@Component({
  selector: 'app-booking-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Progreso de reserva" class="max-w-sm mx-auto mb-10 sm:mb-14">
      <!-- Step indicators -->
      <div class="flex items-center justify-between">
        @for (step of steps; track step.number; let last = $last) {
          <div class="flex items-center" [class.flex-1]="!last">
            <!-- Step dot -->
            <div class="flex flex-col items-center gap-2">
              <div
                class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-500 ease-out"
                [class.bg-black]="step.number <= currentStep()"
                [class.text-white]="step.number <= currentStep()"
                [class.shadow-md]="step.number === currentStep()"
                [class.bg-white]="step.number > currentStep()"
                [class.border]="step.number > currentStep()"
                [class.border-gray-200]="step.number > currentStep()"
                [class.text-gray-300]="step.number > currentStep()"
                [class.scale-110]="step.number === currentStep()"
              >
                @if (step.number < currentStep()) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="step.icon" />
                  </svg>
                }
              </div>
              <span
                class="text-[9px] sm:text-[10px] tracking-[0.12em] transition-all duration-300 whitespace-nowrap"
                [class.text-black]="step.number <= currentStep()"
                [class.font-semibold]="step.number === currentStep()"
                [class.font-medium]="step.number < currentStep()"
                [class.text-gray-300]="step.number > currentStep()"
              >{{ step.label }}</span>
            </div>

            <!-- Connector line -->
            @if (!last) {
              <div class="flex-1 h-[1.5px] mx-2 sm:mx-3 transition-all duration-500 ease-out rounded-full"
                [class.bg-black]="step.number < currentStep()"
                [class.bg-gray-200]="step.number >= currentStep()"
              ></div>
            }
          </div>
        }
      </div>
    </nav>
  `,
})
export class BookingProgressBarComponent {
  /** The currently active wizard step (1-based). */
  readonly currentStep = input.required<number>();

  /** Exposed to the template for iteration. */
  readonly steps = WIZARD_STEPS;
}
