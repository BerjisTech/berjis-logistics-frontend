import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCarouselComponent } from '../../shared/image-carousel/image-carousel.component';
import { PublicService } from '../../public.service';

@Component({
  selector: 'app-transport-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCarouselComponent],
  templateUrl: './transport-list.component.html'
})
export class TransportListPageComponent {
  q = '';
  minCapacity?: number;
  items: any[] = [];
  loading = false;
  near?: string;
  radiusKm = 50;
  constructor(private api: PublicService) { this.search(); }
  search() {
    this.loading = true;
    this.api.searchTransport({ q: this.q || undefined, min_capacity_kg: this.minCapacity, near: this.near, radius_km: this.radiusKm }).subscribe({
      next: res => { this.items = res.data || []; this.loading = false; },
      error: () => { this.items = []; this.loading = false; }
    });
  }
  geolocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      this.near = `${lat},${lng}`;
      this.search();
    });
  }
}
