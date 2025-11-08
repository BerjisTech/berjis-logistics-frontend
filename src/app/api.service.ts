import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, tap } from 'rxjs';

// Call Core API directly via hostname (prod-like topology)
const apiBase = 'https://api.berjis.tech';

export interface Me { id: string; email?: string; name?: string }

@Injectable({ providedIn: 'root' })
export class ApiService {
  me: Me | null = null;
  constructor(private http: HttpClient) {}
  private authHeaders(): HttpHeaders {
    let h = new HttpHeaders();
    try {
      const token = localStorage.getItem('accessToken');
      if (token) h = h.set('Authorization', `Bearer ${token}`);
    } catch {}
    return h;
  }
  verify() {
    return this.http.get<any>(`${apiBase}/v1/auth/verify`, { withCredentials: true, headers: this.authHeaders() })
      .pipe(tap(res => this.syncUser(res?.data)));
  }
  refresh() {
    return this.http.post<any>(`${apiBase}/v1/auth/refresh`, {}, { withCredentials: true, headers: this.authHeaders() })
      .pipe(tap((res: any) => {
        try {
          const token = res?.data?.access || res?.access;
          if (typeof token === 'string' && token.length) localStorage.setItem('accessToken', token);
        } catch {}
      }));
  }
  async ensureAuth(): Promise<any> {
    try {
      const v = await firstValueFrom(this.verify());
      if (v?.data?.valid) return v;
      await firstValueFrom(this.refresh());
      return await firstValueFrom(this.verify());
    } catch {
      try {
        await firstValueFrom(this.refresh());
        return await firstValueFrom(this.verify());
      } catch (e) {
        this.me = null;
        return { success: true, data: { valid: false } };
      }
    }
  }
  userIdFrom(res: any): string | undefined {
    if (!res) return undefined;
    return this.extractUserId(res?.data ?? res);
  }
  private extractUserId(data: any): string | undefined {
    if (!data || data.valid === false) return undefined;
    if (typeof data?.uuid === 'string') {
      const uuid = data.uuid.trim();
      if (uuid) return uuid;
    }
    if (data?.uid !== undefined && data?.uid !== null) {
      const id = String(data.uid).trim();
      if (id) return id;
    }
    return undefined;
  }
  private syncUser(data: any) {
    const id = this.extractUserId(data);
    if (id) {
      const email = typeof data?.email === 'string' ? data.email : undefined;
      const name = typeof data?.name === 'string' ? data.name : undefined;
      this.me = { id, email, name };
    } else {
      this.me = null;
    }
  }
}
