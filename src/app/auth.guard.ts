import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './api.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);
  return api.verify().pipe(
    map((res: any) => {
      const valid = !!res?.success;
      if (!valid) router.navigateByUrl('/');
      return valid;
    }),
    catchError(() => {
      router.navigateByUrl('/');
      return of(false);
    })
  );
};

