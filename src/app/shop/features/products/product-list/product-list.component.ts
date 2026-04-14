import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../core/services/message.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import type { Product } from '../../../shared/models/product.model';
import type { Category } from '../../../shared/models/category.model';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [RouterLink, FormsModule, PaginationComponent, DecimalPipe],
    template: `
    <div class="container animate-up">
      <!-- Minimalist Header -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1>🎾 Padel Selection</h1>
          <p>Équipez-vous avec les meilleurs produits sélectionnés pour vous.</p>
        </div>
      </div>

      <div class="shop-controls flex-between mb-3">
        <div class="search-wrap">
          <input type="text" class="search-input" placeholder="Rechercher..." [ngModel]="search()" (ngModelChange)="onSearch($event)" />
        </div>
        
        <div class="category-filters flex gap-1">
          <button class="pill" [class.active]="selectedCategory() === ''" (click)="onCategoryFilter('')">Tout</button>
          @for (cat of categories(); track cat.id) {
            <button class="pill" [class.active]="selectedCategory() === cat.name" (click)="onCategoryFilter(cat.name)">{{ cat.name }}</button>
          }
        </div>

        @if (auth.isAdmin()) {
          <a routerLink="/shop/admin/products/create" class="btn btn-primary shadow-glow">+ Produit</a>
        }
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else if (products().length === 0) {
        <div class="empty-state glass-card p-2 text-center">
            <div class="empty-state__icon" style="font-size: 3rem;">📦</div>
            <div class="empty-state__title mt-1">Aucun produit trouvé</div>
            <p class="text-muted">Essayez avec d'autres critères de recherche</p>
        </div>
      } @else {
        <div class="product-grid">
          @for (p of products(); track p.id) {
            <div class="card product-card">
              <div class="card-image-wrapper">
                <img [src]="productService.getImageUrl(p.image!)" [alt]="p.title" loading="lazy" class="product-img">
                @if (p.discount > 0) {
                  <span class="discount-label">-{{ p.discount }}%</span>
                }
              </div>
              
              <div class="card-content">
                <div class="category-tag">{{ p.category }}</div>
                <h3 class="product-title" [title]="p.title">{{ p.title }}</h3>
                
                <div class="price-row flex-between mt-1">
                  <div class="price-wrap">
                    <span class="curr-price">{{ p.discountPrice | number:'1.2-2' }} TND</span>
                    @if (p.discount > 0) {
                      <span class="old-price">{{ p.price | number:'1.2-2' }} TND</span>
                    }
                  </div>
                </div>
              </div>

              <div class="card-actions">
                @if (auth.isAdmin()) {
                  <div class="admin-actions flex gap-1">
                    <button class="btn btn-primary flex-1 btn-sm" (click)="addToCart(p)" [disabled]="p.stock <= 0">
                      {{ p.stock > 0 ? '+ Panier' : 'Vendu' }}
                    </button>
                    <a [routerLink]="['/shop/admin/products', p.id, 'edit']" class="btn btn-secondary btn-sm" title="Modifier">✏️</a>
                    <button class="btn btn-danger btn-sm" (click)="deleteProduct(p)" title="Supprimer">🗑️</button>
                  </div>
                } @else {
                   <button class="btn btn-primary w-full" (click)="addToCart(p)" [disabled]="p.stock <= 0">
                     {{ p.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock' }}
                   </button>
                }
                <a [routerLink]="['/shop/products', p.id]" class="view-detail">Voir les détails</a>
              </div>
            </div>
          }
        </div>

        <div class="mt-3">
          <app-pagination [pageNo]="pageNo()" [totalPages]="totalPages()" [totalElements]="totalElements()" [first]="first()"
            [last]="last()" (pageChange)="onPageChange($event)" />
        </div>
      }
    </div>
  `,
    styles: `
    :host { display: block; padding: 1rem 0 3rem; background: #ffffff; }
    
    .shop-controls { flex-wrap: wrap; gap: 1rem; }
    .search-input { 
      padding: 0.75rem 1rem; border: 1px solid var(--color-border); border-radius: 99px; width: 300px; 
      background: var(--color-surface-hover); font-size: 0.9rem; outline: none; transition: 0.2s;
    }
    .search-input:focus { border-color: var(--color-primary); background: #ffffff; box-shadow: 0 0 0 4px var(--color-primary-bg); }

    .pill { 
      padding: 0.5rem 1.25rem; border-radius: 99px; border: 1px solid var(--color-border);
      background: #ffffff; color: var(--color-text-muted); cursor: pointer; transition: 0.2s; font-size: 0.85rem;
    }
    .pill.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); font-weight: 600; }
    .pill:hover:not(.active) { background: var(--color-surface-hover); }

    .product-grid { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2rem; 
      margin-top: 1rem; 
    }

    .product-card { 
      display: flex; flex-direction: column; height: 100%; background: #ffffff; 
      border: 1px solid var(--color-border); border-radius: 12px; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .product-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); border-color: var(--color-primary-light); }

    .card-image-wrapper { 
      position: relative; width: 100%; aspect-ratio: 1/1; background: #f8fafc; overflow: hidden; 
      border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center;
    }
    .product-img { width: 90%; height: 90%; object-fit: contain; transition: 0.5s; }
    .product-card:hover .product-img { transform: scale(1.05); }

    .discount-label { 
      position: absolute; top: 1rem; right: 1rem; background: var(--color-danger); color: #fff; 
      padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 800; 
    }

    .card-content { padding: 1.25rem; flex-grow: 1; }
    .category-tag { font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 0.05em; margin-bottom: 0.25rem; }
    .product-title { font-size: 1rem; font-weight: 700; color: var(--color-text); margin-bottom: 0.5rem; line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; height: 2.8rem; }
    
    .curr-price { font-size: 1.15rem; font-weight: 800; color: var(--color-primary-dark); }
    .old-price { font-size: 0.85rem; text-decoration: line-through; color: var(--color-text-muted); margin-left: 0.5rem; }

    .card-actions { padding: 0 1.25rem 1.25rem; }
    .view-detail { display: block; text-align: center; margin-top: 0.75rem; font-size: 0.8rem; color: var(--color-text-muted); text-decoration: none; transition: 0.2s; }
    .view-detail:hover { color: var(--color-primary); text-decoration: underline; }
    
    .w-full { width: 100%; justify-content: center; }
  `,
})
export class ProductListComponent implements OnInit {
    protected readonly productService = inject(ProductService);
    private readonly cartService = inject(CartService);
    private readonly categoryService = inject(CategoryService);
    readonly auth = inject(AuthService);
    private readonly msg = inject(MessageService);

