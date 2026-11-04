import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { DishType } from '@app/models/enums/dish-type.model';
import { MOCK_DISHES } from './dishes.mock';
import { DishesService } from './dishes.service';

describe('DishesService', () => {
  let service: DishesService;
  let httpMock: HttpTestingController;

  function configure(baseUrl: string): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(DishesService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('uses the mock menu without making a request when BACKEND_URL is empty', () => {
    configure('');
    let result: typeof MOCK_DISHES = [];

    service.getDishes().subscribe((dishes) => (result = dishes));

    expect(result.length).toBe(MOCK_DISHES.length);
    httpMock.expectNone('dishes');
  });

  it('uses the mock menu without making a request when BACKEND_URL is example.com', () => {
    configure('https://example.com');
    let result: typeof MOCK_DISHES = [];

    service.getDishes(DishType.Dessert).subscribe((dishes) => (result = dishes));

    expect(result.length).toBe(2);
    expect(result.every((dish) => dish.dishType === DishType.Dessert)).toBeTrue();
    httpMock.expectNone('dishes');
  });

  it('falls back to filtered mock dishes when the backend request fails', () => {
    configure('https://api.test');
    spyOn(console, 'warn');
    let result: typeof MOCK_DISHES = [];

    service.getDishes(DishType.MainCourse, 'PriceAscending').subscribe((dishes) => {
      result = dishes;
    });
    const request = httpMock.expectOne(
      'https://api.test/dishes?dishType=MainCourse&sortBy=PriceAscending'
    );
    request.flush('Backend unavailable', { status: 503, statusText: 'Unavailable' });

    expect(result.length).toBe(2);
    expect(result[0].price).toBeLessThan(result[1].price);
    expect(result.every((dish) => dish.dishType === DishType.MainCourse)).toBeTrue();
    expect(console.warn).toHaveBeenCalled();
  });

  it('uses the configured backend when it is available', () => {
    configure('https://api.test');
    const backendDishes = [MOCK_DISHES[0]];
    let result: typeof MOCK_DISHES = [];

    service.getDishes().subscribe((dishes) => (result = dishes));
    httpMock.expectOne('https://api.test/dishes').flush(backendDishes);

    expect(result).toEqual(backendDishes);
  });
});
