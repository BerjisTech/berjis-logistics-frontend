import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tracking-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking-demo.component.html'
})
export class TrackingDemoPageComponent implements AfterViewInit {
  @ViewChild('map', { static: true }) mapEl!: ElementRef<HTMLDivElement>;
  vehicleId = '';
  assetId = '';
  private map: any;
  private markers: Record<string, any> = {};
  private socket?: WebSocket;

  ngAfterViewInit(): void {
    const L = (window as any).L;
    if (!L) return;
    const token = (window as any).__ENV?.mapboxToken;
    const style = (window as any).__ENV?.mapboxStyle || 'mapbox/streets-v12';
    this.map = L.map(this.mapEl.nativeElement).setView([0.0236, 37.9062], 6);
    const url = `https://api.mapbox.com/styles/v1/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`;
    L.tileLayer(url, { maxZoom: 19, attribution: '&copy; Mapbox & OpenStreetMap' }).addTo(this.map);
  }

  connect() {
    if (this.socket) { this.socket.close(); }
    const qs: string[] = [];
    if (this.vehicleId) qs.push('vehicleId=' + encodeURIComponent(this.vehicleId));
    if (this.assetId) qs.push('assetId=' + encodeURIComponent(this.assetId));
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${proto}://${location.host}/v1/ws/positions${qs.length ? ('?' + qs.join('&')) : ''}`;
    this.socket = new WebSocket(url);
    this.socket.onmessage = (ev) => this.onMessage(ev.data);
  }

  onMessage(data: any) {
    try {
      const msg = JSON.parse(data);
      if ((msg.kind === 'vehicle' || msg.kind === 'asset') && typeof msg.lat === 'number') {
        this.upsertMarker(`${msg.kind}:${msg.id}`, msg.lat, msg.lng, `${msg.kind} ${msg.id}`);
      }
    } catch {}
  }

  private upsertMarker(key: string, lat: number, lng: number, label: string) {
    const L = (window as any).L; if (!L || !this.map) return;
    const existing = this.markers[key];
    if (existing) { existing.setLatLng([lat, lng]).bindPopup(label); }
    else {
      const m = L.marker([lat, lng]).addTo(this.map).bindPopup(label);
      this.markers[key] = m;
    }
    this.map.setView([lat, lng]);
  }
}

