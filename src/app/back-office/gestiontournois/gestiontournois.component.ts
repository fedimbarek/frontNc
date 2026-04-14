import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, forkJoin, map, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TournoiService } from '../../services/tournoi.service';
import { Tournoi } from '../../models/tournoi.model';
import { KeycloakUserService } from '../../services/keycloak-user.service';

interface UserSummary {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Component({
  selector: 'app-gestiontournois',
  templateUrl: './gestiontournois.component.html',
  styleUrls: ['./gestiontournois.component.scss']
})
export class GestiontournoisComponent implements OnInit, OnDestroy {

  tournois: Tournoi[] = [];
  isLoading = false;
  showForm = false;
  editingId: number | null = null;
  successMessage = '';
  errorMessage = '';
  selectedWinnerByTournoi: Record<number, string> = {};
  assigningWinnerForId: number | null = null;
  participantsByTournoi: Record<number, UserSummary[]> = {};
  loadingParticipantsByTournoi: Record<number, boolean> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private tournoiService: TournoiService,
    private keycloakUserService: KeycloakUserService
  ) {}

  ngOnInit(): void {
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
          this.prefillWinnerSelections(data);
          this.loadParticipantsForTournois(data);
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Impossible de charger les tournois.';
          this.isLoading = false;
        }
      });
  }

  openCreateForm(): void {
    this.editingId = null;
    this.showForm = true;
  }

  openEditForm(tournoi: Tournoi): void {
    this.editingId = tournoi.id ?? null;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  onSaved(): void {
    this.closeForm();
    this.showSuccess('Tournoi enregistré avec succès.');
    this.loadTournois();
  }

  deleteTournoi(id: number): void {
    if (!confirm('Supprimer ce tournoi ?')) return;

    this.tournoiService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Tournoi supprimé.');
          this.loadTournois();
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la suppression.';
        }
      });
  }

  assignWinner(tournoi: Tournoi): void {
    const tournoiId = tournoi.id;
    if (!tournoiId) return;

    const selectedValue = this.selectedWinnerByTournoi[tournoiId];
    if (!selectedValue?.trim()) {
      this.errorMessage = 'Sélectionne un participant avant de désigner le gagnant.';
      return;
    }

    const winnerId = selectedValue.trim();
    if (!winnerId) {
      this.errorMessage = 'L\'identifiant du gagnant est requis.';
      return;
    }

    this.assigningWinnerForId = tournoiId;
    this.tournoiService.designerGagnant(tournoiId, winnerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.assigningWinnerForId = null;
          this.selectedWinnerByTournoi[tournoiId] = '';
          this.showSuccess('Gagnant désigné avec succès.');
          this.loadTournois();
        },
        error: (err) => {
          this.assigningWinnerForId = null;
          this.errorMessage = err?.error?.message || 'Impossible de désigner le gagnant.';
        }
      });
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusLabel(statut?: string): string {
    const labels: Record<string, string> = {
      OUVERT: 'Ouvert',
      COMPLET: 'Complet',
      EN_COURS: 'En cours',
      TERMINE: 'Terminé'
    };
    return statut ? labels[statut] || statut : 'Inconnu';
  }

  getParticipants(tournoi: Tournoi): UserSummary[] {
    const tournoiId = tournoi.id;
    if (!tournoiId) return [];
    return this.participantsByTournoi[tournoiId] || [];
  }

  getWinnerLabel(tournoi: Tournoi): string {
    if (!tournoi.gagnantId) return 'Aucun gagnant désigné';

    const participants = this.getParticipants(tournoi);
    const winner = participants.find(user => user.id === tournoi.gagnantId);

    if (winner) {
      const name = this.getDisplayName(winner);
      return winner.email ? `${name} (${winner.email})` : name;
    }

    return tournoi.gagnantId;
  }

  getDisplayName(user: UserSummary): string {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (fullName) return fullName;
    return user.username || `Utilisateur ${user.id}`;
  }

  isParticipantsLoading(tournoi: Tournoi): boolean {
    return !!(tournoi.id && this.loadingParticipantsByTournoi[tournoi.id]);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => { this.successMessage = ''; }, 4000);
  }

  private prefillWinnerSelections(tournois: Tournoi[]): void {
    tournois.forEach(tournoi => {
      if (tournoi.id && tournoi.gagnantId != null) {
        this.selectedWinnerByTournoi[tournoi.id] = tournoi.gagnantId;
      }
    });
  }

  private loadParticipantsForTournois(tournois: Tournoi[]): void {
    tournois.forEach(tournoi => {
      const tournoiId = tournoi.id;
      if (!tournoiId || this.participantsByTournoi[tournoiId]) {
        return;
      }

      const participantIds = Array.from(new Set((tournoi.participantIds || []).filter(Boolean)));
      if (participantIds.length === 0) {
        this.participantsByTournoi[tournoiId] = [];
        return;
      }

      this.loadingParticipantsByTournoi[tournoiId] = true;

      forkJoin(
        participantIds.map(participantId =>
          this.keycloakUserService.getUserById(participantId).pipe(
            map((user: any) => ({
              id: String(user?.id ?? participantId),
              username: user?.username || '',
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              email: user?.email || ''
            }) as UserSummary),
            catchError(() => of({
              id: String(participantId),
              username: `Utilisateur ${participantId}`,
              firstName: '',
              lastName: '',
              email: ''
            } as UserSummary))
          )
        )
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (users) => {
            this.participantsByTournoi[tournoiId] = users;
            this.loadingParticipantsByTournoi[tournoiId] = false;

            if (tournoi.gagnantId != null && !this.selectedWinnerByTournoi[tournoiId]) {
              this.selectedWinnerByTournoi[tournoiId] = String(tournoi.gagnantId);
            }
          },
          error: () => {
            this.participantsByTournoi[tournoiId] = [];
            this.loadingParticipantsByTournoi[tournoiId] = false;
          }
        });
    });
  }
}