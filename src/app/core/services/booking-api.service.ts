import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api.constants';
import { BarberService, Barber, CreateReservationRequest } from '../models';

/**
 * Handles every HTTP interaction with the Neon Barber Club backend.
 * Provided at root level so a single instance is shared app-wide.
 */
@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private servicesCache?: Observable<BarberService[]>;
  private barbersCache?: Observable<Barber[]>;

  /** Fetches the list of active barber services. */
  getActiveServices(forceRefresh = false): Observable<BarberService[]> {
    if (forceRefresh || !this.servicesCache) {
      this.servicesCache = this.http
        .get<BarberService[]>(API_ENDPOINTS.ACTIVE_SERVICES)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }

    return this.servicesCache;
  }

  /** Fetches the list of active barbers. */
  getActiveBarbers(forceRefresh = false): Observable<Barber[]> {
    if (forceRefresh || !this.barbersCache) {
      this.barbersCache = this.http
        .get<Barber[]>(API_ENDPOINTS.ACTIVE_BARBERS)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }

    return this.barbersCache;
  }

  /**
   * Fetches available time-slots for a given date, barber and service.
   * @param date  - ISO date string (YYYY-MM-DD).
   * @param barberId - Firestore document ID of the barber.
   * @param serviceId - Firestore document ID of the service.
   * @returns An observable emitting an array of "HH:mm" strings.
   */
  getAvailability(
    date: string,
    barberId: string,
    serviceId: string,
  ): Observable<string[]> {
    const params = new HttpParams()
      .set('date', date)
      .set('barberId', barberId)
      .set('serviceId', serviceId);

    return this.http.get<string[]>(API_ENDPOINTS.AVAILABILITY, { params });
  }

  /**
   * Sends a reservation request to the backend.
   * @param request - Complete reservation payload.
   */
  createReservation(request: CreateReservationRequest): Observable<unknown> {
    return this.http.post(API_ENDPOINTS.RESERVATIONS, request);
  }
}
