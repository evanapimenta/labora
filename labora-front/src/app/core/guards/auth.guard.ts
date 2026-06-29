import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AccessService } from '../services/access.service';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const accessService = inject(AccessService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (accessService.access && accessService.access.accessToken) {
    if (!accessService.role) {
      router.navigate(['/register-patient']);
      return false;
    }
    return true;
  }

  router.navigate(['/sign-in']);
  return false;
};
