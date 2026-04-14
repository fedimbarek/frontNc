import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tournoi, TournoiRequest, StatutTournoi } from '../models/tournoi.model';

@Injectable({
  providedIn: 'root'
})
export class TournoiService {

  private readonly base = 'http://localhost:8222/api/tournois';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Tournoi[]> {
    return this.http.get<Tournoi[]>(this.base);
  }

  findById(id: number): Observable<Tournoi> {
    return this.http.get<Tournoi>(`${this.base}/${id}`);
  }

  create(tournoi: TournoiRequest): Observable<Tournoi> {
    return this.http.post<Tournoi>(this.base, tournoi);
  }

  update(id: number, tournoi: TournoiRequest): Observable<Tournoi> {
    return this.http.put<Tournoi>(`${this.base}/${id}`, tournoi);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  inscrire(tournoiId: number): Observable<Tournoi> {
    return this.http.post<Tournoi>(`${this.base}/${tournoiId}/inscrire`, {});
  }

  designerGagnant(tournoiId: number, joueurId: string): Observable<Tournoi> {
    return this.http.post<Tournoi>(`${this.base}/${tournoiId}/gagnant/${joueurId}`, {});
  }

  findByStatut(statut: StatutTournoi): Observable<Tournoi[]> {
    return this.http.get<Tournoi[]>(`${this.base}/statut/${statut}`);
  }
}