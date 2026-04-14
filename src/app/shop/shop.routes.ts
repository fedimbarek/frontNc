import { Routes } from '@angular/router';
import { ShopLayoutComponent } from './shop-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const SHOP_ROUTES: Routes = [
  {
    path: '',
    component: ShopLayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },

      // Public — Products
      { 
        path: 'products', 
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) 
      },
      { 
        path: 'products/:id', 
        loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) 
      },

      // Auth-protected
      { 
        path: 'cart', 
        canActivate: [authGuard], 
        loadComponent: () => import('./features/cart/cart-page/cart-page.component').then(m => m.CartPageComponent) 
      },
      { 
        path: 'checkout', 
        canActivate: [authGuard], 
        loadComponent: () => import('./features/orders/checkout/checkout.component').then(m => m.CheckoutComponent) 
      },
      { 
        path: 'my-orders', 
        canActivate: [authGuard], 
        loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent) 
      },
      { 
        path: 'my-orders/:id', 
        canActivate: [authGuard], 
        loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent) 
      },
      { 
        path: 'my-orders/:id/edit', 
        canActivate: [authGuard], 
        loadComponent: () => import('./features/orders/order-form/order-form.component').then(m => m.OrderFormComponent) 
      },

      // Admin
      {
        path: 'admin', 
        canActivate: [authGuard, adminGuard], 
        children: [
          { 
            path: 'products', 
            children: [
              {
                path: '',
                loadComponent: () => import('./features/admin/admin-product-list/admin-product-list.component').then(m => m.AdminProductListComponent)
              },
              {
                path: 'create',
                loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
              },
              {
                path: ':id/edit',
                loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
              }
            ]
          },
          {
            path: 'categories',
            children: [
              {
                path: '',
                loadComponent: () => import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent)
              },
              {
                path: 'create',
                loadComponent: () => import('./features/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
              },
              {
                path: ':id/edit',
                loadComponent: () => import('./features/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
              }
            ]
          },
          { 
            path: 'orders', 
            loadComponent: () => import('./features/orders/order-admin/order-admin.component').then(m => m.OrderAdminComponent) 
          },
          { 
            path: 'inventory', 
            loadComponent: () => import('./features/admin/inventory-dashboard/inventory-dashboard.component').then(m => m.InventoryDashboardComponent) 
          }
        ]
      }
    ]
  }
];
