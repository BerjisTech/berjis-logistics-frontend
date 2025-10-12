import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div style="font-family: Inter, Arial, sans-serif; padding: 32px; max-width: 960px; margin: 0 auto;">
    <h1>Berjis Logistics</h1>
    <p style="color:#444; max-width: 720px;">Plan, store and move goods efficiently. Logistics brings together storage units, fleet, manufacturers, suppliers and order fulfillment in one place.</p>
    <div style="display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-top:16px;">
      <a routerLink="/storage" style="border:1px solid #ddd; border-radius:12px; padding:16px; display:block; text-decoration:none; color:inherit;">
        <h3>Storage</h3>
        <p>Find and manage warehouses and storage units.</p>
      </a>
      <div style="border:1px solid #ddd; border-radius:12px; padding:16px;">
        <h3>Fleet</h3>
        <p>Trucks, routes, drivers and delivery tracking.</p>
      </div>
      <div style="border:1px solid #ddd; border-radius:12px; padding:16px;">
        <h3>Suppliers</h3>
        <p>Connect with suppliers and manufacturers.</p>
      </div>
      <div style="border:1px solid #ddd; border-radius:12px; padding:16px;">
        <h3>Orders</h3>
        <p>Create, assign and track orders and shipments.</p>
      </div>
    </div>
  </div>
  `
})
export class HomeComponent {}
