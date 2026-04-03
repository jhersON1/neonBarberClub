/** Firestore server-side timestamp representation. */
export interface FirestoreTimestamp {
  readonly _seconds: number;
  readonly _nanoseconds: number;
}

/** Represents a barber service offered by Neon Barber Club. */
export interface BarberService {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly durationInMinutes: number;
  readonly isActive: boolean;
  readonly createdAt: FirestoreTimestamp;
}
