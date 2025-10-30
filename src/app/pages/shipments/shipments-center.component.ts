import { AfterViewInit, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShipmentsService, ShipmentDetail, ShipmentSummary, ShipmentRouteStop } from '../../shipments.service';
import { ApiService } from '../../api.service';
import { AnalyticsService, ShipmentsAnalytics } from '../../analytics.service';

interface PendingAssignment {
  stopId: string;
  seq: number;
  address: string;
}

@Component({
  selector: 'app-shipments-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipments-center.component.html'
})
export class ShipmentsCenterComponent implements AfterViewInit {
  private shipmentsApi = inject(ShipmentsService);
  private coreApi = inject(ApiService);
  private analytics = inject(AnalyticsService);

  shipments = signal<ShipmentSummary[]>([]);
  selected = signal<ShipmentSummary | null>(null);
  detail = signal<ShipmentDetail | null>(null);
  loadingList = signal(false);
  loadingDetail = signal(false);
  createMessage = signal<string | null>(null);
  pendingAssignment = signal<PendingAssignment | null>(null);
  summary = signal<ShipmentsAnalytics | null>(null);

  userId?: string;

  @ViewChild('map', { static: false }) mapEl?: ElementRef<HTMLDivElement>;
  private map: any;
  private stopMarkers: any[] = [];
  private routePolyline?: any;
  private positionPolyline?: any;
  private vehicleMarker?: any;

  constructor() {
    this.coreApi.verify().subscribe({
      next: (res: any) => {
        this.userId = res?.data?.uid?.toString();
        this.loadShipments();
        this.loadSummary();
      },
      error: () => {
        this.loadShipments();
        this.loadSummary();
      }
    });
  }

  ngAfterViewInit(): void {
    this.ensureMap();
  }

  loadShipments(focusId?: string): void {
    this.loadingList.set(true);
    this.shipmentsApi.list(this.userId).subscribe({
      next: (res) => {
        const data = res.data || [];
        this.shipments.set(data);
        this.loadingList.set(false);
        if (focusId) {
          const focus = data.find((row) => row.id === focusId);
          if (focus) {
            this.selectShipment(focus);
            return;
          }
        }
        const current = this.selected();
        const stillExists = current ? data.some((row) => row.id === current.id) : false;
        if (!stillExists && data.length) {
          this.selectShipment(data[0]);
        }
        this.loadSummary();
      },
      error: () => {
        this.shipments.set([]);
        this.loadingList.set(false);
        this.summary.set(null);
      }
    });
  }

  selectShipment(row: ShipmentSummary): void {
    this.selected.set(row);
    this.loadShipmentDetail(row.id);
  }

  loadShipmentDetail(id: string): void {
    this.loadingDetail.set(true);
    this.shipmentsApi.track(id, this.userId).subscribe({
      next: (res) => {
        this.detail.set(res.data);
        this.loadingDetail.set(false);
        setTimeout(() => this.renderMap(), 0);
      },
      error: () => {
        this.detail.set(null);
        this.loadingDetail.set(false);
      }
    });
  }

