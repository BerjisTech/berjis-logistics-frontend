import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type RoleKey = 'storage_owner' | 'truck_owner' | 'driver' | 'staff';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardPageComponent {
  private http = inject(HttpClient);
  base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';
  // Global Search
  q = signal('');
  searching = signal(false);
  results = signal<{kind:'warehouse'|'vehicle'|'contact'; id:string; label:string; route:string}[]>([]);
  private searchTimer: any;

  onSearchInput(ev: Event) {
    const v = (ev.target as HTMLInputElement).value.trim();
    this.q.set(v);
    clearTimeout(this.searchTimer);
    if (!v || v.length < 2) { this.results.set([]); return; }
    this.searchTimer = setTimeout(() => this.runSearch(v), 250);
  }
  runSearch(v: string) {
    this.searching.set(true);
    const headers = {};
    const base = this.base;
    Promise.all([
      this.http.get<any>(`${base}/v1/warehouses`).toPromise().then(r => (r?.data||[]) as any[]).catch(() => []),
      this.http.get<any>(`${base}/v1/vehicles`).toPromise().then(r => (r?.data||[]) as any[]).catch(() => []),
      this.http.get<any>(`${base}/v1/contacts`).toPromise().then(r => (r?.data||[]) as any[]).catch(() => []),
    ]).then(([wh, veh, con]) => {
      const ql = v.toLowerCase();
      const out: {kind:'warehouse'|'vehicle'|'contact'; id:string; label:string; route:string}[] = [];
      (wh||[]).forEach((w: any) => { const text = `${w.name} ${w.location||''}`.toLowerCase(); if (text.includes(ql)) out.push({ kind:'warehouse', id:w.id, label:`Warehouse: ${w.name}`, route:'/dashboard/storage' }); });
      (veh||[]).forEach((x: any) => { const text = `${x.plate} ${x.kind||''}`.toLowerCase(); if (text.includes(ql)) out.push({ kind:'vehicle', id:x.id, label:`Vehicle: ${x.plate}`, route:'/dashboard/fleet' }); });
      (con||[]).forEach((c: any) => { const text = `${c.name} ${c.company||''} ${c.kind}`.toLowerCase(); if (text.includes(ql)) out.push({ kind:'contact', id:c.id, label:`${c.kind}: ${c.name}`, route:'/dashboard/crm' }); });
      this.results.set(out.slice(0, 10));
      this.searching.set(false);
    });
  }
  clearSearch() { this.q.set(''); this.results.set([]); }
}
