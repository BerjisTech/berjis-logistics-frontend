import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehousesService, Warehouse } from './warehouses.service';
import { InventoryService, InventoryItem } from './inventory.service';
import { ApiService } from './api.service';

@Component({
  selector: 'app-storage-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div style="font-family: Inter, Arial, sans-serif; padding: 32px; max-width: 960px; margin: 0 auto;">
    <h2>Manage Storage</h2>
    <p>Create storage locations, manage units and staff. Requires login.</p>
    <form (submit)="onCreateWarehouse($event)">
      <input placeholder="Name" name="name" required />
      <input placeholder="Location" name="location" />
      <input type="number" step="any" placeholder="Lat" name="lat" />
      <input type="number" step="any" placeholder="Lng" name="lng" />
      <select name="state">
        <option value="available">available</option>
        <option value="occupied">occupied</option>
        <option value="maintenance">maintenance</option>
      </select>
      <label><input type="checkbox" name="isMultiUnit" /> Multi-unit</label>
      <button type="submit">Create</button>
    </form>
    <div style="margin: 8px 0;">
      <button (click)="toggleMap()">{{ showMap ? 'Hide' : 'Show' }} Map Picker</button>
    </div>
    <div *ngIf="showMap" id="map" style="height: 320px; border-radius: 8px; overflow: hidden; margin-bottom: 16px;"></div>

    <h3>My Warehouses</h3>
    <ul>
      <li *ngFor="let w of warehouses" (click)="select(w)" style="cursor:pointer;">
        <strong>{{w.name}}</strong> <small *ngIf="w['state']">— {{w['state']}}</small>
      </li>
    </ul>

    <section *ngIf="selected">
      <h4>Units — {{selected.name}}</h4>
      <form (submit)="onCreateUnit($event)">
        <input placeholder="Name" name="name" required />
        <input type="number" step="any" placeholder="Area (sqm)" name="areaSqm" />
        <select name="state">
          <option value="available">available</option>
          <option value="occupied">occupied</option>
          <option value="maintenance">maintenance</option>
        </select>
        <button type="submit">Add Unit</button>
      </form>
      <ul>
        <li *ngFor="let u of units">{{u.name}} <small>— {{u.state}}</small></li>
      </ul>

      <h4>Staff</h4>
      <form (submit)="onInviteStaff($event)">
        <input placeholder="User ID" name="userId" required />
        <select name="role">
          <option value="staff">staff</option>
          <option value="admin">admin</option>
          <option value="viewer">viewer</option>
        </select>
        <button type="submit">Invite</button>
      </form>
      <ul>
        <li *ngFor="let s of staff">{{s.userId}} — {{s.role}}</li>
      </ul>
    </section>
  </div>
  `
})
export class StorageManageComponent {
  private wh = inject(WarehousesService);
  private inv = inject(InventoryService);
  private core = inject(ApiService);
  warehouses: Warehouse[] = [];
  selected: Warehouse | null = null;
  units: any[] = [];
  staff: any[] = [];
  showMap = false; private mapInited = false; private map: any;
  userId: string | undefined;

  constructor() {
    this.core.verify().subscribe({ next: (r: any) => this.userId = r?.data?.uid?.toString(), error: () => {} });
    this.wh.list().subscribe({ next: r => this.warehouses = r.data, error: () => this.warehouses = [] });
  }

  toggleMap() {
    this.showMap = !this.showMap;
    if (this.showMap && !this.mapInited) {
      setTimeout(() => {
        // @ts-ignore
        const L = (window as any).L; if (!L) return;
        this.map = L.map('map').setView([0.0236, 37.9062], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(this.map);
        let marker: any = null;
        this.map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          const latInput = document.querySelector('input[name="lat"]') as HTMLInputElement;
          const lngInput = document.querySelector('input[name="lng"]') as HTMLInputElement;
          if (latInput) latInput.value = lat.toFixed(6);
          if (lngInput) lngInput.value = lng.toFixed(6);
          if (marker) { marker.setLatLng([lat, lng]); } else { marker = L.marker([lat, lng]).addTo(this.map); }
        });
        this.mapInited = true;
      }, 0);
    }
  }

  onCreateWarehouse(ev: Event) {
    ev.preventDefault(); const f = ev.target as HTMLFormElement;
    const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim();
    const location = (f.elements.namedItem('location') as HTMLInputElement).value.trim();
    const latRaw = (f.elements.namedItem('lat') as HTMLInputElement)?.value;
    const lngRaw = (f.elements.namedItem('lng') as HTMLInputElement)?.value;
    const state = (f.elements.namedItem('state') as HTMLSelectElement)?.value || 'available';
    const isMultiUnit = (f.elements.namedItem('isMultiUnit') as HTMLInputElement)?.checked || false;
    const lat = latRaw ? parseFloat(latRaw) : undefined;
    const lng = lngRaw ? parseFloat(lngRaw) : undefined;
    if (!name) return;
    this.wh.create({ name, location, lat: lat as any, lng: lng as any, state: state as any, isMultiUnit: isMultiUnit as any } as any, this.userId)
      .subscribe({ next: () => { f.reset(); this.wh.list().subscribe(r => this.warehouses = r.data); }, error: () => {} });
  }

  select(w: Warehouse) {
    this.selected = w; this.refreshUnits(); this.refreshStaff();
  }

  onCreateUnit(ev: Event) {
    ev.preventDefault(); if (!this.selected) return; const f = ev.target as HTMLFormElement;
    const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim();
    const areaRaw = (f.elements.namedItem('areaSqm') as HTMLInputElement).value;
    const state = (f.elements.namedItem('state') as HTMLSelectElement).value || 'available';
    const area = areaRaw ? parseFloat(areaRaw) : undefined;
    fetch(`/v1/warehouses/${this.selected.id}/units`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, areaSqm: area, state }) })
      .then(() => this.refreshUnits());
  }

  onInviteStaff(ev: Event) {
    ev.preventDefault(); if (!this.selected) return; const f = ev.target as HTMLFormElement;
    const uid = (f.elements.namedItem('userId') as HTMLInputElement).value.trim();
    const role = (f.elements.namedItem('role') as HTMLSelectElement).value || 'staff';
    fetch(`/v1/warehouses/${this.selected.id}/staff`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, role }) })
      .then(() => this.refreshStaff());
  }

  refreshUnits() {
    if (!this.selected) return;
    fetch(`/v1/warehouses/${this.selected.id}/units`).then(r => r.json()).then(r => this.units = r?.data || []);
  }
  refreshStaff() {
    if (!this.selected) return;
    fetch(`/v1/warehouses/${this.selected.id}/staff`).then(r => r.json()).then(r => this.staff = r?.data || []);
  }
}

