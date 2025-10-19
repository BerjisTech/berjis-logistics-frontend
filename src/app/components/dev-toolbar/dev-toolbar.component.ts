import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dev-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div *ngIf="show" style="position:fixed; bottom:16px; right:16px; background:#111; color:#fff; padding:10px 12px; border-radius:10px; font-size:12px; box-shadow:0 4px 12px rgba(0,0,0,.2); z-index:1000; width: 360px;">
    <div style="display:flex; gap:6px; align-items:center; justify-content:space-between; margin-bottom:6px;">
      <div style="display:flex; gap:8px; align-items:center;">
        <span [style.color]="healthColor()" style="display:inline-block; width:10px; height:10px; border-radius:50%; background: currentColor;"></span>
        <span>{{ healthText() }}</span>
      </div>
      <button (click)="ping()" style="background:#222; color:#ddd; border:none; border-radius:6px; padding:2px 6px; cursor:pointer;">Ping</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; gap:6px; align-items:center;">
        <span style="min-width:72px; opacity:.9;">Dev User</span>
        <input [value]="devId()" (input)="onInput($event)" placeholder="user-id" style="padding:4px 6px; border-radius:6px; border:none; outline:none; flex:1;" />
        <button (click)="save()" style="background:#09f; color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;">Save</button>
        <button (click)="clear()" style="background:#444; color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;">Clear</button>
      </div>
      <div style="display:flex; gap:6px; align-items:center;">
        <span style="min-width:72px; opacity:.9;">Logistics</span>
        <input [value]="apiBase()" (input)="onBase($event)" placeholder="http://localhost:8081" style="padding:4px 6px; border-radius:6px; border:none; outline:none; flex:1;" />
        <button (click)="saveBase()" style="background:#0a4; color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;">Apply</button>
      </div>
      <div style="display:flex; gap:6px; align-items:center;">
        <span style="min-width:72px; opacity:.9;">Core API</span>
        <input [value]="coreBase()" (input)="onCore($event)" placeholder="http://api.berjis.test" style="padding:4px 6px; border-radius:6px; border:none; outline:none; flex:1;" />
        <button (click)="saveCore()" style="background:#0a4; color:#fff; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;">Apply</button>
      </div>
    </div>
    <div style="margin-top:6px; opacity:.8;">X-User-ID is added to logistics API calls when no Authorization header is present.</div>
  </div>
  `
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
      const cur = localStorage.getItem('dev_user_id') || '';
      this.devId.set(cur);
      (window as any).__DEV_USER_ID__ = cur || undefined;
      const savedLogistics = localStorage.getItem('logistics_api_base') || (window as any).__LOGISTICS_API__ || 'http://localhost:8081';
      const savedCore = localStorage.getItem('core_api_base') || (window as any).__BERJIS_API__ || 'http://api.berjis.test';
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
      if (v) localStorage.setItem('dev_user_id', v); else localStorage.removeItem('dev_user_id');
      (window as any).__DEV_USER_ID__ = v || undefined;
    } catch {}
  }
  clear() {
    try {
      this.devId.set('');
      localStorage.removeItem('dev_user_id');
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
      const base = this.apiBase() || 'http://localhost:8081';
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
