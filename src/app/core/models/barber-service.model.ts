/** Firestore server-side timestamp representation. */
export interface FirestoreTimestamp {
  readonly _seconds: number;
  readonly _nanoseconds: number;
}

export interface CatalogItem {
  readonly name: string;
  readonly description?: string;
  readonly imgUrl?: string;
}

/** Represents a barber service offered by Neon Barber Club. */
export interface BarberService {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly durationInMinutes: number;
  readonly isActive: boolean;
  readonly catalog?: CatalogItem[];
  readonly mainImage?: string;
  readonly createdAt: FirestoreTimestamp;
}
