import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type RoleKey = 'storage_owner' | 'truck_owner' | 'driver' | 'staff';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Overview</h2>
    <p>Enroll into roles to unlock features. You can be a storage owner, truck owner, driver, or general staff.</p>
    <div *ngIf="error()" style="color:#b00;">{{ error() }}</div>
    <div style="display:grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin-top:16px;">
      <div style="border:1px solid #ddd; border-radius:12px; padding:16px;">
        <h3>Storage Owner</h3>
        <p>Create and manage storage units, invite staff.</p>
        <button (click)="toggle('storage_owner')">{{ roles().storage_owner ? 'Unenroll' : 'Enroll' }}</button>
      </div>
      <div style="border:1px solid #ddd; border-radius:12px; padding:16px;">
        <h3>Truck Owner</h3>
        <p>Add trucks and hire drivers.</p>
        <button (click)="toggle('truck_owner')">{{ roles().truck_owner ? 'Unenroll' : 'Enroll' }}</button>
      </div>
      <div style="border:1px solid #ddd; border-radius:12px; padding:16px;">
        <h3>Driver</h3>
        <p>Work as a driver with your truck or for others.</p>
        <button (click)="toggle('driver')">{{ roles().driver ? 'Unenroll' : 'Enroll' }}</button>
      </div>
      <div style="border:1px solid #ddd; border-radius:12px; padding:16px;">
        <h3>General Staff</h3>
        <p>Get invited by a storage owner to help manage units.</p>
        <button (click)="toggle('staff')">{{ roles().staff ? 'Unenroll' : 'Enroll' }}</button>
      </div>
    </div>
  `
})
export class DashboardHomeComponent {
  private http = inject(HttpClient);
  base = environment.apiBase;
  loading = signal(false);
  error = signal<string | null>(null);
  roles = signal<Record<RoleKey, boolean>>({ storage_owner: false, truck_owner: false, driver: false, staff: false });
  constructor(){ this.load(); }
  async load() {
    this.loading.set(true); this.error.set(null);
    try {
      const res = await this.http.get<any>(`${this.base}/v1/apps/logistics/roles`, { withCredentials: true }).toPromise();
      const list: string[] = res?.data || [];
      const current: Record<RoleKey, boolean> = { storage_owner: false, truck_owner: false, driver: false, staff: false };
      list.forEach(k => { if (k.endsWith('.storage_owner')) current.storage_owner = true; if (k.endsWith('.truck_owner')) current.truck_owner = true; if (k.endsWith('.driver')) current.driver = true; if (k.endsWith('.staff')) current.staff = true; });
      this.roles.set(current);
    } catch (e: any) { this.error.set('Please log in to manage roles.'); }
    finally { this.loading.set(false); }
  }
  async toggle(role: RoleKey) {
    this.error.set(null);
    try {
      if (this.roles()[role]) await this.http.delete(`${this.base}/v1/apps/logistics/roles/${role}`, { withCredentials: true }).toPromise();
      else await this.http.post(`${this.base}/v1/apps/logistics/roles`, { role }, { withCredentials: true }).toPromise();
      this.load();
    } catch (e: any) { this.error.set(e?.error?.message || 'Failed to update'); }
  }
}

