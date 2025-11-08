import { HttpInterceptorFn } from '@angular/common/http';

export const rolesInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const w: any = (typeof window !== 'undefined') ? (window as any) : {};
    const base: string = w.__LOGISTICS_API__ || 'https://logistics-api.berjis.tech';
    const roles: string[] = Array.isArray(w.__ROLES__) ? w.__ROLES__ : [];
    if (roles.length && req.url.startsWith(base) && !req.headers.has('X-Roles')) {
      req = req.clone({ setHeaders: { 'X-Roles': roles.join(',') } });
    }
  } catch {}
  return next(req);
};

