import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { LocationsService } from './locations.service';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { MOCK_LOCATIONS } from './locations.mock';
import { MOCK_DISHES } from '@app/services/dishes/dishes.mock';

describe('LocationsService', () => {
  let service: LocationsService;
  let httpMock: HttpTestingController;

  function configure(baseUrl: string): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
      ],
    });
    service = TestBed.inject(LocationsService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    configure('https://test.api');
    expect(service).toBeTruthy();
  });

  it('uses mock locations without a backend URL', () => {
    configure('');
    let result: typeof MOCK_LOCATIONS = [];

    service.getLocations().subscribe((locations) => (result = locations));

    expect(result).toEqual(MOCK_LOCATIONS);
    httpMock.expectNone('locations');
  });

  it('uses the backend response when the request succeeds', () => {
    configure('https://test.api');
    const backendLocations = [MOCK_LOCATIONS[0]];
    let result: typeof MOCK_LOCATIONS = [];

    service.getLocations().subscribe((locations) => (result = locations));
    httpMock.expectOne('https://test.api/locations').flush(backendLocations);

    expect(result).toEqual(backendLocations);
  });

  it('uses mock locations when the backend responds with an empty list', () => {
    configure('https://test.api');
    let result: typeof MOCK_LOCATIONS = [];

    service.getLocations().subscribe((locations) => (result = locations));
    httpMock.expectOne('https://test.api/locations').flush([]);

    expect(result).toEqual(MOCK_LOCATIONS);
  });

  it('falls back to mocks for HTTP and network errors', () => {
    configure('https://test.api');
    spyOn(console, 'warn');
    let locationResult: (typeof MOCK_LOCATIONS)[number] | undefined;
    let dishesResult: typeof MOCK_DISHES = [];

    service.getLocationById('demo-location-2').subscribe((location) => (locationResult = location));
    httpMock
      .expectOne('https://test.api/locations/demo-location-2')
      .flush('Not found', { status: 404, statusText: 'Not Found' });

    service.getSpecialtyDishes('demo-location-1').subscribe((dishes) => (dishesResult = dishes));
    httpMock
      .expectOne('https://test.api/locations/demo-location-1/dishes')
      .error(new ProgressEvent('error'));

    expect(locationResult).toEqual(MOCK_LOCATIONS[1]);
    expect(dishesResult).toEqual(MOCK_DISHES);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });
});
