import { HttpInterceptorFn } from '@angular/common/http';

export const devUserInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const w: any = (typeof window !== 'undefined') ? (window as any) : {};
    const devId: string | undefined = w.__DEV_USER_ID__;
    const base: string = w.__LOGISTICS_API__ || 'https://logistics-api.berjis.tech';
    // Only add header for logistics service calls, when no Authorization header is present
    if (devId && typeof devId === 'string' && req.url.startsWith(base) && !req.headers.has('Authorization')) {
      req = req.clone({ setHeaders: { 'X-User-ID': devId } });
    }
  } catch {}
  return next(req);
};

