import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { MessageService } from '../../../core/services/message.service';
import type { ProductOrder } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="container container--narrow animate-up">
      <div class="page-header flex-between mt-3">
        <div>
          <h1>📄 Détails de la commande</h1>
          @if (order(); as o) {
            <p class="text-muted">ID: #{{ o.orderId }}</p>
          }
        </div>
        <button class="btn btn-secondary" (click)="goBack()">← Retour</button>
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else {
        @if (order(); as o) {
          <div class="detail-grid mt-2">
            <!-- Tracking Timeline -->
            <div class="glass-card p-2 mb-2">
              <h3 class="sh-title mb-2">État de la commande</h3>
              <div class="timeline">
                <div class="timeline-step" [class.completed]="true">
                  <div class="step-dot">✓</div>
                  <div class="step-label">Reçue</div>
                </div>
                <div class="timeline-step" [class.completed]="o.status !== 'Pending'" [class.active]="o.status === 'In Progress'">
                  <div class="step-dot">{{ (o.status === 'Pending') ? '2' : '✓' }}</div>
                  <div class="step-label">En cours</div>
                </div>
                <div class="timeline-step" [class.completed]="o.status === 'Delivered' || o.status === 'Shipped'" [class.active]="o.status === 'Shipped'">
                  <div class="step-dot">{{ (o.status === 'Pending' || o.status === 'In Progress') ? '3' : '✓' }}</div>
                  <div class="step-label">Expédiée</div>
                </div>
                <div class="timeline-step" [class.active]="o.status === 'Delivered'">
                  <div class="step-dot">{{ o.status === 'Delivered' ? '✓' : '4' }}</div>
                  <div class="step-label">Livrée</div>
                </div>
              </div>
            </div>

            <div class="grid-2 gap-2">
              <!-- Info Card -->
              <div class="glass-card p-2">
                <h3 class="sh-title mb-2">Informations Générales</h3>
                <div class="info-row flex-between">
                  <span class="text-muted">Date :</span>
                  <strong>{{ o.orderDate }}</strong>
                </div>
                <div class="info-row flex-between mt-1">
                  <span class="text-muted">Paiement :</span>
                  <span class="badge badge-info">{{ o.paymentType === 'COD' ? 'Livraison' : 'En ligne' }}</span>
                </div>
                <div class="info-row flex-between mt-1">
                  <span class="text-muted">Statut :</span>
                  <span class="badge" [class]="getStatusClass(o.status)">{{ o.status }}</span>
                </div>
              </div>

              <!-- Product Card -->
              <div class="glass-card p-2">
                <h3 class="sh-title mb-2">Produit Commandé</h3>
                <div class="flex gap-2">
                  <div class="product-mini-img">🎾</div>
                  <div class="flex-grow">
                    <strong class="product-title">{{ o.product.title }}</strong>
                    <div class="flex-between mt-1">
                      <span class="text-muted">{{ o.quantity }} x {{ o.price | number:'1.2-2' }} TND</span>
                      <span class="price-total">{{ (o.price * o.quantity) | number:'1.2-2' }} TND</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="glass-card p-2 mt-2">
              <h3 class="sh-title mb-2">Adresse de livraison</h3>
              <div class="address-grid">
                <div class="address-item">
                  <span class="label">Destinataire</span>
                  <p>{{ o.orderAddress?.firstName }} {{ o.orderAddress?.lastName }}</p>
                </div>
                <div class="address-item">
                  <span class="label">Adresse</span>
                  <p>{{ o.orderAddress?.address }}</p>
                </div>
                <div class="address-item">
                  <span class="label">Ville / État</span>
                  <p>{{ o.orderAddress?.city }}, {{ o.orderAddress?.state }} {{ o.orderAddress?.postalCode }}</p>
                </div>
                <div class="address-item">
                  <span class="label">Contact</span>
                  <p>📞 {{ o.orderAddress?.telephone }}<br>✉️ {{ o.orderAddress?.email }}</p>
                </div>
              </div>
            </div>

            <div class="flex gap-2 mt-3">
              <button class="btn btn-primary shadow-glow" (click)="editOrder(o)">✏️ Modifier ma commande</button>
              <button class="btn btn-secondary" (click)="openMap(o.id)">🗺️ Suivre sur la carte</button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: `
    :host { display: block; padding-top: 1rem; background: #ffffff; min-height: 100vh; }
    .container--narrow { max-width: 850px; }
    .sh-title { font-size: 1.1rem; font-weight: 700; color: var(--color-primary-dark); border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
    
    .grid-2 { display: grid; grid-template-columns: 1.2fr 1fr; }
    
    /* Timeline */
    .timeline { display: flex; justify-content: space-between; padding: 1rem 0; position: relative; }
    .timeline::before { content: ''; position: absolute; top: 35px; left: 5%; width: 90%; height: 2px; background: #f1f5f9; z-index: 1; }
    
    .timeline-step { position: relative; z-index: 2; text-align: center; width: 80px; }
    .step-dot { 
      width: 32px; height: 32px; border-radius: 50%; background: #ffffff; border: 2px solid #e2e8f0;
      margin: 0 auto 0.5rem; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; color: #94a3b8; transition: 0.3s;
    }
    .step-label { font-size: 0.75rem; color: #64748b; }
    
    .timeline-step.completed .step-dot { background: var(--color-primary); border-color: var(--color-primary); color: #fff; box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
    .timeline-step.completed .step-label { color: #0f172a; font-weight: 600; }
    .timeline-step.active .step-dot { background: var(--color-info); border-color: #fff; color: #fff; transform: scale(1.2); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
    .timeline-step.active .step-label { color: var(--color-info); font-weight: bold; }

    /* Address Grid */
    .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .address-item .label { font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem; }
    .address-item p { font-size: 0.95rem; font-weight: 600; color: #1e293b; }

    .product-mini-img { width: 48px; height: 48px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid #f1f5f9; }
    .product-title { font-size: 1rem; color: #0f172a; font-weight: 700; }
    .price-total { font-weight: 800; font-size: 1.1rem; color: var(--color-primary-dark); }
    
    @media (max-width: 768px) { .grid-2, .address-grid { grid-template-columns: 1fr; } }
  `,
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly msg = inject(MessageService);

  readonly order = signal<ProductOrder | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(+id);
    } else {
      this.router.navigate(['/shop/my-orders']);
    }
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.orderService.getById(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => {
        this.msg.error('Commande introuvable');
        this.router.navigate(['/shop/my-orders']);
      },
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

  editOrder(order: ProductOrder): void {
    this.router.navigate(['/shop/my-orders', order.id, 'edit']);
  }

  openMap(orderId: number): void {
    window.open(`/assets/order-tracking-example.html?orderId=${orderId}`, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/shop/my-orders']);
  }
}
