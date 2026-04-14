import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

export interface Club {
  _id?: string;
  nomClub: string;
  debutTravail: string;
  finTravail: string;
  nombreTerrains: number;
  prix: number;
}
@Injectable({
  providedIn: 'root'
})
export class ClubService {

  private apiUrl = 'http://localhost:8222/clubs';
 
  constructor(private http: HttpClient) {}
 
  getAllClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl);
  }
 
  getClubById(id: string): Observable<Club> {
    return this.http.get<Club>(`${this.apiUrl}/${id}`);
  }
 
  createClub(club: Club): Observable<Club> {
    return this.http.post<Club>(this.apiUrl, club);
  }
 
  deleteClub(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
