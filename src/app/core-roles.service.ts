import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Always fetch roles from Core API (api.berjis.tech), never from logistics-api.
const coreApi = 'https://api.berjis.tech';

@Injectable({ providedIn: 'root' })
export class CoreRolesService {
  private roles: string[] | null = null;
  private inflight: Promise<string[] | null> | null = null;
  constructor(private http: HttpClient) {}
  private headers(): HttpHeaders {
    let h = new HttpHeaders();
    try { const t = localStorage.getItem('accessToken'); if (t) h = h.set('Authorization', `Bearer ${t}`); } catch {}
    return h;
  }
  async ensureRoles(): Promise<string[] | null> {
    if (this.roles) return this.roles;
    if (this.inflight) return this.inflight;
    const run = this.fetch().finally(() => { this.inflight = null; });
    this.inflight = run;
    return run;
  }
  async fetch(): Promise<string[] | null> {
    try {
      const res = await firstValueFrom(this.http.get<{ success: boolean; data?: string[] }>(`${coreApi}/v1/auth/roles`, { withCredentials: true, headers: this.headers() }));
      const list = Array.isArray(res?.data) ? res.data : [];
      this.roles = list;
      try { localStorage.setItem('roles', JSON.stringify(list)); } catch {}
      return list;
    } catch {
      return null;
    }
  }
  current(): string[] { return Array.isArray(this.roles) ? this.roles : []; }
}

