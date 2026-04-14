import { Injectable } from '@angular/core';
import { getKeycloak } from './keycloak.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  login(): void {
    getKeycloak().login({
      redirectUri: window.location.origin + '/admin'
    });
  }

  register(): void {
    getKeycloak().register({
      redirectUri: window.location.origin + '/jobs'
    });
  }

  logout(): void {
    getKeycloak().logout({
      redirectUri: window.location.origin
    });
  }

  isLoggedIn(): boolean {
    const keycloak = getKeycloak();
    return !!keycloak?.authenticated;
  }

  async getToken(): Promise<string> {
    const keycloak = getKeycloak();

    if (!keycloak) return '';

    if (keycloak.isTokenExpired()) {
      await keycloak.updateToken(30);
    }

    return keycloak.token || '';
  }

  getRoles(): string[] {
    return getKeycloak()?.tokenParsed?.realm_access?.roles || [];
  }

 getUserInfo() {
    const tokenParsed = getKeycloak()?.tokenParsed;

    if (!tokenParsed) return null;

    return {
      id: tokenParsed['sub'],
      username: tokenParsed['preferred_username'],
      firstName: tokenParsed['given_name'],
      lastName: tokenParsed['family_name'],
      email: tokenParsed['email'],
      roles: tokenParsed['realm_access']?.roles || []
    };
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }
}
