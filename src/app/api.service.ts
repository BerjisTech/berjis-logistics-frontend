import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Call Core API directly via hostname (prod-like topology)
const apiBase = 'http://api.berjis.test';

export interface Me { id: string; email?: string; name?: string }

@Injectable({ providedIn: 'root' })
export class ApiService {
  me: Me | null = null;
  constructor(private http: HttpClient) {}
  verify() { return this.http.get<any>(`${apiBase}/v1/auth/verify`, { withCredentials: true }); }
  refresh() { return this.http.post<any>(`${apiBase}/v1/auth/refresh`, {}, { withCredentials: true }); }
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
        return { success: true, data: { valid: false } };
      }
    }
  }
}
