import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreAuthService } from '../../core/auth.service';

@Component({
  selector: 'app-debug-auth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug-auth.component.html'
})
export class DebugAuthPageComponent implements OnInit {
  private auth = inject(CoreAuthService);
  coreBase = this.auth.getBase();
  verifying = signal(true);
  result = signal<any>(null);
  error = signal<any>(null);
  lastError = signal<any>(null);
  fetchStatus = signal<any>(null);
  fetchBody = signal<any>(null);
  fetchError = signal<any>(null);
  refreshStatus = signal<any>(null);
  refreshBody = signal<any>(null);
  refreshError = signal<any>(null);

  async ngOnInit() {
    try {
      const res = await this.auth.ensureAuth({ force: true, maxAgeMs: 0 });
      this.result.set({ last: this.auth.lastVerifyResult, ensure: res });
      this.lastError.set(this.auth.lastVerifyError);
    } catch (e: any) {
      this.error.set({ message: e?.message || 'verify failed', status: e?.status, body: e?.error });
    } finally {
      this.verifying.set(false);
    }
  }

  async runVerify() {
    this.verifying.set(true);
    this.result.set(null);
    this.error.set(null);
    try {
      const res = await this.auth.verify();
      this.result.set({ last: this.auth.lastVerifyResult, ensure: res });
      this.lastError.set(this.auth.lastVerifyError);
    } catch (e: any) {
      this.error.set({ message: e?.message || 'verify failed', status: e?.status, body: e?.error });
    } finally {
      this.verifying.set(false);
    }
  }

  async runFetchVerify() {
    this.fetchStatus.set(null); this.fetchBody.set(null); this.fetchError.set(null);
    try {
      const res = await fetch(this.coreBase + '/v1/auth/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      const text = await res.text();
      this.fetchStatus.set({ ok: res.ok, status: res.status, statusText: res.statusText });
      try { this.fetchBody.set(JSON.parse(text)); } catch { this.fetchBody.set(text); }
    } catch (e: any) {
      this.fetchError.set({ message: e?.message || String(e) });
    }
  }

  async runFetchRefresh() {
    this.refreshStatus.set(null); this.refreshBody.set(null); this.refreshError.set(null);
    try {
      const res = await fetch(this.coreBase + '/v1/auth/refresh', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}'
      });
      const text = await res.text();
      this.refreshStatus.set({ ok: res.ok, status: res.status, statusText: res.statusText });
      try { this.refreshBody.set(JSON.parse(text)); } catch { this.refreshBody.set(text); }
    } catch (e: any) {
      this.refreshError.set({ message: e?.message || String(e) });
    }
  }
}
