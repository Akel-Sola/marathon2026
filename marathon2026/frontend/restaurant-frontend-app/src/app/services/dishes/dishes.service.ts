import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { DishListResponse } from '@app/models/dishes/dish-list-response.model';
import { catchError, Observable, of } from 'rxjs';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { DishSort } from '@app/models/enums/dish-sort.model';
import { MOCK_DISHES } from './dishes.mock';
import { SKIP_ERROR_TOAST } from '@app/auth/skip-error-toast.context';

@Injectable({ providedIn: 'root' })
export class DishesService {
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly http = inject(HttpClient);
  private readonly useMockData =
    !this.baseUrl.trim() || this.baseUrl.toLowerCase().includes('example.com');

  getPopularDishes(): Observable<DishListResponse[]> {
    const popularDishes = MOCK_DISHES.slice(0, 4);
    if (this.useMockData) {
      return of(popularDishes);
    }

    return this.http
      .get<DishListResponse[]>(`${this.baseUrl}/dishes/popular`, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      })
      .pipe(catchError((error: unknown) => this.useFallback(error, popularDishes)));
  }

  // /dishes
  // /dishes?dishType=MainCourse&sortBy=PriceDescending&name=Spaghetti
  getDishes(dishType?: string, sortBy?: string, name?: string): Observable<DishListResponse[]> {
    let params = new HttpParams();

    if (dishType) {
      params = params.set('dishType', dishType);
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    if (name) {
      params = params.set('name', name);
    }

    const mockDishes = this.getMockDishes(dishType, sortBy, name);
    if (this.useMockData) {
      return of(mockDishes);
    }

    return this.http
      .get<DishListResponse[]>(`${this.baseUrl}/dishes`, {
        params,
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      })
      .pipe(catchError((error: unknown) => this.useFallback(error, mockDishes)));
  }

  private getMockDishes(dishType?: string, sortBy?: string, name?: string): DishListResponse[] {
    const searchTerm = name?.toLowerCase();
    const dishes = MOCK_DISHES.filter(
      (dish) =>
        (!dishType || dish.dishType === dishType) &&
        (!searchTerm || dish.name.toLowerCase().includes(searchTerm))
    );

    switch (sortBy) {
      case DishSort.PriceAscending:
        return dishes.sort((a, b) => a.price - b.price);
      case DishSort.PriceDescending:
        return dishes.sort((a, b) => b.price - a.price);
      case DishSort.PopularityAscending:
        return dishes.reverse();
      default:
        return dishes;
    }
  }

  private useFallback(
    error: unknown,
    fallback: DishListResponse[]
  ): Observable<DishListResponse[]> {
    console.warn('Unable to load dishes from the backend; using the demo menu.', error);
    return of(fallback);
  }
}
