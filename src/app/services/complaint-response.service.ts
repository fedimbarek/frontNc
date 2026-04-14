import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComplaintResponse } from '../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class ComplaintResponseService {

  private readonly base = 'http://localhost:8222/responses';

  constructor(private http: HttpClient) {}

  create(response: ComplaintResponse): Observable<ComplaintResponse> {
    return this.http.post<ComplaintResponse>(this.base, response);
  }

  getAll(): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(this.base);
  }

  getById(id: number): Observable<ComplaintResponse> {
    return this.http.get<ComplaintResponse>(`${this.base}/${id}`);
  }

  update(id: number, response: ComplaintResponse): Observable<ComplaintResponse> {
    return this.http.put<ComplaintResponse>(`${this.base}/${id}`, response);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
