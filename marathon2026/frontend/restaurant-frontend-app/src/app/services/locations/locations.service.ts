import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { HttpClient, HttpContext } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import { LocationResponse } from '@app/models/locations/location-response.model';
import { MOCK_DISHES } from '@app/services/dishes/dishes.mock';
import { MOCK_LOCATIONS } from './locations.mock';
import { SKIP_ERROR_TOAST } from '@app/auth/skip-error-toast.context';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly http = inject(HttpClient);
  private readonly useMockData =
    !this.baseUrl.trim() || this.baseUrl.toLowerCase().includes('example.com');

  getLocations(): Observable<LocationResponse[]> {
    if (this.useMockData) {
      return of(MOCK_LOCATIONS);
    }

    return this.withFallback(
      this.http.get<LocationResponse[]>(`${this.baseUrl}/locations`, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      }),
      MOCK_LOCATIONS,
      'locations'
    );
  }

  getLocationById(id: string): Observable<LocationResponse> {
    const mockLocation = MOCK_LOCATIONS.find((location) => location.id === id) ?? MOCK_LOCATIONS[0];
    if (this.useMockData) {
      return of(mockLocation);
    }

    return this.withFallback(
      this.http.get<LocationResponse>(`${this.baseUrl}/locations/${id}`, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      }),
      mockLocation,
      'location details'
    );
  }

  getSpecialtyDishes(id: string): Observable<DishListResponse[]> {
    if (this.useMockData) {
      return of(MOCK_DISHES);
    }

    return this.withFallback(
      this.http.get<DishListResponse[]>(`${this.baseUrl}/locations/${id}/dishes`, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      }),
      MOCK_DISHES,
      'location dishes'
    );
  }

  private withFallback<T>(request: Observable<T>, fallback: T, resource: string): Observable<T> {
    return request.pipe(
      catchError((error: unknown) => {
        console.warn(`Unable to load ${resource} from the backend; using demo data.`, error);
        return of(fallback);
      })
    );
  }
}
