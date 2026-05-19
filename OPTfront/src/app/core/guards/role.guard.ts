import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (role: UserRole): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Check signal first, then fall back to localStorage (handles timing edge cases)
  let user = auth.currentUser();
  if (!user) {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        user = JSON.parse(stored);
        auth.currentUser.set(user);
      } catch { /* ignore */ }
    }
  }

  if (user?.role === role) return true;
  return router.createUrlTree([user ? '/unauthorized' : '/login']);
};


