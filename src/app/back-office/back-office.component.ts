import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SidebarService } from '../services/sidebar.service';



@Component({
  selector: 'app-back-office',
  templateUrl: './back-office.component.html',
  styleUrl: './back-office.component.scss'
})
export class BackOfficeComponent implements OnInit {
  sidebarCollapsed: boolean = false;
  isRedirecting: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    const url = this.router.url.split('?')[0];
    
    // Check if we are landing on a generic path that requires role-based redirection
    const landingPaths = ['/admin', '/admin/', '/back', '/back/'];
    
    if (landingPaths.includes(url)) {
      this.isRedirecting = true;
      
      if (this.authService.hasRole('CANDIDATE')) {
        this.router.navigate(['/jobs']).then(() => this.isRedirecting = false);
      } else {
        this.router.navigate(['/admin/recruitment']).then(() => this.isRedirecting = false);
      }
    } else {
      this.isRedirecting = false;
    }
    // Listen to global sidebar state
    this.sidebarService.collapsed$.subscribe(isCollapsed => {
      this.sidebarCollapsed = isCollapsed;
    });
  }
}
