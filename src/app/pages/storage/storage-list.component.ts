import { Component, ElementRef, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicService, PublicWarehouse } from '../../public.service';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './storage-list.component.html'
})
export class StorageListPageComponent implements AfterViewInit {
  @ViewChild('map', { static: true }) mapEl!: ElementRef<HTMLDivElement>;
  private api = inject(PublicService);
  warehouses: PublicWarehouse[] = [];
  q = '';
  near?: string;
  radiusKm = 50;
  private map: any;
  private markers: any[] = [];

  constructor() { this.search(); }

  ngAfterViewInit(): void {
    const L = (window as any).L;
    if (!L) return;
    const token = (window as any).__ENV?.mapboxToken;
    const style = (window as any).__ENV?.mapboxStyle || 'mapbox/streets-v12';
    // default view (Kenya-ish center)
    this.map = L.map(this.mapEl.nativeElement).setView([0.0236, 37.9062], 6);
    const url = `https://api.mapbox.com/styles/v1/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`;
    L.tileLayer(url, { maxZoom: 19, attribution: '&copy; Mapbox & OpenStreetMap' }).addTo(this.map);
  }

  geolocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      this.near = `${lat},${lng}`;
      if (this.map) this.map.setView([lat, lng], 11);
      this.search();
    });
  }

  search() {
    this.api.searchWarehouses({ q: this.q || undefined, near: this.near, radius_km: this.radiusKm }).subscribe({
      next: (res) => { this.warehouses = res.data || []; this.renderMarkers(); },
      error: () => { this.warehouses = []; this.renderMarkers(); }
    });
  }

  private renderMarkers() {
    const L = (window as any).L; if (!L || !this.map) return;
    // clear existing
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    for (const w of this.warehouses) {
      if (w.lat != null && w.lng != null) {
        const m = L.marker([w.lat, w.lng]).addTo(this.map).bindPopup(`<b>${w.name}</b><br/>${w.location || ''}`);
        this.markers.push(m);
      }
    }
  }

  intervalLabel(mode?: string | null): string {
    switch (mode) {
      case 'per_hour': return 'per hour';
      case 'per_day': return 'per day';
      case 'per_week': return 'per week';
      case 'per_month': return 'per month';
      case 'per_year': return 'per year';
      default: return '';
    }
  }
}
