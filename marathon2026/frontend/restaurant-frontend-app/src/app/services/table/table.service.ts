import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Table } from '@app/models/tables/table.model';
import { catchError, from, map, mergeMap, Observable, of, switchMap, toArray } from 'rxjs';
import { TableFilter } from '@app/models/tables/table-filter.model';
import { revertFormatTime } from '@app/shared/helpers/date-helpers';
import { TimeRange } from '@app/models/tables/time-range.model';
import { ReservationCustomer } from '@app/models/reservations/reservation.model';
import { MOCK_LOCATIONS } from '@app/services/locations/locations.mock';
import { SKIP_ERROR_TOAST } from '@app/auth/skip-error-toast.context';

const TIME_SLOTS_CONCURRENCY = 6;
const MOCK_TABLE_CAPACITIES = [2, 4, 4];
const MOCK_FIRST_SLOT_MINUTES = 10 * 60;
const MOCK_LAST_SLOT_MINUTES = 20 * 60 + 30;
const MOCK_SLOT_STEP_MINUTES = 30;
const MOCK_RESERVATION_DURATION_MINUTES = 90;

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private readonly baseUrl = inject(API_BASE_URL);
  private http: HttpClient = inject(HttpClient);
  private readonly useMockData =
    !this.baseUrl.trim() || this.baseUrl.toLowerCase().includes('example.com');

  getAvailableTablesWithTimeSlots$(filter: TableFilter): Observable<Table[]> {
    if (this.useMockData) {
      return of(this.createMockTables(filter, true));
    }

    return this.getAvailableTables$(filter).pipe(
      switchMap((tables) => {
        if (tables.length === 0) {
          return of<Table[]>([]);
        }

        return from(tables).pipe(
          mergeMap(
            (table, index) => {
              const timeSlots = table.id.startsWith('demo-table-')
                ? of(this.createMockTimeRanges(filter))
                : this.getTableTimeSlots(table.id, filter.date!, filter.time!).pipe(
                catchError((error: unknown) => {
                  console.warn(`Unable to load time slots for table ${table.id}; using demo slots.`, error);
                  return of(this.createMockTimeRanges(filter));
                }),
              );
              return timeSlots.pipe(
                map((timeRanges) => ({ index, table: { ...table, timeRanges: timeRanges ?? [] } }))
              );
            },
            TIME_SLOTS_CONCURRENCY
          ),
          toArray(),
          map((results) =>
            results.sort((left, right) => left.index - right.index).map((result) => result.table)
          )
        );
      })
    );
  }

  getAvailableTables$(filter: TableFilter): Observable<Table[]> {
    if (this.useMockData) {
      return of(this.createMockTables(filter, true));
    }

    const url = `${this.baseUrl}/available-tables`;

    const params: Record<string, string> = {
      startTime: revertFormatTime(filter.time!, filter.date!),
      capacity: filter.guests!.toString(),
    };

    if (filter.location) {
      params['locationId'] = filter.location.toString();
    }

    return this.http
      .get<Table[]>(url, { params, context: this.silentErrorContext() })
      .pipe(
        catchError((error: unknown) => {
          console.warn('Unable to load available tables; using demo data.', error);
          return of(this.createMockTables(filter, true));
        })
      );
  }

  getTableTimeSlots(tableId: string, date: string, time: string): Observable<TimeRange[]> {
    const url = `${this.baseUrl}/tables/${tableId}/available-time-slots`;
    const params = {
      startTime: revertFormatTime(time, date),
    };

    return this.http.get<TimeRange[]>(url, {
      params,
      context: this.silentErrorContext(),
    });
  }

  getAvailableTablesWithoutStartTime$(filter: TableFilter): Observable<Table[]> {
    if (this.useMockData) {
      return of(this.createMockTables(filter, false));
    }

    const url = `${this.baseUrl}/available-tables`;

    const params = {
      locationId: filter.location!.toString(),
      capacity: filter.guests!.toString(),
    };

    return this.http
      .get<Table[]>(url, { params, context: this.silentErrorContext() })
      .pipe(
        catchError((error: unknown) => {
          console.warn('Unable to load tables; using demo data.', error);
          return of(this.createMockTables(filter, false));
        })
      );
  }

  changeReservationTable$(reservationId: string, tableId: string): Observable<ReservationCustomer> {
    const url = `${this.baseUrl}/reservations/${reservationId}/table`;
    return this.http.patch<ReservationCustomer>(url, { tableId });
  }

  private createMockTables(filter: TableFilter, includeTimeRanges: boolean): Table[] {
    const matchingLocations = filter.location
      ? MOCK_LOCATIONS.filter((location) => location.id === filter.location)
      : MOCK_LOCATIONS;
    const locations = matchingLocations.length > 0 ? matchingLocations : MOCK_LOCATIONS.slice(0, 1);

    return locations.flatMap((location, locationIndex) =>
      MOCK_TABLE_CAPACITIES.flatMap((capacity, tableIndex) =>
        capacity >= (filter.guests ?? 1)
          ? [{
              id: `demo-table-${locationIndex + 1}-${tableIndex + 1}`,
              tableNumber: tableIndex + 1,
              locationId: location.id,
              capacity,
              timeRanges:
                includeTimeRanges && filter.date && filter.time
                  ? this.createMockTimeRanges(filter)
                  : [],
            }]
          : []
      )
    );
  }

  private createMockTimeRanges(filter: TableFilter): TimeRange[] {
    if (!filter.date || !filter.time) {
      return [];
    }

    const firstRequestedSlot = new Date(revertFormatTime(filter.time, filter.date));
    const ranges: TimeRange[] = [];

    for (
      let slot = new Date(firstRequestedSlot);
      slot.getHours() * 60 + slot.getMinutes() <= MOCK_LAST_SLOT_MINUTES;
      slot.setMinutes(slot.getMinutes() + MOCK_SLOT_STEP_MINUTES)
    ) {
      const startMinutes = slot.getHours() * 60 + slot.getMinutes();
      if (startMinutes < MOCK_FIRST_SLOT_MINUTES) {
        continue;
      }

      const end = new Date(slot);
      end.setMinutes(end.getMinutes() + MOCK_RESERVATION_DURATION_MINUTES);
      ranges.push({ start: slot.toISOString(), end: end.toISOString() });
    }

    return ranges;
  }

  private silentErrorContext(): HttpContext {
    return new HttpContext().set(SKIP_ERROR_TOAST, true);
  }
}
