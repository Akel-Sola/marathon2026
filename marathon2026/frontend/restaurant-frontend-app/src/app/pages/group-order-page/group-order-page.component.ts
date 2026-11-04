import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of, switchMap } from 'rxjs';
import { GroupOrdersService } from '@app/services/group-orders/group-orders.service';
import { Participant } from '@app/models/group-orders/participant.model';

@Component({
  selector: 'app-group-order-page',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './group-order-page.component.html',
  styleUrl: './group-order-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupOrderPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(GroupOrdersService);
  private readonly destroyRef = inject(DestroyRef);
  readonly participants = signal<Participant[]>([]);
  readonly groupId = signal('');
  readonly ownerSessionId = signal('');
  readonly status = signal<'Open' | 'Submitted' | 'Closed'>('Open');
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly showConfirm = signal(false);
  readonly submittedParticipants = computed(() => this.participants().filter(p => p.isSubmitted));
  readonly consolidated = computed(() => {
    const result = new Map<string, { name: string; price: number; quantity: number }>();
    for (const participant of this.submittedParticipants()) for (const item of participant.items) {
      const current = result.get(item.dish.id);
      result.set(item.dish.id, { name: item.dish.name, price: item.dish.price, quantity: (current?.quantity ?? 0) + item.quantity });
    }
    return [...result.values()];
  });
  readonly total = computed(() => this.consolidated().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly pendingCount = computed(() => this.participants().filter(p => p.type === 'Guest' && !p.isSubmitted).length);

  ngOnInit(): void { this.load(); }

  load(): void {
    const reservationId = this.route.snapshot.paramMap.get('reservationId');
    if (!reservationId) { this.error.set('Group reservation not found'); this.loading.set(false); return; }
    this.loading.set(true); this.error.set('');
    this.service.getInviteToken$(reservationId).pipe(
      switchMap(({ token }) => this.service.getGroupByToken$(token)),
      switchMap(({ groupReservationId }) => {
        this.groupId.set(groupReservationId);
        return this.service.getOwnerSessionId$(reservationId).pipe(
          switchMap(owner => forkJoin({ sessions: this.service.getSessions$(groupReservationId), status: this.service.getStatus$(groupReservationId), owner: of(owner) })),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: ({ sessions, status, owner }) => { this.participants.set(sessions.participants); this.status.set(status.status); this.ownerSessionId.set(owner.guestSessionId); this.loading.set(false); },
      error: () => { this.error.set('Group reservation not found'); this.loading.set(false); },
    });
  }

  submit(): void {
    if (this.submitting() || this.status() !== 'Open' || this.consolidated().length === 0) return;
    this.showConfirm.set(true);
  }

  confirmSubmit(): void {
    const groupId = this.groupId(); const reservationId = this.route.snapshot.paramMap.get('reservationId');
    if (!groupId || !reservationId) return;
    this.submitting.set(true);
    this.service.submit$(groupId, reservationId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.status.set('Submitted'); this.showConfirm.set(false); this.submitting.set(false); },
      error: () => { this.submitting.set(false); this.showConfirm.set(false); this.error.set('Unable to submit the pre-order. Try again.'); },
    });
  }
}
