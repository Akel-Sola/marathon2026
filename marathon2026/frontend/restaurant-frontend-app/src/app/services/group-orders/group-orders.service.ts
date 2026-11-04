import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { SKIP_ERROR_TOAST } from '@app/auth/skip-error-toast.context';
import { GroupSessionsResponse } from '@app/models/group-orders/group-sessions-response.model';
import { GroupStatusResponse } from '@app/models/group-orders/group-status.model';
import { OwnerSessionResponse } from '@app/models/group-orders/owner-session.model';
import { SubmittedDish } from '@app/models/group-orders/submit-group-pre-order.model';

@Injectable({ providedIn: 'root' })
export class GroupOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getInviteToken$(reservationId: string): Observable<{ token: string }> {
    return this.http.get<{ token: string }>(
      `${this.baseUrl}/reservations/${reservationId}/invite-token`,
      { context: this.silentErrorContext() }
    );
  }

  getGroupByToken$(token: string): Observable<{ groupReservationId: string }> {
    return this.http.get<{ groupReservationId: string }>(
      `${this.baseUrl}/guest/invites/${token}`,
      { context: this.silentErrorContext() }
    );
  }

  getSessions$(groupId: string): Observable<GroupSessionsResponse> {
    return this.http.get<GroupSessionsResponse>(`${this.baseUrl}/guest/groups/${groupId}/sessions`, {
      context: this.silentErrorContext(),
    });
  }

  getStatus$(groupId: string): Observable<GroupStatusResponse> {
    return this.http.get<GroupStatusResponse>(`${this.baseUrl}/guest/groups/${groupId}/status`, {
      context: this.silentErrorContext(),
    });
  }

  getOwnerSessionId$(reservationId: string): Observable<OwnerSessionResponse> {
    return this.http.get<OwnerSessionResponse>(
      `${this.baseUrl}/reservations/${reservationId}/guest-session-id`,
      { context: this.silentErrorContext() }
    );
  }

  submit$(groupId: string, reservationId: string): Observable<SubmittedDish[]> {
    return this.http.post<SubmittedDish[]>(
      `${this.baseUrl}/group-reservations/${groupId}/submit`,
      { reservationId },
      { context: this.silentErrorContext() }
    );
  }

  removeSession$(groupId: string, guestSessionId: string): Observable<GroupSessionsResponse> {
    return this.http.delete<GroupSessionsResponse>(
      `${this.baseUrl}/guest/groups/${groupId}/sessions/${guestSessionId}`,
      { context: this.silentErrorContext() }
    );
  }

  private silentErrorContext(): HttpContext {
    return new HttpContext().set(SKIP_ERROR_TOAST, true);
  }
}
