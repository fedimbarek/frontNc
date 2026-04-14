export interface Evenement {
  eventId?: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  capacity: number;
  level: string; // 'ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'
  imageUrl?: string;
  reminderSent?: boolean;
  organizerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizerDTO {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface EnrichedEvenementDTO {
  event: Evenement;
  organizer?: OrganizerDTO;
  weatherInfo: string;
}
