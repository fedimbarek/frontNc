import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';
import { ValidationService } from '../../../core/services/validation.service';
import { CartService } from '../../../core/services/cart.service';
import type { Cart } from '../../../shared/models/cart.model';

import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="container animate-up">
      <div class="page-header mt-3">
        <h1>📋 Finaliser la Commande</h1>
        <p class="text-muted">Presque terminé ! Veuillez confirmer vos informations de livraison.</p>
      </div>

      <div class="checkout-grid mt-2">
        <!-- Main Form -->
        <div class="main-form">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-container glass-card p-2">
            <h3 class="sh-title mb-2">Informations de Livraison</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Prénom</label>
                <input id="firstName" class="form-control" formControlName="firstName" placeholder="Jean" />
                @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) { <span class="form-error">Le prénom est requis</span> }
              </div>
              <div class="form-group">
                <label for="lastName">Nom</label>
                <input id="lastName" class="form-control" formControlName="lastName" placeholder="Dupont" />
                @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) { <span class="form-error">Le nom est requis</span> }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Email</label>
                <input id="email" type="email" class="form-control" formControlName="email" placeholder="jean.dupont@example.com" />
                @if (form.get('email')?.invalid && form.get('email')?.touched) { <span class="form-error">Email invalide</span> }
              </div>
              <div class="form-group">
                <label for="telephone">Téléphone</label>
                <input id="telephone" class="form-control" formControlName="telephone" placeholder="22111333" />
                @if (form.get('telephone')?.invalid && form.get('telephone')?.touched) { <span class="form-error">8 chiffres requis</span> }
              </div>
            </div>

            <div class="form-group">
              <label for="address">Adresse de livraison</label>
              <input id="address" class="form-control" formControlName="address" placeholder="Avenue du Padel, Résidence El Khalil" />
              @if (form.get('address')?.invalid && form.get('address')?.touched) { <span class="form-error">L'adresse est requise</span> }
            </div>

            <div class="form-row triplet">
              <div class="form-group">
                <label for="city">Ville</label>
                <input id="city" class="form-control" formControlName="city" placeholder="Tunis" />
                @if (form.get('city')?.invalid && form.get('city')?.touched) { <span class="form-error">Requis</span> }
              </div>
              <div class="form-group">
                <label for="state">Gouvernorat</label>
                <input id="state" class="form-control" formControlName="state" placeholder="Tunis" />
                @if (form.get('state')?.invalid && form.get('state')?.touched) { <span class="form-error">Requis</span> }
              </div>
              <div class="form-group">
                <label for="postalCode">Code postal</label>
                <input id="postalCode" class="form-control" formControlName="postalCode" placeholder="2000" />
                @if (form.get('postalCode')?.invalid && form.get('postalCode')?.touched) { <span class="form-error">4 chiffres</span> }
              </div>
            </div>

            <div class="form-group mt-2">
              <label for="paymentType">Mode de Paiement</label>
              <select id="paymentType" class="form-control" formControlName="paymentType">
                <option value="COD">💵 Paiement à la livraison</option>
                <option value="ONLINE">💳 Carte Bancaire (Tunisie)</option>
              </select>
            </div>

            @if (form.invalid && form.touched) {
              <div class="alert alert-warning mt-2">
                ⚠️ Veuillez corriger les erreurs dans le formulaire.
              </div>
            }

            <div class="mt-3">
              <button type="submit" class="btn btn-primary btn-lg w-full shadow-glow" [disabled]="form.invalid || hasInsufficientStock()">
                {{ hasInsufficientStock() ? '❌ Stock insuffisant' : '🚀 Confirmer ma Commande' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Order Sidebar Summary -->
        <div class="checkout-summary">
          <div class="glass-card p-2 shadow-premium">
            <h3 class="sh-title mb-2">Votre Panier</h3>
            <div class="checkout-items-list mb-2">
              @for (item of cartItems(); track item.id) {
                <div class="ci-row flex-between mb-1">
                  <div class="ci-info">
                    <div class="ci-name">{{ item.product.title }}</div>
                    <div class="ci-qty text-muted">x{{ item.quantity }}</div>
                  </div>
                  <div class="ci-price font-bold">
                    {{ (item.product.discountPrice ?? item.product.price) * item.quantity | number:'1.2-2' }} TND
                  </div>
                </div>
              }
            </div>
            
            <div class="summary-total mt-2 pt-2 border-t">
              <div class="flex-between">
                <span class="font-bold">Total Final</span>
                <span class="total-price font-extrabold">{{ total() | number:'1.2-2' }} TND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; padding-top: 1rem; background: #ffffff; min-height: 100vh; }
    .checkout-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
    .sh-title { font-size: 1.25rem; font-weight: 700; color: var(--color-primary-dark); }
    
    .form-container { width: 100%; border: 1px solid var(--color-border); background: #ffffff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.5rem; }
    .form-row.triplet { grid-template-columns: 1fr 1fr 120px; }
    
    .ci-row { font-size: 0.9rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f1f5f9; }
    .ci-name { color: #0f172a; font-weight: 600; }
    .ci-qty { font-size: 0.8rem; }
    
    .total-price { font-size: 1.4rem; color: var(--color-primary-dark); }
    .w-full { width: 100%; justify-content: center; }
    .font-bold { font-weight: 700; }
    .font-extrabold { font-weight: 800; }
    .border-t { border-top: 1px dashed var(--color-border); }
    
    .alert-warning { background: #fffbeb; border: 1px solid #fef3c7; color: var(--color-warning); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8rem; }

    @media (max-width: 992px) { 
      .checkout-grid { grid-template-columns: 1fr; }
      .form-row.triplet { grid-template-columns: 1fr 1fr; }
    }
  `,
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly msg = inject(MessageService);
  protected readonly vs = inject(ValidationService);

  readonly cartItems = signal<Cart[]>([]);
  readonly total = computed(() => this.cartItems().reduce((sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity, 0));
  readonly hasInsufficientStock = computed(() => this.cartItems().some(i => i.quantity > i.product.stock));

  ngOnInit(): void {
    this.cartService.getMyCart().subscribe(items => this.cartItems.set(items));
  }

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    paymentType: ['COD', Validators.required],
  });

  onSubmit(): void {
    console.log('[Checkout] onSubmit called');
    console.log('[Checkout] Form Valid:', this.form.valid);
    console.log('[Checkout] Form Value:', this.form.getRawValue());
    
    if (this.form.invalid) {
      console.warn('[Checkout] Submission blocked: Form is invalid');
      this.msg.error('Veuillez remplir correctement tous les champs requis.');
      this.form.markAllAsTouched();
      return;
    }

    if (this.hasInsufficientStock()) {
      console.warn('[Checkout] Submission blocked: Insufficient stock');
      this.msg.error('Certains articles ne sont plus en stock suffisant.');
      return;
    }

    this.orderService.placeOrder(this.form.getRawValue()).subscribe({
      next: () => {
        console.log('[Checkout] Order placed successfully');
        this.msg.success('Commande passée avec succès !');
        this.router.navigate(['/shop/my-orders']);
      },
      error: (err) => {
        console.error('[Checkout] Order placement failed:', err);
        this.vs.handleBackendErrors(this.form, err);
        if (!err.error?.fieldErrors) {
          this.msg.error('Erreur lors de la commande: ' + (err.error?.message || 'Serveur injoignable'));
        }
      }
    });
  }
}
