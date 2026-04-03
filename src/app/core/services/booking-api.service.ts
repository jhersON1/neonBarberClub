import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api.constants';
import { BarberService, Barber, CreateReservationRequest } from '../models';

/**
 * Handles every HTTP interaction with the Neon Barber Club backend.
 * Provided at root level so a single instance is shared app-wide.
 */
@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);

  /** Fetches the list of active barber services. */
  getActiveServices(): Observable<BarberService[]> {
    return this.http.get<BarberService[]>(API_ENDPOINTS.ACTIVE_SERVICES);
  }

  /** Fetches the list of active barbers. */
  getActiveBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(API_ENDPOINTS.ACTIVE_BARBERS);
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
