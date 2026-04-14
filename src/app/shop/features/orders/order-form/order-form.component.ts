import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { MessageService } from '../../../core/services/message.service';
import { ValidationService } from '../../../core/services/validation.service';
import type { ProductOrder, OrderStatusEnum } from '../../../shared/models/order.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container animate-up">
      <div class="page-header mt-3">
        <h1>✏️ Modifier la commande</h1>
        <p class="text-muted">Référence : #{{ orderId() }}</p>
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid-layout">
          <!-- Summary Card -->
          <div class="glass-card p-2 flex-between mb-2 col-span-2 shadow-premium border-teal">
            <div>
              <h3 class="sh-title">Informations de base</h3>
              <p class="mt-1"><strong>{{ productTitle() }}</strong> <span class="text-muted mx-1">|</span> {{ productPrice() }} TND</p>
            </div>
            <div class="status-selector">
              <label for="status" class="label-xs">Statut de la commande</label>
              <select id="status" class="form-control" formControlName="status">
                @for (st of statuses(); track st.id) {
                  <option [value]="st.name">{{ st.name }}</option>
                }
              </select>
            </div>
          </div>

          <div class="grid-layout col-span-2">
            <!-- Left Side: Quantity & Pricing -->
            <div class="glass-card p-2">
              <h3 class="sh-title mb-2">Quantité</h3>
              <div class="form-group">
                <label for="quantity">Nombre d'articles</label>
                <div class="qty-input-wrapper">
                  <input id="quantity" type="number" class="form-control" formControlName="quantity" min="1" />
                  <span class="qty-unit">Unité(s)</span>
                </div>
              </div>
            </div>

            <!-- Right Side: Shipping Address Summary / Edit -->
            <div class="glass-card p-2" formGroupName="orderAddress">
              <h3 class="sh-title mb-2">Destinataire</h3>
              <div class="grid-2">
                <div class="form-group">
                  <label for="firstName">Prénom</label>
                  <input id="firstName" class="form-control" formControlName="firstName" />
                </div>
                <div class="form-group">
                  <label for="lastName">Nom</label>
                  <input id="lastName" class="form-control" formControlName="lastName" />
                </div>
              </div>
            </div>
          </div>

          <!-- Full Width: Address Details -->
          <div class="glass-card p-2 mt-2 col-span-2" formGroupName="orderAddress">
            <h3 class="sh-title mb-2">Détails de Livraison</h3>
            <div class="grid-3">
              <div class="form-group col-span-2">
                <label for="email">Email de contact</label>
                <input id="email" type="email" class="form-control" formControlName="email" />
              </div>
              <div class="form-group">
                <label for="telephone">Téléphone</label>
                <input id="telephone" class="form-control" formControlName="telephone" [class.is-invalid]="vs.getErrorMessage(form.controls.orderAddress, 'telephone')" />
                @if (vs.getErrorMessage(form.controls.orderAddress, 'telephone'); as msg) { <span class="form-error">{{ msg }}</span> }
              </div>
              
              <div class="form-group col-span-3">
                <label for="address">Adresse complète</label>
                <textarea id="address" class="form-control" formControlName="address" rows="2"></textarea>
              </div>

              <div class="form-group">
                <label for="city">Ville</label>
                <input id="city" class="form-control" formControlName="city" />
              </div>
              <div class="form-group">
                <label for="state">État / Région</label>
                <input id="state" class="form-control" formControlName="state" />
              </div>
              <div class="form-group">
                <label for="postalCode">Code Postal</label>
                <input id="postalCode" class="form-control" formControlName="postalCode" [class.is-invalid]="vs.getErrorMessage(form.controls.orderAddress, 'postalCode')" />
                @if (vs.getErrorMessage(form.controls.orderAddress, 'postalCode'); as msg) { <span class="form-error">{{ msg }}</span> }
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-3 col-span-2">
            <button type="submit" class="btn btn-primary btn-lg shadow-glow" [disabled]="form.invalid">💾 Mettre à jour</button>
            <button type="button" class="btn btn-secondary btn-lg" (click)="goBack()">Annuler</button>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    :host { display: block; padding-top: 1rem; background: #ffffff; min-height: 100vh; }
    .form-grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 900px; margin-top: 2rem; }
    .grid-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; }
    
    .sh-title { font-size: 1.1rem; font-weight: 700; color: var(--color-primary-dark); border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
    
    .col-span-2 { grid-column: span 2; }
    .col-span-3 { grid-column: span 3; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    
    .border-teal { border-left: 4px solid var(--color-primary); }
    .label-xs { font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.25rem; display: block; }
    .mx-1 { margin-left: 0.5rem; margin-right: 0.5rem; }
    
    .qty-input-wrapper { position: relative; }
    .qty-unit { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--color-text-muted); }
    
    textarea.form-control { resize: vertical; background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
    .form-control { background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
    .form-control:focus { background: #ffffff; border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-bg); }
    
    @media (max-width: 768px) { 
      .form-grid-layout, .grid-layout, .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .col-span-2, .col-span-3 { grid-column: span 1; }
    }
  `,
})
export class OrderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly msg = inject(MessageService);
  protected readonly vs = inject(ValidationService);

  readonly loading = signal(true);
  readonly orderId = signal('');
  readonly productTitle = signal('');
  readonly productPrice = signal(0);
  readonly statuses = signal<OrderStatusEnum[]>([]);
  private internalId = 0;

  readonly form = this.fb.nonNullable.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    status: ['', Validators.required],
    orderAddress: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    }),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.internalId = +id;
      this.loadData();
    } else {
      this.router.navigate(['/shop/my-orders']);
    }
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      order: this.orderService.getById(this.internalId),
      stList: this.orderService.getStatuses()
    }).subscribe({
      next: ({ order, stList }) => {
        this.statuses.set(stList);
        this.orderId.set(order.orderId);
        this.productTitle.set(order.product?.title ?? 'Produit');
        this.productPrice.set(order.price);

        this.form.patchValue({
          quantity: order.quantity,
          status: order.status,
          orderAddress: {
            firstName: order.orderAddress?.firstName,
            lastName: order.orderAddress?.lastName,
            email: order.orderAddress?.email,
            telephone: order.orderAddress?.telephone,
            address: order.orderAddress?.address,
            city: order.orderAddress?.city,
            state: order.orderAddress?.state,
            postalCode: order.orderAddress?.postalCode,
          },
        });
        this.loading.set(false);
      },
      error: () => {
        this.msg.error('Erreur lors du chargement des données');
        this.router.navigate(['/shop/my-orders']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();
    this.orderService.update(this.internalId, data).subscribe({
      next: () => {
        this.msg.success('Commande mise à jour');
        this.router.navigate(['/shop/my-orders']);
      },
      error: (err) => {
        this.vs.handleBackendErrors(this.form.controls.orderAddress, err);
        if (!err.error?.fieldErrors) {
          this.msg.error('Erreur lors de la mise à jour');
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/shop/my-orders']);
  }
}
