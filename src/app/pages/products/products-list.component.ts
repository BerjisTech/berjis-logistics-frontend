import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicService } from '../../public.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-list.component.html'
})
export class ProductsListPageComponent {
  q = '';
  near?: string;
  radiusKm = 50;
  items: any[] = [];
  loading = false;
  constructor(private api: PublicService) { this.search(); }
  geolocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      this.near = `${lat},${lng}`; this.search();
    });
  }
  search() {
    this.loading = true;
    this.api.searchProducts({ q: this.q || undefined, near: this.near, radius_km: this.radiusKm }).subscribe({
      next: (res) => { this.items = res.data || []; this.loading = false; },
      error: () => { this.items = []; this.loading = false; }
    });
  }
}

