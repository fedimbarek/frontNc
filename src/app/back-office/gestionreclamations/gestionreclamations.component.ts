import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { ComplaintResponseService } from '../../services/complaint-response.service';
import { Complaint, ComplaintResponse, ComplaintStatus, DashboardStats } from '../../models/complaint.model';
import { ChartConfiguration, ChartData } from 'chart.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestionreclamations',
  templateUrl: './gestionreclamations.component.html',
  styleUrls: ['./gestionreclamations.component.scss']
})
export class GestionreclamationsComponent implements OnInit {

  // --- DATA ---
  complaints: Complaint[] = [];
  filteredComplaints: Complaint[] = [];
  paginatedComplaints: Complaint[] = [];

  // --- FILTERS ---
  searchKeyword = '';
  filterStatus: ComplaintStatus | '' = '';
  sortField: 'createdAt' | 'title' | 'status' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // --- PAGINATION ---
  currentPage = 0;
  pageSize = 8;
  totalPages = 0;

  // --- MODALS ---
  showFormModal = false;
  showResponseModal = false;
  showDetailModal = false;
  isEditing = false;

  // --- FORM DATA ---
  formComplaint: Complaint = { title: '', description: '' };
  formResponse: ComplaintResponse = { message: '' };
  selectedComplaint: Complaint | null = null;
  isEditingResponse = false;

  // --- STATS ---
  showStats = false;
  stats: DashboardStats | null = null;

