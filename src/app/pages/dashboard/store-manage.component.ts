import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-store-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store-manage.component.html'
})
export class StoreManagePageComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';
  storeId = this.route.snapshot.paramMap.get('id') || '';
  store = signal<any | null>(null);
  products = signal<any[]>([]);
  assigned = signal<any[]>([]);
  constructor(){ this.reload(); }
  reload(){
    // You can fetch store meta from /v1/stores then filter by id if needed later.
    this.http.get<any>(`${this.base}/v1/products`).subscribe({ next: r => this.products.set(r?.data||[]) });
    this.http.get<any>(`${this.base}/v1/stores/${encodeURIComponent(this.storeId)}/products`).subscribe({ next: r => this.assigned.set(r?.data||[]) });
  }
  assign(ev: Event, productId: string){ ev.preventDefault(); const f = ev.target as HTMLFormElement; const priceStr = (f.elements.namedItem('price') as HTMLInputElement).value.trim(); const priceOverride = priceStr ? Number(priceStr) : undefined; this.http.post(`${this.base}/v1/stores/${encodeURIComponent(this.storeId)}/products`, { productId, priceOverride }).subscribe({ next: ()=> { this.reload(); f.reset(); } }); }
  remove(productId: string){ this.http.delete(`${this.base}/v1/stores/${encodeURIComponent(this.storeId)}/products/${encodeURIComponent(productId)}`).subscribe({ next: ()=> this.reload() }); }
}
