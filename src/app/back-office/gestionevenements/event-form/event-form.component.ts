import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EvenementService } from '../../../services/evenement.service';
import { AuthService } from '../../../auth/auth.service';
import { Evenement } from '../../../models/evenement.model';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, OnChanges {

  @Input() editingId: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  imagePreview: string | null = null;

  levels = [
    { value: 'ALL', label: 'Tous niveaux' },
    { value: 'BEGINNER', label: 'Débutant' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire' },
    { value: 'ADVANCED', label: 'Avancé' }
  ];

  constructor(
    private fb: FormBuilder, 
    private evenementService: EvenementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.editingId) this.loadEvent(this.editingId);
  }

  ngOnChanges(): void {
    if (this.form) {
      this.form.reset();
      this.imagePreview = null;
      this.errorMessage = '';
      if (this.editingId) this.loadEvent(this.editingId);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      location: [''],
      capacity: [10, [Validators.required, Validators.min(1)]],
      level: ['ALL', Validators.required],
      imageUrl: [''],
      reminderSent: [false]
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    if (start && end && new Date(start) >= new Date(end)) {
      return { dateRange: true };
    }
    return null;
  }

  private loadEvent(id: number): void {
    this.evenementService.findById(id).subscribe({
      next: (dto) => {
        const e = dto.event;
        this.form.patchValue({
          title: e.title,
          description: e.description,
          startTime: this.toInputDateTime(e.startTime),
          endTime: this.toInputDateTime(e.endTime),
          location: e.location,
          capacity: e.capacity,
          level: e.level,
          imageUrl: e.imageUrl,
          reminderSent: e.reminderSent
        });
        if (e.imageUrl) this.imagePreview = e.imageUrl;
      },
      error: () => { this.errorMessage = 'Impossible de charger l\'événement.'; }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Resize / compress via canvas before base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        this.imagePreview = compressed;
        this.form.patchValue({ imageUrl: compressed });
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.form.patchValue({ imageUrl: '' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: Evenement = {
      title: this.form.value.title,
      description: this.form.value.description,
      startTime: this.toISO(this.form.value.startTime),
      endTime: this.toISO(this.form.value.endTime),
      location: this.form.value.location,
      capacity: this.form.value.capacity,
      level: this.form.value.level,
      imageUrl: this.form.value.imageUrl || undefined,
      reminderSent: this.form.value.reminderSent,
      organizerId: this.authService.getUserInfo()?.id || 'unknown'
    };

    const op$ = this.editingId
      ? this.evenementService.update(this.editingId, payload)
      : this.evenementService.create(payload);

    op$.subscribe({
      next: () => { this.isSubmitting = false; this.saved.emit(); },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l\'enregistrement.';
      }
    });
  }

  cancel(): void { this.cancelled.emit(); }

  // Helpers
  fieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c?.touched);
  }

  private toInputDateTime(iso: string): string {
    if (!iso) return '';
    return iso.length > 16 ? iso.substring(0, 16) : iso;
  }

  private toISO(dt: string): string {
    if (!dt) return '';
    return dt.includes('T') && !dt.includes(':00', dt.length - 3) ? dt + ':00' : dt;
  }
}
