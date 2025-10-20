import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-store-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-landing.component.html'
})
export class StoreLandingPageComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || '';
  store = signal<any | null>(null);
  products = signal<any[]>([]);

  constructor(){
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.http.get<any>(`${this.base}/v1/public/store/${encodeURIComponent(slug)}`).subscribe({
      next: r => { const d=r?.data||r; this.store.set(d.store); this.products.set(d.products||[]); },
      error: () => { this.store.set(null); this.products.set([]); }
    });
  }
}