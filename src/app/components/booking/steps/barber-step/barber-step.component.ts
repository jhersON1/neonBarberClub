import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UpperCasePipe } from '@angular/common';

import { Barber } from '../../../../core/models';

/**
 * Step 2 – Displays active barbers so the client can choose a stylist.
 * Purely presentational; all data flows through inputs/outputs.
 */
@Component({
  selector: 'app-barber-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe],
  templateUrl: './barber-step.component.html',
})
export class BarberStepComponent {
  /** Full list of active barbers fetched by the parent. */
  readonly barbers = input.required<Barber[]>();

  /** Whether the parent is still loading barbers from the API. */
  readonly isLoading = input(false);

  /** Error message when barber loading fails (null = no error). */
  readonly error = input<string | null>(null);

  /** The currently selected barber (null = none). */
  readonly selectedBarber = input<Barber | null>(null);

  /** Fires when the user picks a barber card. */
  readonly barberSelected = output<Barber>();

  /** Fires when the user wants to retry after a load error. */
  readonly retryRequested = output<void>();

  /** Handles barber card click. */
  onSelect(barber: Barber): void {
    this.barberSelected.emit(barber);
  }
}
