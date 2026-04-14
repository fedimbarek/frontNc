import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { getKeycloak } from '../../../auth/keycloak.config';

export interface UserContext {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  // State
  private readonly userCtx = signal<UserContext | null>(null);

  // Computed
  readonly isLoggedIn = computed(() => !!this.userCtx());
  readonly currentUser = computed(() => this.userCtx());
  readonly isAdmin = computed(() => {
    const roles = this.userCtx()?.roles || [];
    return roles.some(r => {
      const ur = r.toUpperCase();
      return ur === 'ROLE_ADMIN' || ur === 'ADMIN' || ur === 'REC_ADMIN';
    });
  });

  constructor() {
    this.updateUserContext();
  }

  private updateUserContext() {
    const kc = getKeycloak();
    if (!kc || !kc.tokenParsed) {
      this.userCtx.set(null);
      return;
    }

    const rolesSet = new Set<string>();
    
    // 1. Get Realm Roles
    const realmAccess = kc.tokenParsed['realm_access'] as any;
    if (realmAccess && Array.isArray(realmAccess.roles)) {
      realmAccess.roles.forEach((r: string) => rolesSet.add(r));
    }

    // 2. Get Client Roles (resource_access)
    const resourceAccess = kc.tokenParsed['resource_access'] as any;
    const clientId = 'jungleinenglish-frontend';
    if (resourceAccess?.[clientId]?.roles && Array.isArray(resourceAccess[clientId].roles)) {
      resourceAccess[clientId].roles.forEach((r: string) => rolesSet.add(r));
    }

    const detectedRoles = Array.from(rolesSet);
    console.log('[AuthService] Token Parsed:', kc.tokenParsed);
    console.log('[AuthService] Detected Roles:', detectedRoles);

    this.userCtx.set({
      id: kc.subject || '',
      email: kc.tokenParsed['email'] || '',
      name: kc.tokenParsed['preferred_username'] || '',
      roles: detectedRoles
    });
  }

  getToken(): string | null {
    const kc = getKeycloak();
    return kc?.token || null;
  }

  async login() {
    const kc = getKeycloak();
    if (kc) {
        return kc.login({ redirectUri: window.location.origin + '/' });
    }
  }

  logout() {
    const kc = getKeycloak();
    if (kc) {
        kc.logout({ redirectUri: window.location.origin + '/' });
    }
  }

  async updateToken(minValidity = 20): Promise<boolean> {
    const kc = getKeycloak();
    if (!kc || !kc.authenticated) return false;

    try {
      return await kc.updateToken(minValidity);
    } catch (error) {
      await kc.login();
      return false;
    }
  }
}
