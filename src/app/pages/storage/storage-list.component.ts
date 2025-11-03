import { Component, ElementRef, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicService, PublicWarehouse } from '../../public.service';
import { ImageCarouselComponent } from '../../shared/image-carousel/image-carousel.component';

@Component({
  selector: 'app-storage-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCarouselComponent],
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
  private markers: Record<string, any> = {};
  activeId: string | null = null;
  private cluster: any;

  constructor() { this.search(); }

  ngAfterViewInit(): void {
    const L = (window as any).L;
    if (!L) return;
    const token = (window as any).__ENV?.mapboxToken;
    const style = (window as any).__ENV?.mapboxStyle || 'mapbox/streets-v12';
    // default view (Kenya-ish center)
    this.map = L.map(this.mapEl.nativeElement, { zoomControl: true, attributionControl: true }).setView([0.0236, 37.9062], 6);
    const url = `https://api.mapbox.com/styles/v1/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`;
    L.tileLayer(url, { maxZoom: 19, attribution: '&copy; Mapbox & OpenStreetMap' }).addTo(this.map);
    this.cluster = (L as any).markerClusterGroup ? (L as any).markerClusterGroup({ chunkedLoading: true }) : null;
    if (this.cluster) this.map.addLayer(this.cluster);
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
    if (this.cluster) this.cluster.clearLayers();
    Object.values(this.markers).forEach(m => { try { this.map.removeLayer(m); } catch {} });
    this.markers = {};
    for (const w of this.warehouses) {
      if (w.lat != null && w.lng != null) {
        const popup = this.popupHtml(w);
        const m = (this.cluster ? (L.marker([w.lat, w.lng])) : L.marker([w.lat, w.lng]));
        if (this.cluster) { this.cluster.addLayer(m); } else { m.addTo(this.map); }
        m.bindPopup(popup, { autoPan: true, closeButton: true });
        m.on('mouseover', () => { this.activeId = w.id; this.scrollListTo(w.id); m.openPopup(); });
        m.on('mouseout', () => { if (this.activeId === w.id) this.activeId = null; });
        this.markers[w.id] = m;
      }
    }
  }

  focusWarehouse(w: PublicWarehouse) {
    if (!this.map || w.lat == null || w.lng == null) return;
    this.map.setView([w.lat, w.lng], 13, { animate: true });
    const m = this.markers[w.id];
    if (m) m.openPopup();
    this.activeId = w.id;
  }

  private popupHtml(w: PublicWarehouse): string {
    const loc = w.location ? `<div class="text-xs text-slate-600">${w.location}</div>` : '';
    const price = (w.priceAmount != null) ? `<div class=\"text-xs text-slate-900\">${(w.priceAmount as any).toLocaleString?.() || w.priceAmount} ${w.currency || ''} ${(this.intervalLabel(w.pricingMode)) ? '· ' + this.intervalLabel(w.pricingMode) : ''}</div>` : '';
    const imgs = Array.isArray((w as any).images) && (w as any).images.length ?
      `<div style=\"display:flex;gap:4px;margin-top:4px;overflow:auto;\">${((w as any).images as string[]).slice(0,3).map(u=>`<img src=\"${u}\" style=\"height:44px;width:66px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;\"/>`).join('')}</div>`
      : '';
    return `<div style=\"min-width:200px;\"><div class=\"text-sm font-semibold text-slate-900\">${w.name}</div>${loc}${price}${imgs}</div>`;
  }

  hoverWarehouse(w?: PublicWarehouse) {
    if (!w) { this.activeId = null; return; }
    this.activeId = w.id;
    const m = this.markers[w.id];
    if (m) { try { m.openPopup(); } catch {}
    }
  }

  private scrollListTo(id: string) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el && 'scrollIntoView' in el) {
      (el as any).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