  onCreateShipment(ev: Event): void {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const orderId = (form.elements.namedItem('orderId') as HTMLInputElement).value.trim() || undefined;
    const vehicleId = (form.elements.namedItem('vehicleId') as HTMLInputElement).value.trim() || undefined;
    const driverId = (form.elements.namedItem('driverId') as HTMLInputElement).value.trim() || undefined;
    const routeRaw = (form.elements.namedItem('routeAddresses') as HTMLTextAreaElement).value;
    const route = routeRaw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length)
      .map((address) => ({ address }));
    this.createMessage.set(null);
    this.shipmentsApi.create({ orderId, vehicleId, driverId, route }, this.userId).subscribe({
      next: (res) => {
        form.reset();
        this.createMessage.set('Shipment created.');
        const focusId = res?.data?.id;
        this.loadShipments(focusId);
      },
      error: (err) => {
        this.createMessage.set(err?.error?.message || 'Failed to create shipment.');
      }
    });
  }

  addStop(ev: Event, shipmentId: string): void {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const address = (form.elements.namedItem('address') as HTMLInputElement).value.trim();
    if (!address) return;
    this.shipmentsApi.addRouteStop(shipmentId, address, this.userId).subscribe({
      next: () => {
        form.reset();
        this.loadShipmentDetail(shipmentId);
      }
    });
  }

  startAssignCoords(stop: ShipmentRouteStop): void {
    this.pendingAssignment.set({ stopId: stop.id, seq: stop.seq, address: stop.address });
  }

  cancelAssignCoords(): void {
    this.pendingAssignment.set(null);
  }

  loadSummary(): void {
    this.analytics.shipments(this.userId).subscribe({
      next: (res) => this.summary.set(res.data || null),
      error: () => this.summary.set(null)
    });
  }

  private ensureMap(): void {
    if (this.map || !this.mapEl) {
      return;
    }
    const L = (window as any).L;
    if (!L) {
      return;
    }
    const token = (window as any).__ENV?.mapboxToken;
    const style = (window as any).__ENV?.mapboxStyle || 'mapbox/streets-v12';
    this.map = L.map(this.mapEl.nativeElement).setView([0.0236, 37.9062], 5);
    const url = `https://api.mapbox.com/styles/v1/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${token}`;
    L.tileLayer(url, { maxZoom: 19, attribution: '&copy; Mapbox & OpenStreetMap' }).addTo(this.map);
    this.map.on('click', (evt: any) => this.onMapClick(evt));
  }

  private onMapClick(evt: any): void {
    const assignment = this.pendingAssignment();
    if (!assignment) {
      return;
    }
    const { lat, lng } = evt.latlng || {};
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return;
    }
    this.shipmentsApi.setRouteStopCoords(assignment.stopId, lat, lng, this.userId).subscribe({
      next: () => {
        this.pendingAssignment.set(null);
        const current = this.selected();
        if (current) {
          this.loadShipmentDetail(current.id);
        }
      }
    });
  }

  private renderMap(): void {
    this.ensureMap();
    if (!this.map) {
      return;
    }
    const L = (window as any).L;
    if (!L) {
      return;
    }
    // Clear layers
    this.stopMarkers.forEach((marker) => this.map.removeLayer(marker));
    this.stopMarkers = [];
    if (this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
      this.routePolyline = undefined;
    }
    if (this.positionPolyline) {
      this.map.removeLayer(this.positionPolyline);
      this.positionPolyline = undefined;
    }
    if (this.vehicleMarker) {
      this.map.removeLayer(this.vehicleMarker);
      this.vehicleMarker = undefined;
    }

    const detail = this.detail();
    if (!detail) {
      return;
    }

    const bounds: any[] = [];
    const routeCoords = detail.route
      .filter((stop) => typeof stop.lat === 'number' && typeof stop.lng === 'number')
      .map((stop) => [stop.lat as number, stop.lng as number]);
    if (routeCoords.length) {
      this.routePolyline = L.polyline(routeCoords, { color: '#facc15', weight: 4, dashArray: '6,4' }).addTo(this.map);
      routeCoords.forEach((coord) => bounds.push(coord));
    }
    detail.route.forEach((stop) => {
      if (typeof stop.lat === 'number' && typeof stop.lng === 'number') {
        const marker = L.marker([stop.lat, stop.lng]).addTo(this.map).bindPopup(
          `<strong>Stop ${stop.seq}</strong><br/>${stop.address}<br/><small>Status: ${stop.status}</small>`
        );
        this.stopMarkers.push(marker);
      }
    });

    const positions = [...detail.positions].reverse();
    const positionCoords = positions.map((pos) => [pos.lat, pos.lng]);
    if (positionCoords.length) {
      this.positionPolyline = L.polyline(positionCoords, { color: '#2563eb', weight: 3 }).addTo(this.map);
      positionCoords.forEach((coord) => bounds.push(coord));
    }

    const delivery = detail.delivery;
    if (typeof delivery.lat === 'number' && typeof delivery.lng === 'number') {
      this.vehicleMarker = L.marker([delivery.lat, delivery.lng], {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      })
        .addTo(this.map)
        .bindPopup(`<strong>Vehicle</strong><br/>${delivery.plate || ''}`);
      bounds.push([delivery.lat, delivery.lng]);
    }

    if (bounds.length) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }
}
