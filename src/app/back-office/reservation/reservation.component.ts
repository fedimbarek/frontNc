import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent implements OnInit {

  clubs: any[] = [];
  selectedClub: any = null;
  selectedTerrain: string = '';
  selectedDate: string = '';
  slots: any[] = [];
  userId: string = '';
  slotsLoading = false;
  today: string = new Date().toISOString().split('T')[0];

  // 📋 Mes réservations
  myReservations: any[] = [];
  showMyReservations = false;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (userInfo?.id) this.userId = userInfo.id as string;
    this.loadClubs();
  }

  loadClubs() {
    this.reservationService.getClubs().subscribe({
      next: (data) => { this.clubs = data; },
      error: (err) => console.log(err)
    });
  }

  // 📋 Charger mes réservations
  loadMyReservations() {
    this.reservationService.getMyReservations(this.userId).subscribe({
      next: (data) => {
        this.myReservations = data;
        this.showMyReservations = true;
      },
      error: (err) => console.log(err)
    });
  }

  // ✅ Condition 1 : la réservation est-elle passée ?
  isReservationPassed(reservation: any): boolean {
    const reservationDate = new Date(`${reservation.date}T${reservation.endTime}`);
    return reservationDate < new Date();
  }

  // ✅ Condition 2 : délai minimum de 2h avant le début
  isTooLateToCancel(reservation: any): boolean {
    const startDateTime = new Date(`${reservation.date}T${reservation.startTime}`);
    const now = new Date();
    const diffMs = startDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 2; // moins de 2h → trop tard
  }

  // 🔒 Peut-on annuler ? (combine les 2 conditions)
  canCancel(reservation: any): boolean {
    return !this.isReservationPassed(reservation) && !this.isTooLateToCancel(reservation);
  }

  // 💬 Message d'explication selon la condition bloquante
  getCancelBlockReason(reservation: any): string {
    if (this.isReservationPassed(reservation)) {
      return 'Réservation déjà passée';
    }
    if (this.isTooLateToCancel(reservation)) {
      return 'Annulation impossible moins de 2h avant';
    }
    return '';
  }

  // ❌ Annuler réservation
  cancelReservation(reservation: any) {
    if (!this.canCancel(reservation)) {
      alert(this.getCancelBlockReason(reservation));
      return;
    }

    if (!confirm(`Annuler la réservation du ${reservation.date} à ${reservation.startTime} ?`)) return;

    this.reservationService.deleteReservation(reservation._id).subscribe({
      next: () => {
        alert('Réservation annulée ✅');
        this.loadMyReservations(); // refresh
      },
      error: (err) => {
        alert('Erreur lors de l\'annulation ❌');
        console.log(err);
      }
    });
  }

  getTerrains(club: any): number[] {
    return Array.from({ length: club.nombreTerrains }, (_, i) => i + 1);
  }

  selectTerrain(club: any, terrainNumber: number) {
    this.selectedClub = club;
    this.selectedTerrain = `${club.nomClub}-T${terrainNumber}`;
    this.slots = [];
    if (this.selectedDate) this.loadSlots();
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    if (this.selectedClub && this.selectedTerrain) this.loadSlots();
  }

  loadSlots() {
    this.slotsLoading = true;
    this.slots = [];
    this.reservationService
      .getAvailableSlots(this.selectedClub._id, this.selectedTerrain, this.selectedDate)
      .subscribe({
        next: (data) => { this.slots = data; this.slotsLoading = false; },
        error: (err) => { console.log(err); this.slotsLoading = false; }
      });
  }

  reserve(slot: any) {
    const reservation = {
      userId: this.userId,
      clubId: this.selectedClub._id,
      terrainName: this.selectedTerrain,
      date: this.selectedDate,
      startTime: slot.start,
      endTime: slot.end
    };

    this.reservationService.createReservation(reservation).subscribe({
      next: () => {
        alert('Réservation réussie ✅');
        this.loadSlots();
      },
      error: (err) => {
        alert('Erreur réservation ❌');
        console.log(err);
      }
    });
  }

  resetSelection() {
    this.selectedClub = null;
    this.selectedTerrain = '';
    this.selectedDate = '';
    this.slots = [];
  }
}