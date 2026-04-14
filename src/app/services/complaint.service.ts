import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complaint, ComplaintStatus, Page, DashboardStats } from '../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {

  private readonly base = 'http://localhost:8222/complaints';

  constructor(private http: HttpClient) {}

  create(complaint: Complaint): Observable<Complaint> {
    return this.http.post<Complaint>(this.base, complaint);
  }

  getAll(): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(this.base);
  }

  getPaginated(page: number, size: number): Observable<Page<Complaint>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Complaint>>(`${this.base}/paginated`, { params });
  }

  getById(id: number): Observable<Complaint> {
    return this.http.get<Complaint>(`${this.base}/${id}`);
  }

  update(id: number, complaint: Complaint): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.base}/${id}`, complaint);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getByStatus(status: ComplaintStatus): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.base}/status/${status}`);
  }

  search(status?: ComplaintStatus, keyword?: string, startDate?: string, endDate?: string): Observable<Complaint[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (keyword) params = params.set('keyword', keyword);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<Complaint[]>(`${this.base}/search`, { params });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/stats/dashboard`);
  }
}
