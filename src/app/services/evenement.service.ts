import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evenement, EnrichedEvenementDTO } from '../models/evenement.model';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {

  private readonly base = 'http://localhost:8222/api/evenements';

  constructor(private http: HttpClient) {}

  /** GET /api/evenements/find — public, retourne tous les événements enrichis */
  findAll(): Observable<EnrichedEvenementDTO[]> {
    return this.http.get<EnrichedEvenementDTO[]>(`${this.base}/find`);
  }

  /** GET /api/evenements/{id} — public */
  findById(id: number): Observable<EnrichedEvenementDTO> {
    return this.http.get<EnrichedEvenementDTO>(`${this.base}/${id}`);
  }

  /** POST /api/evenements/add — ADMIN (JWT requis) */
  create(evenement: Evenement): Observable<Evenement> {
    return this.http.post<Evenement>(`${this.base}/add`, evenement);
  }

  /** PUT /api/evenements/update?id={id} — ADMIN (JWT requis) */
  update(id: number, evenement: Evenement): Observable<Evenement> {
    return this.http.put<Evenement>(`${this.base}/update?id=${id}`, evenement);
  }

  /** DELETE /api/evenements/delete?id={id} — ADMIN (JWT requis) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete?id=${id}`);
  }

  /** GET /api/evenements/{id}/available-seats — public */
  getAvailableSeats(id: number): Observable<{ availableSeats: number }> {
    return this.http.get<{ availableSeats: number }>(`${this.base}/${id}/available-seats`);
  }

  /** GET /api/evenements/{id}/is-full — public */
  isFull(id: number): Observable<{ full: boolean }> {
    return this.http.get<{ full: boolean }>(`${this.base}/${id}/is-full`);
  }
}
