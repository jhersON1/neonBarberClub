/** Base URL for the Neon Barber Club backend API. */
// export const API_BASE_URL =
//   'https://neonbarberclub-backend-990497964029.us-central1.run.app';
export const API_BASE_URL =
  'http://localhost:3000';

/**
 * Centralised map of every backend endpoint used by the application.
 * Kept as a frozen literal so TypeScript can narrow the values.
 */
export const API_ENDPOINTS = {
  /** Returns active barber services. GET → BarberService[] */
  ACTIVE_SERVICES: `${API_BASE_URL}/api/barber-services/active`,

  /** Returns active barbers. GET → Barber[] */
  ACTIVE_BARBERS: `${API_BASE_URL}/barbers/active`,

  /** Returns available time-slots. GET ?date&barberId&serviceId → string[] */
  AVAILABILITY: `${API_BASE_URL}/availability`,

  /** Creates a new reservation. POST → unknown */
  RESERVATIONS: `${API_BASE_URL}/reservations`,
} as const;
