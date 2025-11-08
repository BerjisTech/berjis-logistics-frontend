import { CoreAuthService } from './core/auth.service';

export function authInitFactory(auth: CoreAuthService) {
  return () => auth.ensureAuth({ force: true, maxAgeMs: 0 })
    .then(res => { try { console.debug('[logistics][auth] verify', res); } catch {} })
    .catch(err => { try { console.debug('[logistics][auth] verify error', err); } catch {} });
}