  // --- ERROR HANDLING ---
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};

  // --- CHARTS ---
  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  monthlyChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  monthlyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  dailyChartData: ChartData<'line'> = { labels: [], datasets: [] };
  dailyChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  constructor(
    private complaintService: ComplaintService,
    private responseService: ComplaintResponseService
  ) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  // ==================== DATA LOADING ====================

  loadComplaints(): void {
    this.complaintService.getAll().subscribe({
      next: (data) => {
        this.complaints = data;
        this.applyFilters();
      },
      error: () => {
        this.showError('Erreur lors du chargement des réclamations');
      }
    });
  }

  loadStats(): void {
    this.complaintService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildCharts();
      },
      error: () => {
        this.showError('Erreur lors du chargement des statistiques');
      }
    });
  }

  // ==================== FILTERING / SORTING / PAGINATION ====================

  applyFilters(): void {
    let result = [...this.complaints];

    // Filter by status
    if (this.filterStatus) {
      result = result.filter(c => c.status === this.filterStatus);
    }

    // Search by keyword
    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.toLowerCase().trim();
      result = result.filter(c =>
        c.title.toLowerCase().includes(kw) ||
        c.description.toLowerCase().includes(kw)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: any, valB: any;
      switch (this.sortField) {
        case 'title':
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
        case 'createdAt':
        default:
          valA = a.createdAt || '';
          valB = b.createdAt || '';
          break;
      }
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });

    this.filteredComplaints = result;
    this.totalPages = Math.ceil(this.filteredComplaints.length / this.pageSize);
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }
    this.updatePage();
  }

  updatePage(): void {
    const start = this.currentPage * this.pageSize;
    this.paginatedComplaints = this.filteredComplaints.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  onFilterStatusChange(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  toggleSort(field: 'createdAt' | 'title' | 'status'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
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

  // ==================== CRUD COMPLAINTS ====================

  openCreateModal(): void {
    this.isEditing = false;
    this.formComplaint = { title: '', description: '' };
    this.errorMessage = '';
    this.showFormModal = true;
  }

  openEditModal(complaint: Complaint): void {
    this.isEditing = true;
    this.formComplaint = { ...complaint };
    this.errorMessage = '';
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.errorMessage = '';
    this.fieldErrors = {};
  }

  saveComplaint(): void {
    this.errorMessage = '';
    this.fieldErrors = {};
    if (this.isEditing && this.formComplaint.id) {
      this.complaintService.update(this.formComplaint.id, this.formComplaint).subscribe({
        next: () => {
          this.closeFormModal();
          this.loadComplaints();
          Swal.fire('Succès', 'Réclamation modifiée avec succès', 'success');
        },
        error: (err) => { this.extractErrors(err); }
      });
    } else {
      this.complaintService.create(this.formComplaint).subscribe({
        next: () => {
          this.closeFormModal();
          this.loadComplaints();
          Swal.fire('Succès', 'Réclamation créée avec succès', 'success');
        },
        error: (err) => { this.extractErrors(err); }
      });
    }
  }

  deleteComplaint(complaint: Complaint): void {
    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer la réclamation "${complaint.title}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed && complaint.id) {
        this.complaintService.delete(complaint.id).subscribe({
          next: () => {
            this.loadComplaints();
            Swal.fire('Supprimé', 'La réclamation a été supprimée', 'success');
          },
          error: () => {
            this.showError('Erreur lors de la suppression');
          }
        });
      }
    });
  }

  changeStatus(complaint: Complaint, newStatus: ComplaintStatus): void {
    const updated: Complaint = { ...complaint, status: newStatus };
    this.complaintService.update(complaint.id!, updated).subscribe({
      next: () => {
        this.loadComplaints();
        Swal.fire('Succès', `Statut changé en "${this.getStatusLabel(newStatus)}"`, 'success');
      },
      error: () => {
        this.showError('Erreur lors du changement de statut');
      }
    });
  }

  // ==================== DETAIL ====================

  openDetail(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedComplaint = null;
  }

  // ==================== RESPONSES ====================

  openResponseModal(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.errorMessage = '';
    if (complaint.response) {
      this.isEditingResponse = true;
      this.formResponse = { ...complaint.response };
    } else {
      this.isEditingResponse = false;
      this.formResponse = { message: '', complaint: { id: complaint.id! } };
    }
    this.showResponseModal = true;
  }

  closeResponseModal(): void {
    this.showResponseModal = false;
    this.errorMessage = '';
    this.fieldErrors = {};
  }

  saveResponse(): void {
    this.errorMessage = '';
    this.fieldErrors = {};
    if (this.isEditingResponse && this.formResponse.id) {
      this.responseService.update(this.formResponse.id, this.formResponse).subscribe({
        next: () => {
          this.closeResponseModal();
          this.loadComplaints();
          Swal.fire('Succès', 'Réponse modifiée avec succès', 'success');
        },
        error: (err) => { this.extractErrors(err); }
      });
    } else {
      this.responseService.create(this.formResponse).subscribe({
        next: () => {
          this.closeResponseModal();
          this.loadComplaints();
          Swal.fire('Succès', 'Réponse ajoutée avec succès', 'success');
        },
        error: (err) => { this.extractErrors(err); }
      });
    }
  }

  deleteResponse(complaint: Complaint): void {
    if (!complaint.response?.id) return;

    Swal.fire({
      title: 'Confirmer la suppression',
      text: 'Voulez-vous vraiment supprimer cette réponse ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.responseService.delete(complaint.response!.id!).subscribe({
          next: () => {
            this.loadComplaints();
            Swal.fire('Supprimé', 'La réponse a été supprimée', 'success');
          },
          error: () => {
            this.showError('Erreur lors de la suppression de la réponse');
          }
        });
      }
    });
  }

  // ==================== STATS ====================

  toggleStats(): void {
    this.showStats = !this.showStats;
    if (this.showStats && !this.stats) {
      this.loadStats();
    }
  }

  buildCharts(): void {
    if (!this.stats) return;

    // Doughnut — status distribution
    this.statusChartData = {
      labels: ['En attente', 'Traitée', 'Rejetée'],
      datasets: [{
        data: [this.stats.en_attente, this.stats.traitee, this.stats.rejetee],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
        hoverBackgroundColor: ['#d97706', '#059669', '#dc2626'],
        borderWidth: 0
      }]
    };

    // Bar — monthly
    const monthLabels = Object.keys(this.stats.byMonth);
    const monthValues = Object.values(this.stats.byMonth);
    this.monthlyChartData = {
      labels: monthLabels,
      datasets: [{
        data: monthValues,
        backgroundColor: '#6366f1',
        borderRadius: 6,
        barThickness: 28
      }]
    };

    // Line — daily
    const dayLabels = Object.keys(this.stats.byDay);
    const dayValues = Object.values(this.stats.byDay);
    this.dailyChartData = {
      labels: dayLabels,
      datasets: [{
        data: dayValues,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }]
    };
  }

  // ==================== HELPERS ====================

  getStatusLabel(status?: ComplaintStatus): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'TRAITEE': return 'Traitée';
      case 'REJETEE': return 'Rejetée';
      default: return 'Inconnu';
    }
  }

  getStatusClass(status?: ComplaintStatus): string {
    switch (status) {
      case 'EN_ATTENTE': return 'badge-warning';
      case 'TRAITEE': return 'badge-success';
      case 'REJETEE': return 'badge-danger';
      default: return 'badge-default';
    }
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  private showError(msg: string): void {
    Swal.fire('Erreur', msg, 'error');
  }

  private extractErrors(err: any): void {
    if (err.error?.errors && typeof err.error.errors === 'object') {
      this.fieldErrors = err.error.errors;
      this.errorMessage = err.error.message || 'Les données saisies sont invalides';
    } else {
      this.errorMessage = err.error?.message || err.error || 'Une erreur est survenue';
      this.fieldErrors = {};
    }
  }
}
