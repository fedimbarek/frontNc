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
export class PublicUserService {

  private apiUrl = 'http://localhost:8222/api/users/add';

  constructor(private http: HttpClient) {}

  createUser(userData: CreateUserRequest): Observable<CreateUserResponse> {

    console.log('📤 Envoi requête vers:', this.apiUrl);
    console.log('📦 Données envoyées:', userData);

    return this.http.post<CreateUserResponse>(this.apiUrl, userData).pipe(
      tap(response => {
        console.log('✅ Réponse reçue:', response);
      }),
      catchError((error: HttpErrorResponse) => {

        console.error('❌ ERREUR COMPLÈTE:', error);
        console.error('📊 Status:', error.status);
        console.error('📝 Message:', error.message);
        console.error('🔍 Error body:', error.error);

        let errorMessage = 'Erreur lors de la création de l\'utilisateur';

        if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur.';
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        return throwError(() => ({ error: { error: errorMessage } }));
      })
    );
  }
}