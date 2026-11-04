import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { GroupSessionsResponse } from '@app/models/group-orders/group-sessions-response.model';
import { GroupStatusResponse } from '@app/models/group-orders/group-status.model';
import { OwnerSessionResponse } from '@app/models/group-orders/owner-session.model';
import { SubmittedDish } from '@app/models/group-orders/submit-group-pre-order.model';

@Injectable({ providedIn: 'root' })
export class GroupOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getInviteToken$(reservationId: string): Observable<{ token: string }> {
    return this.http.get<{ token: string }>(`${this.baseUrl}/reservations/${reservationId}/invite-token`);
  }

  getGroupByToken$(token: string): Observable<{ groupReservationId: string }> {
    return this.http.get<{ groupReservationId: string }>(`${this.baseUrl}/guest/invites/${token}`);
  }

  getSessions$(groupId: string): Observable<GroupSessionsResponse> {
    return this.http.get<GroupSessionsResponse>(`${this.baseUrl}/guest/groups/${groupId}/sessions`);
  }

  getStatus$(groupId: string): Observable<GroupStatusResponse> {
    return this.http.get<GroupStatusResponse>(`${this.baseUrl}/guest/groups/${groupId}/status`);
  }

  getOwnerSessionId$(reservationId: string): Observable<OwnerSessionResponse> {
    return this.http.get<OwnerSessionResponse>(`${this.baseUrl}/reservations/${reservationId}/guest-session-id`);
  }

  submit$(groupId: string, reservationId: string): Observable<SubmittedDish[]> {
    return this.http.post<SubmittedDish[]>(`${this.baseUrl}/group-reservations/${groupId}/submit`, { reservationId });
  }

  removeSession$(groupId: string, guestSessionId: string): Observable<GroupSessionsResponse> {
    return this.http.delete<GroupSessionsResponse>(`${this.baseUrl}/guest/groups/${groupId}/sessions/${guestSessionId}`);
  }
}
