import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, from, switchMap, throwError } from 'rxjs';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const w: any = (typeof window !== 'undefined') ? (window as any) : {};
    const svcBase: string = (w.__LOGISTICS_API__ && String(w.__LOGISTICS_API__).trim()) || 'https://logistics-api.berjis.tech';
    const isSvc = req.url.startsWith(svcBase);
    const token = localStorage.getItem('accessToken');
    if (isSvc && token && !req.headers.has('Authorization')) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  } catch {}

  return next(req).pipe(
    catchError((err: any) => {
      const e = err as HttpErrorResponse;
      // On 401 from logistics API, attempt Core refresh once and retry
      try {
        const w: any = (typeof window !== 'undefined') ? (window as any) : {};
        const svcBase: string = (w.__LOGISTICS_API__ && String(w.__LOGISTICS_API__).trim()) || 'https://logistics-api.berjis.tech';
        const coreBase: string = (w.__BERJIS_API__ && String(w.__BERJIS_API__).trim()) || 'https://api.berjis.tech';
        const http = inject(HttpClient);
        const isSvc = req.url.startsWith(svcBase);
        if (isSvc && e.status === 401) {
          return from(firstValueFrom(http.post<any>(`${coreBase}/v1/auth/refresh`, {}, { withCredentials: true }))).pipe(
            switchMap((res) => {
              try {
                const token = res?.data?.access || res?.access;
                if (typeof token === 'string' && token.length) localStorage.setItem('accessToken', token);
              } catch {}
              const token = localStorage.getItem('accessToken');
              let retried = req;
              if (token) retried = retried.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
              return next(retried);
            }),
            catchError(() => throwError(() => err))
          );
        }
      } catch {}
      return throwError(() => err);
    })
  );
};

