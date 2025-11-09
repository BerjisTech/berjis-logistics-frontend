import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CoreAuthService as SharedCoreAuthService, CoreAuthSession } from '@berjis/angular-auth';
import { environment } from '../../environments/environment';

type VerifyResult = { success: boolean; data?: CoreAuthSession; message?: string };

@Injectable({ providedIn: 'root' })
export class CoreAuthService {
  private core: SharedCoreAuthService;
  private base: string;
  authChanged$ = new Subject<void>();
  adminCache: { ts: number; value: boolean } | null = null;
  adminInFlight: Promise<boolean> | null = null;
  lastVerifyResult: VerifyResult | null = null;
  lastVerifyError: any = null;

  constructor(shared: SharedCoreAuthService) {
    this.core = shared;
    this.base = environment.apiBase || '';
    this.core.onSessionChange(session => {
      this.lastVerifyResult = { success: true, data: session };
      this.lastVerifyError = null;
      this.authChanged$.next();
    });
  }

  async verify(): Promise<VerifyResult> {
    try {
      const data = await this.core.verify();
      const result: VerifyResult = { success: true, data };
      this.lastVerifyResult = result;
      this.lastVerifyError = null;
      return result;
    } catch (error) {
      this.lastVerifyError = error;
      throw error;
    }
  }

  async refresh() {
    await this.core.refresh();
    return { success: true };
  }

  async ensureAuth(opts?: { force?: boolean; maxAgeMs?: number }): Promise<VerifyResult> {
    try {
      const data = await this.core.ensureAuth(opts);
      const result: VerifyResult = { success: true, data };
      this.lastVerifyResult = result;
      this.lastVerifyError = null;
      if (!data.valid) {
        this.adminCache = null;
        this.adminInFlight = null;
      }
      return result;
    } catch (error) {
      this.lastVerifyError = error;
      throw error;
    }
  }

  async verifyAdmin(opts?: { force?: boolean; maxAgeMs?: number }): Promise<boolean> {
    const force = !!opts?.force;
    const maxAge = opts?.maxAgeMs ?? 5000;
    const now = Date.now();
    if (!force && this.adminCache && now - this.adminCache.ts < maxAge) {
      return this.adminCache.value;
    }
    if (!force && this.adminInFlight) {
      return this.adminInFlight;
    }
    const runner = this.core.ensureAuth({ force, maxAgeMs: maxAge }).then(session => {
      const value = this.sessionIsAdmin(session);
      this.adminCache = { ts: Date.now(), value };
      return value;
    }).catch(err => {
      this.adminCache = null;
      throw err;
    }).finally(() => {
      this.adminInFlight = null;
    });
    this.adminInFlight = runner;
    return runner;
  }

  getBase(): string {
    return this.base;
  }

  private sessionIsAdmin(session: CoreAuthSession): boolean {
    if (!session?.valid) return false;
    const haystack = new Set<string>();
    for (const role of session.roles || []) haystack.add(role);
    for (const role of session.platformRoles || []) haystack.add(role);
    for (const list of Object.values(session.appRoles || {})) {
      for (const role of list || []) {
        haystack.add(role);
        if (role.endsWith('.admin')) {
          return true;
        }
      }
    }
    return haystack.has('admin') || haystack.has('platform.admin');
  }
}
