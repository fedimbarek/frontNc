export type StatutTournoi = 'OUVERT' | 'COMPLET' | 'EN_COURS' | 'TERMINE';

export interface Tournoi {
  id?: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  capaciteMax: number;
  description?: string;
  statut?: StatutTournoi;
  prixInscription?: number | null;
  gagnantId?: string | null;
  participantIds?: string[];
  createdAt?: string;
  updatedAt?: string;
  nbParticipants?: number;
  complet?: boolean;
}

export interface TournoiRequest {
  nom: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  capaciteMax: number;
  description?: string;
  prixInscription?: number | null;
  statut?: StatutTournoi;
}