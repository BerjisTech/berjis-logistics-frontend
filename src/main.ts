import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WarehousesService, Warehouse } from "./app/warehouses.service";
import { InventoryService, InventoryItem } from "./app/inventory.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div style="font-family: Inter, Arial, sans-serif; padding: 32px; max-width: 960px">
    <h1>Berjis Logistics</h1>
    <h2>Warehouses</h2>
    <form (submit)="onCreateWarehouse($event)">
      <input placeholder="Name" name="name" required />
      <input placeholder="Location" name="location" />
      <button type="submit">Create</button>
    </form>
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
  warehouses: Warehouse[] = [];
  error = "";
  selected: Warehouse | null = null;
  inventory: InventoryItem[] = [];
  editId: string | null = null;
  constructor() { this.refreshWarehouses(); }
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
    if (!name) return;
    this.whApi.create({ name, location }).subscribe({ next: () => { form.reset(); this.refreshWarehouses(); }, error: () => this.error = 'Create failed' });
  }
  onUpdateWarehouse(ev: Event, id: string) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const location = (form.elements.namedItem('location') as HTMLInputElement).value.trim();
    this.whApi.update(id, { name, location }).subscribe({ next: () => { this.editId = null; this.refreshWarehouses(); }, error: () => this.error = 'Update failed' });
  }
  onDeleteWarehouse(id: string) {
    this.whApi.remove(id).subscribe({ next: () => { this.refreshWarehouses(); if (this.selected && this.selected.id === id) { this.selected = null; this.inventory = []; } }, error: () => this.error = 'Delete failed' });
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
