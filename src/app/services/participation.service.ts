import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Participation } from '../models/participation.model';

@Injectable({
  providedIn: 'root'
})
export class ParticipationService {

  private readonly base = 'http://localhost:8222/api/participations';

  constructor(private http: HttpClient) {}

  /** POST /api/participations/register — PARTICIPANT (JWT requis)
   *  Le backend extrait userId du JWT, le client envoie uniquement { eventId } */
  register(eventId: number): Observable<Participation> {
    return this.http.post<Participation>(`${this.base}/register`, { eventId });
  }

  /** DELETE /api/participations/unregister?id={participationId} — PARTICIPANT (JWT requis) */
  unregister(participationId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/unregister?id=${participationId}`);
  }

  /** GET /api/participations/findall — ADMIN (JWT requis) */
  findAll(): Observable<Participation[]> {
    return this.http.get<Participation[]>(`${this.base}/findall`);
  }

  /** GET /api/participations/find?id={id} — ADMIN (JWT requis) */
  findById(id: number): Observable<Participation> {
    return this.http.get<Participation>(`${this.base}/find?id=${id}`);
  }

  /** DELETE /api/participations/delete?id={id} — ADMIN (JWT requis) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete?id=${id}`);
  }

  /** POST /api/participations/checkin?id={participationId} — ADMIN (JWT requis) */
  checkIn(participationId: number): Observable<Participation> {
    return this.http.post<Participation>(`${this.base}/checkin?id=${participationId}`, {});
  }

  /** POST /api/participations/add — ADMIN CRUD */
  create(participation: Participation): Observable<Participation> {
    return this.http.post<Participation>(`${this.base}/add`, participation);
  }
}
