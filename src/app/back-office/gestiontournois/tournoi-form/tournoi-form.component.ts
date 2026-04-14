import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TournoiService } from '../../../services/tournoi.service';
import { StatutTournoi, TournoiRequest } from '../../../models/tournoi.model';

@Component({
  selector: 'app-tournoi-form',
  templateUrl: './tournoi-form.component.html',
  styleUrls: ['./tournoi-form.component.scss']
})
export class TournoiFormComponent implements OnInit, OnChanges {

  @Input() editingId: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  readonly statuses: Array<{ value: StatutTournoi; label: string }> = [
    { value: 'OUVERT', label: 'Ouvert' },
    { value: 'COMPLET', label: 'Complet' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' }
  ];

  constructor(
    private fb: FormBuilder,
    private tournoiService: TournoiService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.editingId) {
      this.loadTournoi(this.editingId);
    }
  }

  ngOnChanges(): void {
    if (this.form) {
      this.form.reset({ statut: 'OUVERT', capaciteMax: 8, prixInscription: null });
      this.errorMessage = '';
      if (this.editingId) {
        this.loadTournoi(this.editingId);
      }
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      lieu: ['', Validators.required],
      capaciteMax: [8, [Validators.required, Validators.min(2)]],
      description: [''],
      prixInscription: [null, [Validators.min(0)]],
      statut: ['OUVERT', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const start = group.get('dateDebut')?.value;
    const end = group.get('dateFin')?.value;

    if (start && end && new Date(start) >= new Date(end)) {
      return { dateRange: true };
    }

    return null;
  }

  private loadTournoi(id: number): void {
    this.tournoiService.findById(id).subscribe({
      next: (tournoi) => {
        this.form.patchValue({
          nom: tournoi.nom,
          dateDebut: this.toInputDate(tournoi.dateDebut),
          dateFin: this.toInputDate(tournoi.dateFin),
          lieu: tournoi.lieu,
          capaciteMax: tournoi.capaciteMax,
          description: tournoi.description,
          prixInscription: tournoi.prixInscription,
          statut: tournoi.statut || 'OUVERT'
        });
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le tournoi.';
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: TournoiRequest = {
      nom: this.form.value.nom,
      dateDebut: this.toISO(this.form.value.dateDebut),
      dateFin: this.toISO(this.form.value.dateFin),
      lieu: this.form.value.lieu,
      capaciteMax: Number(this.form.value.capaciteMax),
      description: this.form.value.description,
      prixInscription: this.form.value.prixInscription != null && this.form.value.prixInscription !== ''
        ? Number(this.form.value.prixInscription)
        : null,
      statut: this.form.value.statut
    };

    const request$ = this.editingId
      ? this.tournoiService.update(this.editingId, payload)
      : this.tournoiService.create(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l\'enregistrement du tournoi.';
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  fieldInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!(control?.invalid && control?.touched);
  }

  private toInputDate(value: string): string {
    if (!value) return '';
    return value.length > 16 ? value.substring(0, 16) : value;
  }

  private toISO(value: string): string {
    if (!value) return '';
    return value.includes('T') ? `${value.length === 16 ? value + ':00' : value}` : value;
  }
}