import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-stores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-stores.component.html'
})
export class DashboardStoresComponent {
  private http = inject(HttpClient);
  base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'http://localhost:8081';
  stores = signal<any[]>([]);
  message = '';
  constructor(){ this.reload(); }
  reload(){ this.http.get<any>(`${this.base}/v1/stores`).subscribe({ next:r=> this.stores.set(r?.data||[])}); }
  create(ev: Event){
    ev.preventDefault(); const f = ev.target as HTMLFormElement; const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim(); const slug = (f.elements.namedItem('slug') as HTMLInputElement).value.trim();
    this.message = '';
    this.http.post(`${this.base}/v1/stores`, { name, slug: slug || undefined }).subscribe({ next:()=> { this.reload(); f.reset(); }, error: (e)=> { this.message = e?.error?.message || 'Failed'; }});
  }
}
