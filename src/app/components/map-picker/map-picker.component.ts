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
  private mapbox?: any;
  private marker: any;
  private pendingPosition?: { lat: number; lng: number; zoom: number };
  private readonly defaultCenter: [number, number] = [37.9062, 0.0236];
  private readonly mapboxToken: string | undefined =
    typeof window !== 'undefined'
      ? ((window as any).__ENV?.mapboxToken || (window as any).MAPBOX_TOKEN)
      : undefined;
  private readonly mapboxStyle: string =
    typeof window !== 'undefined'
      ? ((window as any).__ENV?.mapboxStyle || 'mapbox/streets-v12')
      : 'mapbox/streets-v12';

  ngAfterViewInit(): void {
    const root: any = typeof window !== 'undefined' ? (window as any) : undefined;
    const mapbox = root?.mapboxgl;
    if (!mapbox || !this.mapboxToken || !this.mapEl?.nativeElement) {
      return;
    }
    this.mapbox = mapbox;
    this.mapbox.accessToken = this.mapboxToken;
    this.map = new this.mapbox.Map({
      container: this.mapEl.nativeElement,
      style: `mapbox://styles/${this.mapboxStyle}`,
      center: this.defaultCenter,
      zoom: 6
    });
    this.map.addControl(new this.mapbox.NavigationControl(), 'top-right');
    this.map.on('click', (event: any) => {
      const lngLat = event?.lngLat;
      if (!lngLat) {
        return;
      }
      const { lng, lat } = lngLat;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return;
      }
      this.applyPosition(lat, lng, this.map.getZoom());
      this.selected.emit({ lat, lng });
    });
    this.map.once('load', () => {
      if (this.pendingPosition) {
        const { lat, lng, zoom } = this.pendingPosition;
        this.pendingPosition = undefined;
        this.applyPosition(lat, lng, zoom);
      }
    });
  }

  setPosition(lat: number, lng: number, zoom: number = 12): void {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) {
      return;
    }
    if (!this.map) {
      this.pendingPosition = { lat, lng, zoom };
      return;
    }
    this.applyPosition(lat, lng, zoom);
  }

  private applyPosition(lat: number, lng: number, zoom: number = 12): void {
    if (!this.map || !this.mapbox) {
      this.pendingPosition = { lat, lng, zoom };
      return;
    }
    this.map.flyTo({ center: [lng, lat], zoom, essential: true });
    if (this.marker) {
      this.marker.setLngLat([lng, lat]);
    } else {
      this.marker = new this.mapbox.Marker({ color: '#facc15' })
        .setLngLat([lng, lat])
        .addTo(this.map);
    }
  }
}
