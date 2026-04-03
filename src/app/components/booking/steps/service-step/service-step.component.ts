import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UpperCasePipe } from '@angular/common';

import { BarberService } from '../../../../core/models';

/**
 * Step 1 – Displays available barber services as selectable cards.
 * Emits the chosen service so the parent wizard can advance.
 */
@Component({
  selector: 'app-service-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe],
  templateUrl: './service-step.component.html',
})
export class ServiceStepComponent {
  /** Full list of active services fetched by the parent. */
  readonly services = input.required<BarberService[]>();

  /** Whether the parent is still loading services from the API. */
  readonly isLoading = input(false);

  /** Error message when service loading fails (null = no error). */
  readonly error = input<string | null>(null);

  /** The currently selected service (null = none). */
  readonly selectedService = input<BarberService | null>(null);

  /** Fires when the user picks a service card. */
  readonly serviceSelected = output<BarberService>();

  /** Fires when the user wants to retry after a load error. */
  readonly retryRequested = output<void>();

  /** Handles service card click. */
  onSelect(service: BarberService): void {
    this.serviceSelected.emit(service);
  }
}
