import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Club, ClubService } from '../../services/club.service';


@Component({
  selector: 'app-gestionterrain',
  templateUrl: './gestionterrain.component.html',
  styleUrl: './gestionterrain.component.scss'
})
export class GestionterrainComponent {
clubs: Club[] = [];
  filteredClubs: Club[] = [];
 
  clubForm: FormGroup;
  isLoading       = false;
  isSubmitting    = false;
  showForm        = false;
  successMessage  = '';
  errorMessage    = '';
  deletingId: string | null = null;
 
  searchQuery     = '';
  sortField: keyof Club = 'nomClub';
  sortAsc         = true;
 
  constructor(private clubService: ClubService, private fb: FormBuilder) {
    this.clubForm = this.fb.group({
      nomClub:        ['', [Validators.required, Validators.minLength(2)]],
      debutTravail:   ['', Validators.required],
      finTravail:     ['', Validators.required],
      nombreTerrains: [1, [Validators.required, Validators.min(1)]],
      prix:           [0, [Validators.required, Validators.min(0)]]
    });
  }
 
  ngOnInit(): void { this.loadClubs(); }
 
  loadClubs(): void {
    this.isLoading = true;
    this.clubService.getAllClubs().subscribe({
      next: (data) => {
        this.clubs = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement.';
        this.isLoading = false;
      }
    });
  }
 
  onSearch(q: string): void {
    this.searchQuery = q;
    this.applyFilters();
  }
 
  setSort(field: keyof Club): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.applyFilters();
  }
 
  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    let list = [...this.clubs];
 
    if (q) {
      list = list.filter(c =>
        c.nomClub.toLowerCase().includes(q) ||
        String(c.prix).includes(q) ||
        String(c.nombreTerrains).includes(q)
      );
    }
 
    list.sort((a, b) => {
      const va = a[this.sortField] ?? '';
      const vb = b[this.sortField] ?? '';
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return this.sortAsc ? cmp : -cmp;
    });
 
    this.filteredClubs = list;
  }
 
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.clubForm.reset({ nombreTerrains: 1, prix: 0 });
      this.errorMessage = '';
    }
  }
 
 onSubmit(): void {
  if (this.clubForm.invalid) return;
  this.isSubmitting = true;
  this.errorMessage = '';

  // ✅ Cast explicite des nombres
  const payload: Club = {
    nomClub:        this.clubForm.value.nomClub?.trim(),
    debutTravail:   this.clubForm.value.debutTravail,
    finTravail:     this.clubForm.value.finTravail,
    nombreTerrains: Number(this.clubForm.value.nombreTerrains),
    prix:           Number(this.clubForm.value.prix)
  };

  console.log('Payload envoyé :', payload); // ← vérifiez dans la console

  this.clubService.createClub(payload).subscribe({
    next: (newClub) => {
      this.clubs.unshift(newClub);
      this.applyFilters();
      this.successMessage = `Club "${newClub.nomClub}" créé avec succès.`;
      this.clubForm.reset({ nombreTerrains: 1, prix: 0 });
      this.showForm = false;
      this.isSubmitting = false;
      setTimeout(() => this.successMessage = '', 4000);
    },
    error: (err) => {
      // ✅ Affiche le vrai message d'erreur MongoDB
      console.error('Erreur backend :', err.error);
      this.errorMessage = err.error?.error || 'Erreur inconnue.';
      this.isSubmitting = false;
    }
  });
}
  deleteClub(id: string, name: string): void {
    if (!confirm(`Supprimer définitivement "${name}" ?`)) return;
    this.deletingId = id;
    this.clubService.deleteClub(id).subscribe({
      next: () => {
        this.clubs = this.clubs.filter(c => c._id !== id);
        this.applyFilters();
        this.deletingId = null;
        this.successMessage = `Club "${name}" supprimé.`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
        this.deletingId = null;
      }
    });
  }
 
  get f() { return this.clubForm.controls; }
  get totalTerrains(): number { return this.clubs.reduce((s, c) => s + c.nombreTerrains, 0); }
  get avgPrix(): number {
    if (!this.clubs.length) return 0;
    return Math.round(this.clubs.reduce((s, c) => s + c.prix, 0) / this.clubs.length);
  }
}
