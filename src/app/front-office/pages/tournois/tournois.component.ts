import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { TournoiService } from '../../../services/tournoi.service';
import { StatutTournoi, Tournoi } from '../../../models/tournoi.model';

@Component({
  selector: 'app-tournois',
  templateUrl: './tournois.component.html',
  styleUrls: ['./tournois.component.scss']
})
export class TournoisComponent implements OnInit, OnDestroy {

  tournois: Tournoi[] = [];
  filteredTournois: Tournoi[] = [];
  isLoading = false;
  isLoggedIn = false;
  currentUserId: string | null = null;
  searchTerm = '';
  statusFilter: StatutTournoi | 'ALL' = 'ALL';
  processingId: number | null = null;
  successMsg = '';
  errorMsg = '';

  readonly statuses: Array<{ value: StatutTournoi | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: 'OUVERT', label: 'Ouvert' },
    { value: 'COMPLET', label: 'Complet' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private tournoiService: TournoiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.currentUserId = this.authService.getUserInfo()?.id || null;
    this.loadTournois();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTournois(): void {
    this.isLoading = true;
    this.tournoiService.findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.tournois = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMsg = 'Impossible de charger les tournois.';
        }
      });
  }

  applyFilters(): void {
    let result = [...this.tournois];

    if (this.statusFilter !== 'ALL') {
      result = result.filter(t => t.statut === this.statusFilter);
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(t =>
        (t.nom || '').toLowerCase().includes(q) ||
        (t.lieu || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }

    this.filteredTournois = result.sort((a, b) => (a.dateDebut || '').localeCompare(b.dateDebut || ''));
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  isRegistered(tournoi: Tournoi): boolean {
    if (this.currentUserId == null) return false;
    return (tournoi.participantIds || []).includes(this.currentUserId);
  }

  canRegister(tournoi: Tournoi): boolean {
    return this.isLoggedIn && this.currentUserId != null && tournoi.statut === 'OUVERT' && !tournoi.complet && !this.isRegistered(tournoi);
  }

  register(tournoiId: number): void {
    if (!this.isLoggedIn) {
      this.authService.login();
      return;
    }

    this.processingId = tournoiId;
    this.tournoiService.inscrire(tournoiId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.processingId = null;
          this.successMsg = 'Inscription au tournoi confirmée.';
          this.errorMsg = '';
          this.loadTournois();
          setTimeout(() => { this.successMsg = ''; }, 4000);
        },
        error: (err) => {
          this.processingId = null;
          this.errorMsg = err?.error?.message || 'Erreur lors de l\'inscription au tournoi.';
          setTimeout(() => { this.errorMsg = ''; }, 5000);
        }
      });
  }

  getStatusLabel(statut?: StatutTournoi): string {
    const map: Record<string, string> = {
      OUVERT: 'Ouvert',
      COMPLET: 'Complet',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé'
    };
    return statut ? (map[statut] || statut) : 'Inconnu';
  }

  getStatusClass(statut?: StatutTournoi): string {
    const map: Record<string, string> = {
      OUVERT: 'status--open',
      COMPLET: 'status--full',
      EN_COURS: 'status--running',
      TERMINE: 'status--done'
    };
    return statut ? (map[statut] || '') : '';
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getRemainingSeats(tournoi: Tournoi): number {
    return Math.max(0, (tournoi.capaciteMax || 0) - (tournoi.nbParticipants ?? (tournoi.participantIds || []).length));
  }

}