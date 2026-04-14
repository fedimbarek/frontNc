import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl:'./sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
 isCollapsed: boolean = false;
  isMobileMenuOpen: boolean = false;
  currentRoute: string = '';
  isLoggedIn: boolean = false;
  isCandidate: boolean = false;
  isAdmin: boolean = false;
  isParticipant: boolean = false;
  isUser: boolean = false;

  chatNotifications: number = 5;
  forumNotifications: number = 2;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {
    // Écouter les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        // Fermer le menu mobile après navigation
        if (window.innerWidth <= 768) {
          this.closeMobileMenu();
        }
      });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    // Check roles
    // Check roles with case-insensitivity and prefix handling
    const userRoles = this.authService.getRoles().map(r => r.toUpperCase());
    this.isAdmin = userRoles.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN' || r === 'REC_ADMIN');
    this.isCandidate = userRoles.includes('CANDIDATE') || userRoles.includes('ROLE_CANDIDATE');
    this.isParticipant = userRoles.includes('PARTICIPANT') || userRoles.includes('ROLE_PARTICIPANT');
    this.isUser = userRoles.includes('USER') || userRoles.includes('ROLE_USER');

    // Listen to global state
    this.sidebarService.collapsed$.subscribe(isCollapsed => {
      this.isCollapsed = isCollapsed;
    });

    // Définir la route courante
    this.currentRoute = this.router.url;

    // Vérifier si mobile au chargement
    this.checkMobile();

    // Charger les notifications (à connecter avec votre service)
    // this.loadNotifications();
  }

  // Toggle sidebar collapse
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Close mobile menu
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Sauvegarder l'état du sidebar
  saveSidebarState(): void {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isCollapsed));
  }

  // Charger l'état du sidebar
  loadSidebarState(): void {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = JSON.parse(savedState);
    }
  }

  // Vérifier si l'écran est mobile
  checkMobile(): void {
    if (window.innerWidth <= 768) {
      this.isCollapsed = true;
    }
  }

  // Écouter le resize de la fenêtre
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth <= 768) {
      this.isCollapsed = true;
    }
  }

  // Charger les notifications (à implémenter avec votre service)
  loadNotifications(): void {
    // Exemple avec un service
    // this.notificationService.getChatNotifications().subscribe(count => {
    //   this.chatNotifications = count;
    // });
    // this.notificationService.getForumNotifications().subscribe(count => {
    //   this.forumNotifications = count;
    // });
  }

  // Méthode pour mettre à jour les notifications depuis l'extérieur
  updateChatNotifications(count: number): void {
    this.chatNotifications = count;
  }

  updateForumNotifications(count: number): void {
    this.forumNotifications = count;
  }
}
