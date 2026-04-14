import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';
import type { Cart } from '../../../shared/models/cart.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="container animate-up">
      <div class="page-header mt-3">
        <h1>🛒 Mon Panier</h1>
        <p class="text-muted">Gérez vos articles avant de finaliser la commande</p>
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else if (items().length === 0) {
        <div class="empty-state glass-card p-2 text-center">
          <div class="empty-state__icon" style="font-size: 4rem;">🛒</div>
          <div class="empty-state__title mt-1">Votre panier est vide</div>
          <p class="text-muted mb-3">Explorez nos produits Padel pour commencer vos achats</p>
          <a routerLink="/shop/products" class="btn btn-primary btn-lg">Découvrir la boutique</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            <div class="table-wrap glass-card">
              <table>
                <thead><tr><th>Produit</th><th class="text-center">Prix</th><th class="text-center">Quantité</th><th class="text-right">Total</th><th></th></tr></thead>
                <tbody>
                  @for (item of items(); track item.id) {
                    <tr class="cart-row">
                      <td>
                        <div class="flex gap-2" style="align-items: center;">
                          <div class="cart-thumb-wrapper">
                            <img [src]="productService.getImageUrl(item.product.image!)" [alt]="item.product.title" class="cart-thumb" onerror="this.src='https://placehold.co/100x100?text=Padel'">
                          </div>
                          <div class="info">
                            <strong class="product-name">{{ item.product.title }}</strong>
                            <div class="stock-info" [class.text-danger]="item.quantity > item.product.stock">
                              {{ item.product.stock > 0 ? (item.product.stock + ' en stock') : 'En rupture' }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="text-center">{{ (item.product.discountPrice ?? item.product.price) | number:'1.2-2' }} TND</td>
                      <td>
                        <div class="qty-group">
                          <button class="qty-btn" (click)="updateQty(item.id, 'de')" [disabled]="item.quantity <= 1">−</button>
                          <span class="qty-val">{{ item.quantity }}</span>
                          <button class="qty-btn" (click)="updateQty(item.id, 'in')">+</button>
                        </div>
                      </td>
                      <td class="price text-right">{{ (item.product.discountPrice ?? item.product.price) * item.quantity | number:'1.2-2' }} TND</td>
                      <td class="text-center"><button class="btn-icon-danger" (click)="remove(item.id)" title="Supprimer">✕</button></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="cart-summary glass-card p-2 shadow-premium">
            <h3 class="sh-title">Résumé du Paiement</h3>
            
            <div class="summary-details mt-2">
              <div class="summary-row">
                <span>Sous-total</span>
                <span>{{ total() | number:'1.2-2' }} TND</span>
              </div>
              <div class="summary-row">
                <span>Livraison</span>
                <span class="text-success">Gratuite</span>
              </div>
            </div>

            <div class="summary-total mt-2">
              <span>Total à payer</span>
              <span class="total-price">{{ total() | number:'1.2-2' }} TND</span>
            </div>

            @if (hasInsufficientStock()) {
              <div class="alert alert-danger mt-2">
                ⚠️ Un ou plusieurs articles ont un stock insuffisant.
              </div>
              <button class="btn btn-secondary btn-lg w-full mt-2" disabled>Stock Insuffisant</button>
            } @else {
              <a routerLink="/shop/checkout" class="btn btn-primary btn-lg w-full mt-2 shadow-glow">Passer au Paiement</a>
            }
            
            <div class="mt-2 text-center">
              <a routerLink="/shop/products" class="text-link text-sm">← Continuer mes achats</a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; padding-top: 1rem; background: #ffffff; min-height: 100vh; }
    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; margin-top: 2rem; }
    
    .sh-title { font-size: 1.25rem; font-weight: 700; color: var(--color-primary-dark); }
    .product-name { font-size: 1rem; color: #0f172a; font-weight: 600; }
    .stock-info { font-size: 0.75rem; color: var(--color-text-muted); }
    
    .cart-thumb-wrapper { width: 64px; height: 64px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--color-border); background: #f8fafc; }
    .cart-thumb { width:100%; height:100%; object-fit: contain; }
    
    .qty-group { display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 99px; padding: 2px; border: 1px solid var(--color-border); width: fit-content; margin: 0 auto; }
    .qty-btn { width: 28px; height: 28px; border-radius: 50%; border: none; background: transparent; color: var(--color-text); cursor: pointer; transition: 0.2s; font-weight: bold; }
    .qty-btn:hover { background: var(--color-primary); color: #fff; }
    .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-val { width: 32px; text-align: center; font-weight: 700; font-size: 0.9rem; }
    
    .summary-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; color: var(--color-text-muted); }
    .summary-total { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #f0fdf4; }
    .summary-total span { font-weight: 800; font-size: 1.2rem; color: #0f172a; }
    .total-price { color: var(--color-primary-dark); }
    
    .btn-icon-danger { width: 32px; height: 32px; border-radius: 50%; border: none; background: #fef2f2; color: var(--color-danger); cursor: pointer; transition: 0.2s; }
    .btn-icon-danger:hover { background: var(--color-danger); color: #fff; }
    
    .w-full { width: 100%; justify-content: center; }
    .text-right { text-align: right; }
    .text-sm { font-size: 0.85rem; }
    .text-link { color: var(--color-text-muted); text-decoration: none; transition: 0.2s; }
    .text-link:hover { color: var(--color-primary); }

    .alert-danger { background: #fef2f2; border: 1px solid #fee2e2; color: var(--color-danger); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.8rem; }
    
    @media (max-width: 992px) { .cart-layout { grid-template-columns: 1fr; } }
  `,
})
export class CartPageComponent implements OnInit {
  private readonly cartService = inject(CartService);
  protected readonly productService = inject(ProductService);
  private readonly auth = inject(AuthService);
  private readonly msg = inject(MessageService);

  readonly items = signal<Cart[]>([]);
  readonly loading = signal(true);
  readonly total = computed(() => this.items().reduce((sum, i) => sum + (i.product.discountPrice ?? i.product.price) * i.quantity, 0));
  readonly hasInsufficientStock = computed(() => this.items().some(i => i.quantity > i.product.stock));

  ngOnInit(): void { this.load(); }

  load(): void {
    if (!this.auth.isLoggedIn()) {
      this.loading.set(false);
      return;
    }
    this.cartService.getMyCart().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  updateQty(id: number, action: 'de' | 'in'): void {
    this.cartService.updateQuantity(id, action).subscribe(() => this.load());
  }

  remove(id: number): void {
    this.cartService.remove(id).subscribe(() => { this.msg.success('Article retiré'); this.load(); });
  }
}
