import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private api = 'http://localhost:8222';

  constructor(private http: HttpClient) {}

  // 🔹 clubs
  getClubs() {
    return this.http.get<any[]>(`${this.api}/clubs`);
  }

  // 🔹 créneaux disponibles
  getAvailableSlots(clubId: string, terrainName: string, date: string) {
    return this.http.get<any[]>(
      `${this.api}/reservations/available?clubId=${clubId}&terrainName=${terrainName}&date=${date}`
    );
  }

  // 🔹 réserver
  createReservation(data: any) {
    return this.http.post(`${this.api}/reservations`, data);
  }


  getMyReservations(userId: string) {
  return this.http.get<any[]>(
    `http://localhost:8222/reservations/my?userId=${userId}`
  );
}

// ❌ annuler réservation
deleteReservation(id: string) {
  return this.http.delete(
    `http://localhost:8222/reservations/${id}`
  );
}
}
