import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const isAdmin = auth.isAdmin();
    
    console.log('[AdminGuard] Check access. IsAdmin:', isAdmin);
    
    if (isAdmin) return true;
    
    console.warn('[AdminGuard] Access denied, redirecting to shop catalog');
    router.navigate(['/shop/products']);
    return false;
};
