import { Component, OnInit, OnDestroy } from '@angular/core';
import { EvenementService } from '../../../services/evenement.service';
import { ParticipationService } from '../../../services/participation.service';
import { AuthService } from '../../../auth/auth.service';
import { EnrichedEvenementDTO } from '../../../models/evenement.model';
import { Participation } from '../../../models/participation.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-evenements',
  templateUrl: './evenements.component.html',
  styleUrls: ['./evenements.component.scss']
})
export class EvenementsComponent implements OnInit, OnDestroy {

  evenements: EnrichedEvenementDTO[] = [];
  filteredEvenements: EnrichedEvenementDTO[] = [];
  myParticipations: Participation[] = [];

  isLoading = false;
  isLoggedIn = false;
  isParticipant = false;

  // Filtres
  filterLevel = 'ALL';
  filterSearch = '';

  levels = [
    { value: 'ALL', label: 'Tous les niveaux' },
    { value: 'BEGINNER', label: 'Débutant' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire' },
    { value: 'ADVANCED', label: 'Avancé' }
  ];

  // Notifications inline
  successMsg = '';
  errorMsg = '';
  processingId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private evenementService: EvenementService,
    private participationService: ParticipationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isParticipant = this.authService.hasRole('PARTICIPANT');

    this.loadEvenements();
    if (this.isLoggedIn) this.loadMyParticipations();
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
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  loadMyParticipations(): void {
    // On ne peut pas filtrer par userId côté backend (findall retourne tout pour l'admin)
    // Le PARTICIPANT appelle donc findall — mais le backend le protège par auth uniquement.
    // On filtre côté front pour afficher seulement les participations de l'utilisateur courant.
    const userId = this.authService.getUserInfo()?.id;
    if (!userId) return;
    this.participationService.findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.myParticipations = list.filter(p => p.userId === userId);
        },
        error: () => { /* silencieux si erreur 403 */ }
      });
  }

  applyFilters(): void {
    let result = [...this.evenements];
    if (this.filterLevel !== 'ALL') {
      result = result.filter(dto => dto.event.level === this.filterLevel);
    }
    if (this.filterSearch.trim()) {
      const s = this.filterSearch.toLowerCase();
      result = result.filter(dto =>
        dto.event.title.toLowerCase().includes(s) ||
        (dto.event.description || '').toLowerCase().includes(s) ||
        (dto.event.location || '').toLowerCase().includes(s)
      );
    }
    this.filteredEvenements = result;
  }

  onFilterChange(): void { this.applyFilters(); }

  isRegistered(eventId: number): boolean {
    return this.myParticipations.some(p => p.event?.eventId === eventId);
  }

  getMyParticipation(eventId: number): Participation | undefined {
    return this.myParticipations.find(p => p.event?.eventId === eventId);
  }

  register(eventId: number): void {
    if (!this.isLoggedIn) {
      // Rediriger vers Keycloak login
      this.authService.login();
      return;
    }
    this.processingId = eventId;
    this.participationService.register(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (p) => {
          this.myParticipations.push(p);
          this.processingId = null;
          this.showSuccess('Inscription confirmée ! Vous recevrez un email de confirmation.');
          this.loadEvenements(); // refresh pour les places dispo
        },
        error: (err) => {
          this.processingId = null;
          const msg = err?.error?.message || err?.message || '';
          if (msg.toLowerCase().includes('full')) {
            this.showError('Cet événement est complet.');
          } else {
            this.showError('Erreur lors de l\'inscription. Veuillez réessayer.');
          }
        }
      });
  }

  unregister(eventId: number): void {
    const p = this.getMyParticipation(eventId);
    if (!p?.participantId) return;
    if (!confirm('Se désinscrire de cet événement ?')) return;

    this.processingId = eventId;
    this.participationService.unregister(p.participantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.myParticipations = this.myParticipations.filter(x => x.participantId !== p.participantId);
          this.processingId = null;
          this.showSuccess('Désinscription effectuée.');
          this.loadEvenements();
        },
        error: () => {
          this.processingId = null;
          this.showError('Erreur lors de la désinscription.');
        }
      });
  }

  checkIn(eventId: number): void {
    const p = this.getMyParticipation(eventId);
    if (!p?.participantId) return;

    this.processingId = eventId;
    this.participationService.checkIn(p.participantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedP) => {
          const index = this.myParticipations.findIndex(x => x.participantId === p.participantId);
          if (index !== -1) {
            this.myParticipations[index] = updatedP;
          }
          this.processingId = null;
          this.showSuccess('Check-in effectué avec succès ! Vous êtes présent.');
        },
        error: () => {
          this.processingId = null;
          this.showError('Erreur lors du check-in. Veuillez réessayer.');
        }
      });
  }

  getAvailableSeats(dto: EnrichedEvenementDTO): number {
    // Calculé localement à partir de la capacité
    return dto.event.capacity;
  }

  getWeatherClass(info: string): string {
    if (!info) return 'weather--neutral';
    if (info.includes('☀️')) return 'weather--good';
    if (info.includes('⚠️')) return 'weather--bad';
    return 'weather--neutral';
  }

  getLevelLabel(level: string): string {
    const map: Record<string, string> = {
      ALL: 'Tous niveaux', BEGINNER: 'Débutant',
      INTERMEDIATE: 'Intermédiaire', ADVANCED: 'Avancé'
    };
    return map[level] ?? level;
  }

  getLevelColor(level: string): string {
    const map: Record<string, string> = {
      ALL: 'badge--all', BEGINNER: 'badge--beginner',
      INTERMEDIATE: 'badge--intermediate', ADVANCED: 'badge--advanced'
    };
    return map[level] ?? '';
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  goLogin(): void { this.authService.login(); }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 4000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg;
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }
}
