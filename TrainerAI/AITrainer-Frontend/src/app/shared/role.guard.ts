import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  let role = route.data['role'];

  if(role == 'Admin') {
    if(authService.checkRole(role)){
      return true;
    } else {
      return router.parseUrl('dashboard/admin');
    }
  }

  if(role == 'SuperAdmin') {
    if(authService.checkRole(role)){
      return true;
    } else {
      return router.parseUrl('dashboard');
    }
  }

  if(role == 'Intern') {
    if(authService.checkRole(role)) {
      return true;
    } else {
      return router.parseUrl('dashboard/home')
    }
  }

  return router.parseUrl('/');

};
