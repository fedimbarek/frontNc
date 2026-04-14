import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface CreateUserResponse {
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeycloakUserService {

  private apiUrl = 'http://localhost:8222/api/users';

  constructor(private http: HttpClient) {}

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getUsersByRole(role: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/role/${role}`);
  }
}