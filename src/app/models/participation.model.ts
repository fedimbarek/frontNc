import { Evenement } from './evenement.model';

export interface Participation {
  participantId?: number;
  userId: string;
  registrationDate?: string;
  checkInTime?: string;
  event?: Evenement;
}
