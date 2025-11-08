import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe({
    error: (err: any) => {
      try {
        const w: any = (typeof window !== 'undefined') ? (window as any) : {};
        const base: string = w.__LOGISTICS_API__ || 'https://logistics-api.berjis.tech';
        if (req.url && req.url.startsWith(base)) {
          const e = err as HttpErrorResponse;
          const msg = (e?.error && typeof e.error === 'object' && e.error?.message) ? String(e.error.message) : undefined;
          let friendly = msg;
          if (!friendly) {
            switch (e.status) {
              case 400: friendly = 'Please check your input and try again.'; break;
              case 401: friendly = 'Please sign in to continue.'; break;
              case 403: friendly = "You don't have permission to do that."; break;
              case 404: friendly = 'The requested item was not found.'; break;
              default: friendly = 'Something went wrong. Please try again.';
            }
          }
          if (friendly && typeof alert === 'function') { alert(friendly); }
        }
      } catch {}
      throw err;
    }
  } as any);
};

