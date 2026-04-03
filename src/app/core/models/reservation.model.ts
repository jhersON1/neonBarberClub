/**
 * Payload sent to POST /reservations to create a new booking.
 * Every field is required by the backend.
 */
export interface CreateReservationRequest {
  readonly serviceId: string;
  readonly barberId: string;
  /** ISO date string in YYYY-MM-DD format. */
  readonly date: string;
  /** Time string in HH:mm format (24 h). */
  readonly time: string;
  readonly clientName: string;
  readonly clientPhone: string;
}

/**
 * Read-only view-model used by the confirmation step
 * to display a human-readable summary before submitting.
 */
export interface BookingSummary {
  readonly serviceName: string;
  readonly servicePrice: number;
  readonly serviceDuration: number;
  readonly barberName: string;
  /** ISO date string in YYYY-MM-DD format. */
  readonly date: string;
  /** Time string in HH:mm format (24 h). */
  readonly time: string;
}
