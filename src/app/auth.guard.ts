import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { from, map, catchError, of, switchMap } from 'rxjs';
import { environment } from '../environments/environment';

export const authGuard: CanActivateFn = (_route, state) => {
  const api = inject(ApiService);
  const http = inject(HttpClient);
  const router = inject(Router);
  const w: any = (typeof window !== 'undefined') ? (window as any) : {};
  const base: string = (w.__LOGISTICS_API__ && String(w.__LOGISTICS_API__).trim()) || 'https://logistics-api.berjis.tech';
  // Prefer server-side verification via logistics API (uniform and cookie+token aware).
  return http.get<{success:boolean}>(`${base.replace(/\/+$/, '')}/v1/auth/ping`, { withCredentials: true }).pipe(
    map(r => !!r?.success),
    catchError(() => of(false)),
    switchMap(ok => ok ? of(true) : from(api.ensureAuth()).pipe(map(v => !!v?.data?.valid), catchError(() => of(false)))) ,
    map(ok => { if (!ok) router.navigateByUrl('/'); return ok; }),
    catchError(() => { router.navigateByUrl('/'); return of(false); })
  );
};
