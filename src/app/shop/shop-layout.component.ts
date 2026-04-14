import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BackOfficeModule } from '../back-office/back-office.module';
import { SidebarService } from '../services/sidebar.service';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, BackOfficeModule],
  template: `
    <div class="app-layout">
      <!-- Header -->
      <app-header></app-header>

      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content -->
      <main class="main-content" [class.sidebar-collapsed]="sidebarCollapsed()">
        <div class="content-wrapper" style="background: #ffffff; min-height: 100vh;">
          <div class="shop-theme">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .shop-theme {
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ShopLayoutComponent implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  readonly sidebarCollapsed = signal(false);

  ngOnInit(): void {
    // Listen to global sidebar state
    this.sidebarService.collapsed$.subscribe(isCollapsed => {
      this.sidebarCollapsed.set(isCollapsed);
    });
  }
}

import { signal } from '@angular/core';
