import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export function jwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> {
  const authService = inject(AuthService);

  // 1. Check if request is for our API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // 2. PRODUCTION / KEYCLOAK MODE
  return from(authService.updateToken(30)).pipe(
    mergeMap(() => {
      const token = authService.getToken();
      const user = authService.currentUser();
      
      let headers = req.headers;
      
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
      
      if (user) {
        headers = headers.set('X-User-Id', user.id);
      }

      if (token || user) {
        const cloned = req.clone({ headers });
        return next(cloned);
      }
      
      return next(req);
    })
  );
}
