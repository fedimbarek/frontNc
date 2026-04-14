import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../../services/complaint.service';
import { Complaint, ComplaintStatus } from '../../../models/complaint.model';
import { AuthService } from '../../../auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reclamations',
  templateUrl: './reclamations.component.html',
  styleUrls: ['./reclamations.component.scss']
})
export class ReclamationsComponent implements OnInit {

  // --- DATA ---
  allComplaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  paginatedComplaints: Complaint[] = [];

  // --- FILTERS ---
  searchKeyword = '';
  filterStatus: ComplaintStatus | '' = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  // --- PAGINATION ---
  currentPage = 0;
  pageSize = 6;
  totalPages = 0;

  // --- UI STATE ---
  showForm = false;
  showDetail = false;
  isEditing = false;
  isLoading = false;

  // --- FORM ---
  formComplaint: Complaint = { title: '', description: '' };
  selectedComplaint: Complaint | null = null;
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private complaintService: ComplaintService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  // ==================== DATA ====================

  loadComplaints(): void {
    this.isLoading = true;
    this.complaintService.getAll().subscribe({
      next: (data) => {
        this.allComplaints = data;
        this.isLoading = false;
        this.applyFilters();
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Erreur', 'Impossible de charger les réclamations', 'error');
      }
    });
  }

  // ==================== FILTER / SORT / PAGINATION ====================

  applyFilters(): void {
    let result = [...this.allComplaints];

    if (this.filterStatus) {
      result = result.filter(c => c.status === this.filterStatus);
    }

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.toLowerCase().trim();
      result = result.filter(c =>
        c.title.toLowerCase().includes(kw) ||
        c.description.toLowerCase().includes(kw)
      );
    }

    result.sort((a, b) => {
      const valA = a.createdAt || '';
      const valB = b.createdAt || '';
      return this.sortDirection === 'desc'
        ? valB.localeCompare(valA)
        : valA.localeCompare(valB);
    });

    this.filteredComplaints = result;
    this.totalPages = Math.ceil(result.length / this.pageSize);
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }
    this.updatePage();
  }

  updatePage(): void {
    const start = this.currentPage * this.pageSize;
    this.paginatedComplaints = this.filteredComplaints.slice(start, start + this.pageSize);
  }

  onSearchChange(): void { this.currentPage = 0; this.applyFilters(); }
  onFilterChange(): void { this.currentPage = 0; this.applyFilters(); }
  toggleSort(): void {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePage();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  // ==================== CRUD ====================

  openCreateForm(): void {
    this.isEditing = false;
    this.formComplaint = { title: '', description: '' };
    this.errorMessage = '';
    this.showForm = true;
  }

  openEditForm(complaint: Complaint): void {
    if (complaint.status !== 'EN_ATTENTE') {
      Swal.fire('Action impossible', 'Seules les réclamations "En attente" peuvent être modifiées.', 'warning');
      return;
    }
    this.isEditing = true;
    this.formComplaint = { ...complaint };
    this.errorMessage = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.errorMessage = '';
    this.fieldErrors = {};
  }

  submitForm(): void {
    this.errorMessage = '';
    this.fieldErrors = {};
    if (this.isEditing && this.formComplaint.id) {
      this.complaintService.update(this.formComplaint.id, this.formComplaint).subscribe({
        next: () => {
          this.closeForm();
          this.loadComplaints();
          Swal.fire({ icon: 'success', title: 'Modifiée !', text: 'Votre réclamation a été modifiée.', timer: 2000, showConfirmButton: false });
        },
        error: (err) => {
          this.extractErrors(err);
        }
      });
    } else {
      this.complaintService.create(this.formComplaint).subscribe({
        next: () => {
          this.closeForm();
          this.loadComplaints();
          Swal.fire({ icon: 'success', title: 'Envoyée !', text: 'Votre réclamation a été soumise avec succès.', timer: 2500, showConfirmButton: false });
        },
        error: (err) => {
          this.extractErrors(err);
        }
      });
    }
  }

  openDetail(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedComplaint = null;
  }

  // ==================== HELPERS ====================

  getStatusLabel(status?: ComplaintStatus): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'TRAITEE': return 'Traitée';
      case 'REJETEE': return 'Rejetée';
      default: return '—';
    }
  }

  getStatusClass(status?: ComplaintStatus): string {
    switch (status) {
      case 'EN_ATTENTE': return 'status-pending';
      case 'TRAITEE': return 'status-done';
      case 'REJETEE': return 'status-rejected';
      default: return '';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  canEdit(complaint: Complaint): boolean {
    return complaint.status === 'EN_ATTENTE';
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  private extractErrors(err: any): void {
    if (err.error?.errors && typeof err.error.errors === 'object') {
      // Field-level validation errors from @Valid
      this.fieldErrors = err.error.errors;
      this.errorMessage = err.error.message || 'Les données saisies sont invalides';
    } else {
      this.errorMessage = err.error?.message || err.error || 'Une erreur est survenue';
      this.fieldErrors = {};
    }
  }
}
