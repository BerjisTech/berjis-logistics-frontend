import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dev-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dev-toolbar.component.html'
})
export class DevToolbarComponent {
  show = false;
  devId = signal<string>('');
  apiBase = signal<string>('');
  coreBase = signal<string>('');
  status = signal<'ok' | 'fail' | 'idle'>('idle');
  healthText = signal<string>('Idle');
  healthColor = signal<string>('#777');

  constructor() {
    try {
      // Only show in dev hosts
      const host = (typeof window !== 'undefined') ? window.location.hostname : '';
      this.show = host === 'localhost' || host === '127.0.0.1';
      const stored = localStorage.getItem('dev_user_uuid') ?? localStorage.getItem('dev_user_id') ?? '';
      this.devId.set(stored);
      if (stored) {
        localStorage.setItem('dev_user_uuid', stored);
      }
      (window as any).__DEV_USER_UUID__ = stored || undefined;
      (window as any).__DEV_USER_ID__ = stored || undefined;
      const savedLogistics = localStorage.getItem('logistics_api_base') || (window as any).__LOGISTICS_API__ || 'https://logistics-api.berjis.tech';
      const savedCore = localStorage.getItem('core_api_base') || (window as any).__BERJIS_API__ || 'https://api.berjis.tech';
      this.apiBase.set(savedLogistics);
      this.coreBase.set(savedCore);
      this.ping();
      setInterval(() => this.ping(), 10000);
    } catch {}
  }

  onInput(e: Event) { const v = (e.target as HTMLInputElement).value.trim(); this.devId.set(v); }
  save() {
    try {
      const v = this.devId();
      if (v) {
        localStorage.setItem('dev_user_uuid', v);
      } else {
        localStorage.removeItem('dev_user_uuid');
      }
      localStorage.removeItem('dev_user_id');
      (window as any).__DEV_USER_UUID__ = v || undefined;
      (window as any).__DEV_USER_ID__ = v || undefined;
    } catch {}
  }
  clear() {
    try {
      this.devId.set('');
      localStorage.removeItem('dev_user_uuid');
      localStorage.removeItem('dev_user_id');
      (window as any).__DEV_USER_UUID__ = undefined;
      (window as any).__DEV_USER_ID__ = undefined;
    } catch {}
  }

  onBase(e: Event) { this.apiBase.set((e.target as HTMLInputElement).value.trim()); }
  saveBase() {
    try {
      const b = this.apiBase();
      if (b) localStorage.setItem('logistics_api_base', b); else localStorage.removeItem('logistics_api_base');
      (window as any).__LOGISTICS_API__ = b || undefined;
      // Reload so services re-read base on import
      window.location.reload();
    } catch {}
  }
  onCore(e: Event) { this.coreBase.set((e.target as HTMLInputElement).value.trim()); }
  saveCore() {
    try {
      const b = this.coreBase();
      if (b) localStorage.setItem('core_api_base', b); else localStorage.removeItem('core_api_base');
      (window as any).__BERJIS_API__ = b || undefined;
      window.location.reload();
    } catch {}
  }

  async ping() {
    try {
      const base = this.apiBase() || 'https://logistics-api.berjis.tech';
      const res = await fetch(base.replace(/\/$/, '') + '/v1/health', { method: 'GET', mode: 'cors' });
      if (res.ok) {
        this.status.set('ok'); this.healthText.set('Connected'); this.healthColor.set('#0a4');
      } else {
        this.status.set('fail'); this.healthText.set('Error ' + res.status); this.healthColor.set('#c33');
      }
    } catch (e) {
      this.status.set('fail'); this.healthText.set('Cannot reach service'); this.healthColor.set('#c33');
    }
  }
}
