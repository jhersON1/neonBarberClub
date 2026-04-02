import { FirestoreTimestamp } from './barber-service.model';

/** Working-hours schedule for a barber. */
export interface BarberSchedule {
  readonly startTime: string;
  readonly endTime: string;
  readonly lunchStart: string;
  readonly lunchEnd: string;
}

/** Represents a barber (stylist) at Neon Barber Club. */
export interface Barber {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly schedule: BarberSchedule;
  readonly createdAt: FirestoreTimestamp;
}
