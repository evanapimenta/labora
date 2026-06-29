import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpBackend, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccessService } from '../services/access.service';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const accessService = inject(AccessService);
  const router = inject(Router);
  const handler = inject(HttpBackend);

  const isAuthRequest = req.url.includes('/login') || req.url.includes('/refresh-token') || req.url.includes('/users/verify-account');

  if (isAuthRequest) {
    return next(req);
  }

  const accessData = accessService.access;
  if (accessData && accessData.accessToken) {
    if (isTokenExpiredOrExpiringSoon(accessData.accessToken)) {
      return handleRefresh(req, next, accessService, router, handler);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessData.accessToken}`
      }
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return handleRefresh(req, next, accessService, router, handler);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

function handleRefresh(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  accessService: AccessService,
  router: Router,
  handler: HttpBackend
): Observable<HttpEvent<unknown>> {
  if (!accessService.isRefreshing) {
    accessService.isRefreshing = true;
    accessService.refreshTokenSubject.next(null);

    const accessData = accessService.access;
    const refreshToken = accessData?.refreshToken;

    if (!refreshToken) {
      accessService.isRefreshing = false;
      logout(accessService, router);
      return throwError(() => new Error('Refresh token not available'));
    }

    const apiUrl = environment.api;
    const refreshUrl = apiUrl.endsWith('/') ? `${apiUrl}refresh-token` : `${apiUrl}/refresh-token`;

    // Clean HttpClient bypassing all interceptors
    const http = new HttpClient(handler);

    return http.post<any>(refreshUrl, { refreshToken }).pipe(
      switchMap((tokenResponse: any) => {
        accessService.isRefreshing = false;

        const newAccess = {
          ...accessData,
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken || refreshToken
        };
        accessService.access = newAccess;
        accessService.refreshTokenSubject.next(tokenResponse.accessToken);

        return next(
          request.clone({
            setHeaders: {
              Authorization: `Bearer ${tokenResponse.accessToken}`
            }
          })
        );
      }),
      catchError((refreshError) => {
        accessService.isRefreshing = false;
        logout(accessService, router);
        return throwError(() => refreshError);
      })
    );
  } else {
    return accessService.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((jwt) => {
        return next(
          request.clone({
            setHeaders: {
              Authorization: `Bearer ${jwt}`
            }
          })
        );
      })
    );
  }
}

function isTokenExpiredOrExpiringSoon(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = payload.length % 4;
    if (pad) {
      payload += '='.repeat(4 - pad);
    }

    const decodedStr = typeof atob !== 'undefined'
      ? atob(payload)
      : Buffer.from(payload, 'base64').toString('binary');

    const decoded = JSON.parse(decodedStr);
    if (!decoded.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const bufferSeconds = 10;
    return (decoded.exp - currentTime) < bufferSeconds;
  } catch (e) {
    return true;
  }
}

function logout(accessService: AccessService, router: Router): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('access');
  }
  router.navigate(['/sign-in']);
}