    readonly products = signal<Product[]>([]);
    readonly categories = signal<Category[]>([]);
    readonly loading = signal(true);
    readonly search = signal('');
    readonly selectedCategory = signal('');

    readonly pageNo = signal(0);
    readonly totalPages = signal(0);
    readonly totalElements = signal(0);
    readonly first = signal(true);
    readonly last = signal(true);

    ngOnInit(): void {
        this.categoryService.getActive().subscribe(c => this.categories.set(c));
        this.loadProducts();
    }

    loadProducts(): void {
        this.loading.set(true);
        this.productService.getActive(this.pageNo(), 12, this.selectedCategory(), this.search())
            .subscribe({
                next: res => {
                    this.products.set(res.content);
                    this.pageNo.set(res.pageNo);
                    this.totalPages.set(res.totalPages);
                    this.totalElements.set(res.totalElements);
                    this.first.set(res.first);
                    this.last.set(res.last);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            });
    }

    onSearch(term: string): void {
        this.search.set(term);
        this.pageNo.set(0);
        this.loadProducts();
    }

    onCategoryFilter(cat: string): void {
        this.selectedCategory.set(cat);
        this.pageNo.set(0);
        this.loadProducts();
    }

    onPageChange(page: number): void {
        this.pageNo.set(page);
        this.loadProducts();
    }

    addToCart(product: Product): void {
        if (!this.auth.isLoggedIn()) { this.msg.error('Veuillez vous connecter'); return; }
        this.cartService.add(product.id).subscribe({
            next: () => this.msg.success(`"${product.title}" ajouté au panier`),
            error: (err) => {
                console.error('Erreur AddToCart:', err);
                this.msg.error('Impossible d\'ajouter au panier. Vérifiez les logs.');
            }
        });
    }

    deleteProduct(p: Product): void {
        if (!confirm(`Supprimer « ${p.title} » ?`)) return;
        this.productService.delete(p.id).subscribe({
            next: () => {
                this.msg.success('Produit supprimé');
                this.loadProducts();
            },
            error: () => this.msg.error('Erreur lors de la suppression'),
        });
    }
}
