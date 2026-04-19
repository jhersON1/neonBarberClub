import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';

/** Internal representation of a single calendar cell. */
interface CalendarDay {
  /** Day-of-month number (1–31). */
  readonly dayOfMonth: number;
  /** ISO date string (YYYY-MM-DD) for this cell. */
  readonly dateString: string;
  /** Whether the cell belongs to the currently viewed month. */
  readonly isCurrentMonth: boolean;
  /** Whether the date is strictly in the past (before today). */
  readonly isPast: boolean;
  /** Whether the date matches today. */
  readonly isToday: boolean;
  /** Whether the date is closed (Wednesday). */
  readonly isClosed: boolean;
}

/** Spanish month names for UI display. */
const MONTH_NAMES_ES: readonly string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Spanish abbreviated day names (Monday-first layout). */
const DAY_NAMES_ES: readonly string[] = [
  'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM',
];

/**
 * Step 3 – Month calendar + time-slot picker.
 *
 * The component owns its own month-navigation state but delegates
 * availability fetching and time-slot data entirely to the parent
 * via inputs and outputs.
 */
@Component({
  selector: 'app-calendar-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe],
  templateUrl: './calendar-step.component.html',
})
export class CalendarStepComponent {
  // ── Inputs ──────────────────────────────────────────────────────────
  /** Available time strings (e.g. ["09:00","09:30"]) returned by the API. */
  readonly availableSlots = input<string[]>([]);

  /** True while the parent is fetching availability from the backend. */
  readonly isLoadingSlots = input(false);

  /** The currently selected date in YYYY-MM-DD format (null = none). */
  readonly selectedDate = input<string | null>(null);

  /** The currently selected time in HH:mm format (null = none). */
  readonly selectedTime = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────
  /** Fires when the user clicks a calendar day. Payload is YYYY-MM-DD. */
  readonly dateChanged = output<string>();

  /** Fires when the user clicks a time-slot button. Payload is HH:mm. */
  readonly timeSelected = output<string>();

  // ── Internal state ──────────────────────────────────────────────────
  /** The month currently displayed in the calendar grid. */
  private readonly viewDate = signal(new Date());

  /** Spanish day-name headers. */
  readonly dayNames = DAY_NAMES_ES;

  /** Label for the month header, e.g. "Abril 2026". */
  readonly monthLabel = computed(
    () =>
      `${MONTH_NAMES_ES[this.viewDate().getMonth()]} ${this.viewDate().getFullYear()}`,
  );

  /** Whether the user can navigate to the previous month (not before current month). */
  readonly canGoPrevious = computed(() => {
    const now = new Date();
    const v = this.viewDate();
    return (
      v.getFullYear() > now.getFullYear() ||
      (v.getFullYear() === now.getFullYear() && v.getMonth() > now.getMonth())
    );
  });

  /** Full grid of CalendarDay objects (always a multiple of 7 for the grid). */
  readonly calendarDays = computed(() =>
    this.buildMonthGrid(this.viewDate().getFullYear(), this.viewDate().getMonth()),
  );

  // ── Public methods ──────────────────────────────────────────────────

  /** Navigates the calendar view to the previous month. */
  previousMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.viewDate.set(d);
  }

  /** Navigates the calendar view to the next month. */
  nextMonth(): void {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.viewDate.set(d);
  }

  /** Handles a day-cell click. */
  onDateClick(day: CalendarDay): void {
    if (!day.isCurrentMonth || day.isPast || day.isClosed) return;
    this.dateChanged.emit(day.dateString);
  }

  /** Handles a time-slot click. */
  onTimeClick(time: string): void {
    this.timeSelected.emit(time);
  }

  // ── Private helpers ─────────────────────────────────────────────────

  /**
   * Builds a flat array of CalendarDay cells for a given year/month,
   * padded so the array length is a multiple of 7.
   * Uses Monday-first week layout.
   */
  private buildMonthGrid(year: number, month: number): CalendarDay[] {
    const days: CalendarDay[] = [];
    // "tomorrow" is the first bookable day; today and earlier are non-selectable.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6  (JS getDay(): Sun=0 Mon=1 … Sat=6)
    let startOffset = firstOfMonth.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    // Padding from previous month
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLast - i);
      days.push(this.createDay(d, prevMonthLast - i, false, today, tomorrow));
    }

    // Current month
    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push(this.createDay(date, d, true, today, tomorrow));
    }

    // Padding for next month
    const remainder = days.length % 7;
    if (remainder > 0) {
      const needed = 7 - remainder;
      for (let d = 1; d <= needed; d++) {
        const date = new Date(year, month + 1, d);
        days.push(this.createDay(date, d, false, today, tomorrow));
      }
    }

    return days;
  }

  /** Creates a single CalendarDay object. */
  private createDay(
    date: Date,
    dayOfMonth: number,
    isCurrentMonth: boolean,
    today: Date,
    tomorrow: Date,
  ): CalendarDay {
    return {
      dayOfMonth,
      dateString: this.toISODate(date),
      isCurrentMonth,
      isPast: date.getTime() < tomorrow.getTime(),
      isToday: date.getTime() === today.getTime(),
      isClosed: date.getDay() === 3,
    };
  }

  /** Formats a Date to YYYY-MM-DD. */
  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
