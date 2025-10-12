import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { Component, inject, signal } from "@angular/core";
import { WarehousesService, Warehouse } from "./app/warehouses.service";

@Component({
  selector: "app-root",
  standalone: true,
  template: `
  <div style="font-family: Inter, Arial, sans-serif; padding: 32px; max-width: 720px">
    <h1>Berjis Logistics</h1>
    <h2>Warehouses</h2>
    <form (submit)="onCreate($event)">
      <input placeholder="Name" name="name" required />
      <input placeholder="Location" name="location" />
      <button type="submit">Create</button>
    </form>
    <div *ngIf="error" style="color:#b00">{{error}}</div>
    <ul>
      <li *ngFor="let w of warehouses">
        <strong>{{w.name}}</strong>
        <span *ngIf="w.location">— {{w.location}}</span>
        <button (click)="onDelete(w.id)" style="margin-left:8px">Delete</button>
      </li>
    </ul>
  </div>
  `
})
class AppComponent {
  private api = inject(WarehousesService);
  warehouses: Warehouse[] = [];
  error = "";
  constructor() { this.refresh(); }
  refresh() {
    this.api.list().subscribe({ next: (res) => this.warehouses = res.data, error: () => this.error = 'Failed to load' });
  }
  onCreate(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const location = (form.elements.namedItem('location') as HTMLInputElement).value.trim();
    if (!name) return;
    this.api.create({ name, location }).subscribe({ next: () => { form.reset(); this.refresh(); }, error: () => this.error = 'Create failed' });
  }
  onDelete(id: string) {
    this.api.remove(id).subscribe({ next: () => this.refresh(), error: () => this.error = 'Delete failed' });
  }
}

bootstrapApplication(AppComponent, { providers: [provideHttpClient()] }).catch(err => console.error(err));