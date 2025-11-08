import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

type VerifyResult = { success: boolean; data?: { valid: boolean; uid?: number; uuid?: string; email?: string; name?: string }; message?: string };

@Injectable({ providedIn: 'root' })
export class CoreAuthService {
  // Hard-pin Core API to production base to avoid runtime override drift.
  private base = 'https://api.berjis.tech';
  authChanged$ = new Subject<void>();

  private authCache: { ts: number; result: VerifyResult } | null = null;
  private authInFlight: Promise<VerifyResult> | null = null;
  private adminCache: { ts: number; value: boolean } | null = null;
  private adminInFlight: Promise<boolean> | null = null;
  lastVerifyResult: VerifyResult | null = null;
  lastVerifyError: any = null;

  constructor(private http: HttpClient) {}

  private resetAuthCache() { this.authCache = null; this.adminCache = null; }

  async verify(): Promise<VerifyResult> {
    try {
      const r = await fetch(this.base + '/v1/auth/verify', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}'
      });
      const res = await r.json();
      this.lastVerifyResult = res;
      this.lastVerifyError = null;
      return res as VerifyResult;
    } catch (e) {
      this.lastVerifyError = e;
      throw e;
    }
  }

  async refresh() {
    const r = await fetch(this.base + '/v1/auth/refresh', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}'
    });
    try { return await r.json(); } catch { return null; }
  }

  async ensureAuth(opts?: { force?: boolean; maxAgeMs?: number }): Promise<VerifyResult> {
    const force = !!opts?.force;
    const maxAge = opts?.maxAgeMs ?? 1500;
    const now = Date.now();
    if (!force && this.authCache && now - this.authCache.ts < maxAge) return this.authCache.result;
    if (!force && this.authInFlight) return this.authInFlight;
    const runner = this.runEnsureAuth().then(result => {
      this.authCache = { ts: Date.now(), result };
      if (!result?.data?.valid) this.adminCache = null;
      return result;
    }).catch(err => { this.authCache = null; throw err; }).finally(() => { this.authInFlight = null; });
    this.authInFlight = runner; return runner;
  }

  private async runEnsureAuth(): Promise<VerifyResult> {
    try {
      const v = await this.verify();
      if (v?.data?.valid) return v;
      await this.refresh();
      return await this.verify();
    } catch {
      try { await this.refresh(); return await this.verify(); } catch { return { success: true, data: { valid: false } } as VerifyResult; }
    }
  }

  async verifyAdmin(opts?: { force?: boolean; maxAgeMs?: number }): Promise<boolean> {
    const force = !!opts?.force; const maxAge = opts?.maxAgeMs ?? 5000; const now = Date.now();
    if (!force && this.adminCache && now - this.adminCache.ts < maxAge) return this.adminCache.value;
    if (!force && this.adminInFlight) return this.adminInFlight;
    const req = firstValueFrom(this.http.get<{ success: boolean; data?: { admin: boolean } }>(`${this.base}/v1/auth/admin/verify`, { withCredentials: true }));
    const runner = req.then(res => { const value = !!res?.data?.admin; this.adminCache = { ts: Date.now(), value }; return value; })
      .catch(err => { this.adminCache = null; throw err; })
      .finally(() => { this.adminInFlight = null; });
    this.adminInFlight = runner; return runner;
  }

  getBase(): string { return this.base; }
}
