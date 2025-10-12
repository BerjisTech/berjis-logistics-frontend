import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WarehousesService, Warehouse } from "./app/warehouses.service";
import { InventoryService, InventoryItem } from "./app/inventory.service";
import { ApiService } from "./app/api.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div style="font-family: Inter, Arial, sans-serif; padding: 32px; max-width: 960px">
    <h1>Berjis Logistics</h1>
    <h2>Warehouses</h2>
    <form *ngIf="authed" (submit)="onCreateWarehouse($event)">
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
    <div *ngIf="authed" style="margin: 8px 0;">
      <button (click)="toggleMap()">{{ showMap ? 'Hide' : 'Show' }} Map Picker</button>
    </div>
    <div *ngIf="showMap" id="map" style="height: 320px; border-radius: 8px; overflow: hidden; margin-bottom: 16px;"></div>
    <div *ngIf="error" style="color:#b00; margin:8px 0">{{error}}</div>
    <ul>
      <li *ngFor="let w of warehouses" [style.marginBottom.px]="8">
        <ng-container *ngIf="editId !== w.id; else editForm">
          <a href="#" (click)="select(w); $event.preventDefault()"><strong>{{w.name}}</strong></a>
          <span *ngIf="w.location">— {{w.location}}</span>
          <button (click)="startEdit(w)" style="margin-left:8px">Edit</button>
          <button (click)="onDeleteWarehouse(w.id)" style="margin-left:8px">Delete</button>
        </ng-container>
        <ng-template #editForm>
          <form (submit)="onUpdateWarehouse($event, w.id)">
            <input name="name" [value]="w.name" required />
            <input name="location" [value]="w.location" />
            <button type="submit">Save</button>
            <button type="button" (click)="cancelEdit()">Cancel</button>
          </form>
        </ng-template>
      </li>
    </ul>

    <section *ngIf="selected">
      <h3>Inventory — {{selected.name}}</h3>
      <form (submit)="onCreateItem($event)">
        <input placeholder="SKU" name="sku" required />
        <input placeholder="Name" name="name" required />
        <input type="number" placeholder="Qty" name="quantity" min="0" value="0" />
        <button type="submit">Add Item</button>
      </form>
      <ul>
        <li *ngFor="let it of inventory">
          <strong>{{it.sku}}</strong> — {{it.name}} ({{it.quantity}})
          <button (click)="onDeleteItem(it.id)">Delete</button>
        </li>
      </ul>
    </section>
  </div>
  `
})
class AppComponent {
  private whApi = inject(WarehousesService);
  private invApi = inject(InventoryService);
  private core = inject(ApiService);
  warehouses: Warehouse[] = [];
  error = "";
  selected: Warehouse | null = null;
  inventory: InventoryItem[] = [];
  editId: string | null = null;
  authed = false;
  userId: string | undefined;
  showMap = false;
  private mapInited = false;
  private map: any;
  constructor() {
    this.core.verify().subscribe({
      next: (res: any) => {
        this.core.me = res?.data || null;
        this.authed = !!this.core.me;
        this.userId = this.core.me?.id;
        this.refreshWarehouses();
      },
      error: () => { this.authed = false; this.refreshWarehouses(); }
    });
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
  refreshWarehouses() {
    this.whApi.list().subscribe({ next: (res) => this.warehouses = res.data, error: () => this.error = 'Failed to load' });
  }
  select(w: Warehouse) {
    this.selected = w;
    this.invApi.list(w.id).subscribe({ next: (res) => this.inventory = res.data, error: () => this.error = 'Failed to load inventory' });
  }
  startEdit(w: Warehouse) { this.editId = w.id; }
  cancelEdit() { this.editId = null; }
  onCreateWarehouse(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const location = (form.elements.namedItem('location') as HTMLInputElement).value.trim();
    const latRaw = (form.elements.namedItem('lat') as HTMLInputElement)?.value;
    const lngRaw = (form.elements.namedItem('lng') as HTMLInputElement)?.value;
    const state = (form.elements.namedItem('state') as HTMLSelectElement)?.value || 'available';
    const isMultiUnit = (form.elements.namedItem('isMultiUnit') as HTMLInputElement)?.checked || false;
    if (!name) return;
    const lat = latRaw ? parseFloat(latRaw) : undefined;
    const lng = lngRaw ? parseFloat(lngRaw) : undefined;
    this.whApi.create({ name, location, lat: lat as any, lng: lng as any, state: state as any, isMultiUnit: isMultiUnit as any } as any, this.userId)
      .subscribe({ next: () => { form.reset(); this.refreshWarehouses(); }, error: () => this.error = 'Create failed' });
  }
  onUpdateWarehouse(ev: Event, id: string) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const location = (form.elements.namedItem('location') as HTMLInputElement).value.trim();
    this.whApi.update(id, { name, location } as any, this.userId).subscribe({ next: () => { this.editId = null; this.refreshWarehouses(); }, error: () => this.error = 'Update failed' });
  }
  onDeleteWarehouse(id: string) {
    this.whApi.remove(id, this.userId).subscribe({ next: () => { this.refreshWarehouses(); if (this.selected && this.selected.id === id) { this.selected = null; this.inventory = []; } }, error: () => this.error = 'Delete failed' });
  }
  onCreateItem(ev: Event) {
    ev.preventDefault();
    if (!this.selected) return;
    const form = ev.target as HTMLFormElement;
    const sku = (form.elements.namedItem('sku') as HTMLInputElement).value.trim();
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const qty = parseInt((form.elements.namedItem('quantity') as HTMLInputElement).value || '0', 10) || 0;
    if (!sku || !name) return;
    this.invApi.create(this.selected.id, { sku, name, quantity: qty }).subscribe({ next: () => { form.reset(); this.select(this.selected!); }, error: () => this.error = 'Add item failed' });
  }
  onDeleteItem(id: string) {
    if (!this.selected) return;
    this.invApi.remove(this.selected.id, id).subscribe({ next: () => this.select(this.selected!), error: () => this.error = 'Delete item failed' });
  }
}

bootstrapApplication(AppComponent, { providers: [provideHttpClient()] }).catch(err => console.error(err));
