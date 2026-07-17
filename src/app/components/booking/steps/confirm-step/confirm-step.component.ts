import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { BookingSummary } from '../../../../core/models';

/** Spanish month names used to format the summary date. */
const MONTH_NAMES_ES: readonly string[] = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Spanish day-of-week names (Sunday = 0). */
const DAY_NAMES_ES: readonly string[] = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles',
  'Jueves', 'Viernes', 'Sábado',
];

/**
 * Step 4 – Displays a booking summary and collects client contact data.
 *
 * Uses Angular Reactive Forms for input validation.
 * Emitting `confirmed` signals the parent to POST the reservation.
 */
@Component({
  selector: 'app-confirm-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './confirm-step.component.html',
})
export class ConfirmStepComponent {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────
  /** Read-only summary of the booking built by the parent. */
  readonly summary = input.required<BookingSummary>();

  /** True while the parent is submitting the reservation. */
  readonly isSubmitting = input(false);

  /** Backend error message (null = no error). */
  readonly submitError = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────
  /** Fires with client data when the form is valid and the user confirms. */
  readonly confirmed = output<{ clientName: string; clientPhone: string }>();

  // ── Form ────────────────────────────────────────────────────────────
  readonly form = this.fb.nonNullable.group({
    clientName: ['', [Validators.required, Validators.pattern(/.*\S.*/), Validators.minLength(3)]],
    clientPhone: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    privacyConsent: [false, Validators.requiredTrue],
  });

  /** Shortcut for template access to the clientName control. */
  get nameCtrl() {
    return this.form.controls.clientName;
  }

  /** Shortcut for template access to the clientPhone control. */
  get phoneCtrl() {
    return this.form.controls.clientPhone;
  }

  get privacyCtrl() {
    return this.form.controls.privacyConsent;
  }

  // ── Computed ────────────────────────────────────────────────────────
  /** Human-readable date string, e.g. "Martes 15 de abril 2026". */
  readonly formattedDate = computed(() => {
    const iso = this.summary().date;
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayName = DAY_NAMES_ES[date.getDay()];
    const monthName = MONTH_NAMES_ES[date.getMonth()];
    return `${dayName} ${d} de ${monthName} ${y}`;
  });

  // ── Methods ─────────────────────────────────────────────────────────
  /** Submits the confirmation if the form is valid. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { clientName, clientPhone } = this.form.getRawValue();
    this.confirmed.emit({ clientName: clientName.trim(), clientPhone: clientPhone.trim() });
  }
}
