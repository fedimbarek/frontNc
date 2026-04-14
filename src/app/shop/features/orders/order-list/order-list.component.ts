import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import type { ProductOrder } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [DecimalPipe, ConfirmDialogComponent],
  template: `
    <div class="container animate-up">
      <div class="page-header mt-3">
        <h1>📦 Mes Commandes</h1>
        <p class="text-muted">Historique de vos achats et suivi en temps réel</p>
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else if (orders().length === 0) {
        <div class="empty-state glass-card p-2 text-center">
          <div class="empty-state__icon" style="font-size: 4rem;">📦</div>
          <div class="empty-state__title mt-1">Aucune commande</div>
          <p class="text-muted mb-2">Vous n'avez pas encore passé de commande sur notre boutique.</p>
          <a routerLink="/shop/products" class="btn btn-primary">Commencer mes achats</a>
        </div>
      } @else {
        <div class="table-wrap glass-card shadow-premium">
          <table>
            <thead>
              <tr>
                <th>Référence / Produit</th>
                <th>Date</th>
                <th class="text-center">Qté</th>
                <th>Prix Total</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (o of orders(); track o.id) {
                <tr class="hover-row">
                  <td>
                    <div class="product-cell">
                      <div class="order-id">#{{ o.orderId }}</div>
                      <div class="product-title">{{ o.product.title }}</div>
                    </div>
                  </td>
                  <td><span class="text-sm">{{ o.orderDate }}</span></td>
                  <td class="text-center"><strong>{{ o.quantity }}</strong></td>
                  <td><span class="price-text">{{ (o.price * o.quantity) | number:'1.2-2' }} TND</span></td>
                  <td><span class="badge" [class]="getStatusClass(o.status)">{{ o.status }}</span></td>
                  <td class="text-right">
                    <div class="flex gap-1 justify-end">
                      <button class="btn-action btn-view" (click)="viewOrder(o)" title="Détails">👁️</button>
                      <button class="btn-action btn-edit" (click)="editOrder(o)" title="Modifier">✏️</button>
                      <button class="btn-action btn-delete" (click)="confirmDelete(o)" title="Supprimer">🗑️</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (deletingOrder(); as order) {
        <app-confirm-dialog title="Supprimer la commande" [message]="'Voulez-vous vraiment supprimer la commande ' + order.orderId + ' ?'" (confirm)="doDelete(order)" (cancel)="deletingOrder.set(null)" />
      }
    </div>
  `,
  styles: `
    :host { display: block; padding-top: 1rem; background: #ffffff; min-height: 100vh; }
    .page-header h1 { font-size: 2rem; color: var(--color-primary-dark); }
    
    .product-cell { display: flex; flex-direction: column; }
    .order-id { font-family: monospace; font-size: 0.75rem; color: var(--color-primary); opacity: 0.8; }
    .product-title { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
    
    .price-text { font-weight: 700; color: #0f172a; }
    .text-sm { font-size: 0.85rem; color: var(--color-text-muted); }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .justify-end { justify-content: flex-end; }
    
    .btn-action {
      width: 34px; height: 34px; border-radius: 8px; border: 1px solid #f1f5f9;
      background: #f8fafc; color: #334155; cursor: pointer; transition: 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .btn-view:hover { background: var(--color-info); color: #fff; border-color: var(--color-info); }
    .btn-edit:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
    .btn-delete:hover { background: var(--color-danger); color: #fff; border-color: var(--color-danger); }
    
    .table-wrap { background: #ffffff; border-color: #f1f5f9; }
    th { background: #f8fafc !important; color: #64748b !important; }
  `,
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly msg = inject(MessageService);

  readonly orders = signal<ProductOrder[]>([]);
  readonly loading = signal(true);
  readonly deletingOrder = signal<ProductOrder | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    if (!this.auth.isLoggedIn()) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Delivered': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      case 'Shipped': case 'In Progress': return 'badge-info';
      default: return 'badge-warning';
    }
  }

  viewOrder(order: ProductOrder): void {
    this.router.navigate(['/shop/my-orders', order.id]);
  }

  editOrder(order: ProductOrder): void {
    this.router.navigate(['/shop/my-orders', order.id, 'edit']);
  }

  confirmDelete(order: ProductOrder): void {
    this.deletingOrder.set(order);
  }

  doDelete(order: ProductOrder): void {
    this.orderService.delete(order.id).subscribe({
      next: () => {
        this.msg.success('Commande supprimée');
        this.deletingOrder.set(null);
        this.refresh();
      },
      error: () => this.msg.error('Erreur lors de la suppression'),
    });
  }
}
