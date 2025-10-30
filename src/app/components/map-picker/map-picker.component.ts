import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-picker.component.html'
})
export class MapPickerComponent implements AfterViewInit {
  @ViewChild('map', { static: true }) mapEl!: ElementRef<HTMLDivElement>;
  @Output() selected = new EventEmitter<{ lat: number; lng: number }>();
  private map: any;
  private marker: any;
  private pendingPosition?: { lat: number; lng: number; zoom?: number };

  ngAfterViewInit(): void {
    // @ts-ignore: Leaflet provided by index.html script include
    const L = (window as any).L;
    if (!L) return;
    this.map = L.map(this.mapEl.nativeElement).setView([0.0236, 37.9062], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.selected.emit({ lat, lng });
      if (this.marker) { this.marker.setLatLng([lat, lng]); }
      else { this.marker = L.marker([lat, lng]).addTo(this.map); }
    });
    if (this.pendingPosition) {
      const { lat, lng, zoom } = this.pendingPosition;
      this.applyPosition(lat, lng, zoom);
      this.pendingPosition = undefined;
    }
  }

  setPosition(lat: number, lng: number, zoom: number = 12): void {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (!this.map) {
      this.pendingPosition = { lat, lng, zoom };
      return;
    }
    this.applyPosition(lat, lng, zoom);
  }

  private applyPosition(lat: number, lng: number, zoom: number = 12): void {
    const L = (window as any).L;
    if (!this.map || !L) return;
    this.map.setView([lat, lng], zoom);
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
  }
}
