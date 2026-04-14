import { Component, OnInit, OnDestroy } from '@angular/core';
import { EvenementService } from '../../services/evenement.service';
import { ParticipationService } from '../../services/participation.service';
import { EnrichedEvenementDTO } from '../../models/evenement.model';
import { Participation } from '../../models/participation.model';
import { KeycloakUserService } from '../../services/keycloak-user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-gestionevenements',
  templateUrl: './gestionevenements.component.html',
  styleUrls: ['./gestionevenements.component.scss']
})
export class GestionevenementsComponent implements OnInit, OnDestroy {

  evenements: EnrichedEvenementDTO[] = [];
  allParticipations: Participation[] = [];
  allKeycloakParticipants: any[] = [];
  participantNames: { [userId: string]: string } = {};
  expandedEventId: number | null = null;

  showForm = false;
  editingId: number | null = null;

  isLoading = false;
  isLoadingParticipants = false;
  newParticipantUserId: string = '';
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private evenementService: EvenementService,
    private participationService: ParticipationService,
    private keycloakUserService: KeycloakUserService
  ) {}

  ngOnInit(): void {
    this.loadEvenements();
    this.loadAllParticipations();
    this.loadKeycloakParticipants();
  }

  loadKeycloakParticipants(): void {
    this.keycloakUserService.getUsersByRole('PARTICIPANT')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.allKeycloakParticipants = users;
        },
        error: () => {
          console.error('Impossible de charger la liste des participants Keycloak.');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvenements(): void {
    this.isLoading = true;
    this.evenementService.findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.evenements = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Impossible de charger les événements.';
          this.isLoading = false;
        }
      });
  }

  loadAllParticipations(): void {
    this.isLoadingParticipants = true;
    this.participationService.findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.allParticipations = data;
          this.isLoadingParticipants = false;
        },
        error: () => {
          this.isLoadingParticipants = false;
        }
      });
  }

  getParticipationsForEvent(eventId: number): Participation[] {
    return this.allParticipations.filter(p => p.event?.eventId === eventId);
  }

  getAvailableParticipantsForEvent(eventId: number): any[] {
    const registeredIds = this.getParticipationsForEvent(eventId).map(p => p.userId);
    return this.allKeycloakParticipants.filter(u => !registeredIds.includes(u.id));
  }

  toggleParticipants(eventId: number): void {
    this.expandedEventId = this.expandedEventId === eventId ? null : eventId;
    if (this.expandedEventId) {
      this.loadParticipantNamesForEvent(this.expandedEventId);
    }
  }

  loadParticipantNamesForEvent(eventId: number): void {
    const parts = this.getParticipationsForEvent(eventId);
    parts.forEach(p => {
      if (p.userId && !this.participantNames[p.userId]) {
        this.participantNames[p.userId] = 'Chargement...';
        this.keycloakUserService.getUserById(p.userId).subscribe({
          next: user => {
            this.participantNames[p.userId] = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Utilisateur';
          },
          error: () => {
            this.participantNames[p.userId] = 'Inconnu';
          }
        });
      }
    });
  }

  openCreateForm(): void {
    this.editingId = null;
    this.showForm = true;
  }

  openEditForm(evenementDTO: EnrichedEvenementDTO): void {
    this.editingId = evenementDTO.event.eventId ?? null;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  onFormSaved(): void {
    this.showForm = false;
    this.editingId = null;
    this.showSuccess('Événement enregistré avec succès.');
    this.loadEvenements();
    this.loadAllParticipations();
  }

  deleteEvenement(id: number): void {
    if (!confirm('Supprimer cet événement ? Toutes ses participations seront supprimées.')) return;
    this.evenementService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Événement supprimé.');
          this.loadEvenements();
          this.loadAllParticipations();
          if (this.expandedEventId === id) this.expandedEventId = null;
        },
        error: () => { this.errorMessage = 'Erreur lors de la suppression.'; }
      });
  }

  checkIn(participationId: number): void {
    this.participationService.checkIn(participationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Check-in effectué avec succès.');
          this.loadAllParticipations();
        },
        error: () => { this.errorMessage = 'Erreur lors du check-in.'; }
      });
  }

  deleteParticipation(participationId: number): void {
    if (!confirm('Supprimer cette participation ?')) return;
    this.participationService.delete(participationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Participation supprimée.');
          this.loadAllParticipations();
          this.loadEvenements();
        },
        error: () => { this.errorMessage = 'Erreur lors de la suppression.'; }
      });
  }

  addParticipantAdmin(eventId: number): void {
    if (!this.newParticipantUserId.trim()) return;
    
    // We match the model structure
    const payload: Participation = {
      userId: this.newParticipantUserId.trim(),
      // Cast the minimal required object for the backend association
      event: { eventId } as any
    };

    this.participationService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Participant ajouté manuellement.');
          this.newParticipantUserId = '';
          this.loadAllParticipations();
          this.loadParticipantNamesForEvent(eventId);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur lors de l\'ajout du participant.';
        }
      });
  }

  getWeatherIcon(info: string): string {
    if (!info) return '🌡️';
    if (info.includes('☀️')) return '☀️';
    if (info.includes('⚠️')) return '⚠️';
    if (info.includes('passed') || info.includes('passé')) return '📅';
    return '🌡️';
  }

  getWeatherClass(info: string): string {
    if (!info) return 'weather--neutral';
    if (info.includes('☀️')) return 'weather--good';
    if (info.includes('⚠️')) return 'weather--bad';
    return 'weather--neutral';
  }

  getLevelLabel(level: string): string {
    const map: Record<string, string> = {
      ALL: 'Tous niveaux',
      BEGINNER: 'Débutant',
      INTERMEDIATE: 'Intermédiaire',
      ADVANCED: 'Avancé'
    };
    return map[level] ?? level;
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => { this.successMessage = ''; }, 3500);
  }

  dismissError(): void { this.errorMessage = ''; }
  dismissSuccess(): void { this.successMessage = ''; }
}
