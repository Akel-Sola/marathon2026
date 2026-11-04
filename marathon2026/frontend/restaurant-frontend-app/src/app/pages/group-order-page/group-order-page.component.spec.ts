import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Participant } from '@app/models/group-orders/participant.model';
import { GroupOrdersService } from '@app/services/group-orders/group-orders.service';
import { GroupOrderPageComponent } from './group-order-page.component';

describe('GroupOrderPageComponent', () => {
  let fixture: ComponentFixture<GroupOrderPageComponent>;
  let element: HTMLElement;
  let service: jasmine.SpyObj<GroupOrdersService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<GroupOrdersService>('GroupOrdersService', [
      'getInviteToken$',
      'getGroupByToken$',
      'getOwnerSessionId$',
      'getSessions$',
      'getStatus$',
      'submit$',
    ]);

    const participants: Participant[] = [
      {
        id: 'guest-session-1',
        type: 'Guest',
        name: 'Alex',
        items: [{ dish: { id: 'dish-1', name: 'Khachapuri', price: 18 }, quantity: 2 }],
        total: 36,
        isSubmitted: true,
      },
    ];
    service.getInviteToken$.and.returnValue(of({ token: 'invite-token' }));
    service.getGroupByToken$.and.returnValue(of({ groupReservationId: 'group-1' }));
    service.getOwnerSessionId$.and.returnValue(of({ guestSessionId: 'owner-session' }));
    service.getSessions$.and.returnValue(of({ participants, total: 36 }));
    service.getStatus$.and.returnValue(
      of({ currentParticipants: 2, maxCapacity: 4, status: 'Open' })
    );

    await TestBed.configureTestingModule({
      imports: [GroupOrderPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'reservation-1' } } },
        },
        { provide: GroupOrdersService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupOrderPageComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('shows each guest dish and its quantity and line total to the reservation owner', () => {
    expect(element.textContent).toContain('Alex');
    expect(element.textContent).toContain('Khachapuri × 2');
    expect(element.textContent).toContain('36');
    expect(service.getSessions$).toHaveBeenCalledWith('group-1');
  });
});
