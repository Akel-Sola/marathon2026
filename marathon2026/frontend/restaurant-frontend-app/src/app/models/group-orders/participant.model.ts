export type ParticipantType = 'Owner' | 'Guest';

export interface ParticipantItem {
  dish: { id: string; name: string; price: number; imageUrl?: string };
  quantity: number;
}

export interface Participant {
  id: string;
  type: ParticipantType;
  name: string;
  items: ParticipantItem[];
  total: number;
  isSubmitted: boolean;
}
