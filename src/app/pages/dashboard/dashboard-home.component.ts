import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AnalyticsService } from '../../analytics.service';

type RoleKey = 'storage_owner' | 'truck_owner' | 'driver' | 'staff';

interface Metric {
  title: string;
  value: string;
  trend?: number;
  context: string;
}

interface RoleCard {
  key: RoleKey;
  title: string;
  description: string;
  cta: string;
}

interface QuickAction {
  label: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent {
  private http = inject(HttpClient);
  private analytics = inject(AnalyticsService);
  base = environment.apiBase;
  loading = signal(false);
  error = signal<string | null>(null);
  roles = signal<Record<RoleKey, boolean>>({ storage_owner: false, truck_owner: false, driver: false, staff: false });
  metrics: Metric[] = [
    { title: 'Storage utilisation', value: '—', context: 'Average occupancy across your warehouses.' },
    { title: 'OTIF performance', value: '—', context: 'Deliveries completed on time for your assignments.' },
    { title: 'Marketplace velocity', value: '—', context: 'Products published in the last 7 days.' },
    { title: 'Fleet availability', value: '—', context: 'Vehicles currently available to dispatch.' },
    { title: 'Outstanding invoices', value: '—', context: 'Total amount due across open invoices.' },
    { title: 'Campaigns running', value: '—', context: 'Live marketing campaigns currently running.' }
  ];
  readonly roleCards: RoleCard[] = [
    { key: 'storage_owner', title: 'Storage owner', description: 'Publish warehouse nodes, manage pricing, and invite collaborators.', cta: 'Manage storage' },
    { key: 'truck_owner', title: 'Fleet owner', description: 'Register vehicles, assign drivers, and monetise idle capacity.', cta: 'View fleet' },
    { key: 'driver', title: 'Driver marketplace', description: 'Join the network, accept transport jobs, and track earnings.', cta: 'Driver jobs' },
    { key: 'staff', title: 'Operations staff', description: 'Assist warehouse owners with bookings, inventory, and service levels.', cta: 'Open bookings' }
  ];
  readonly quickActions: QuickAction[] = [
    { label: 'Plan new route', description: 'Design a multi-leg shipment and sync devices for live telemetry.', link: '/shipments' },
    { label: 'Launch storefront', description: 'Curate products, configure pricing, and share a direct sales link.', link: '/dashboard/stores' },
    { label: 'Invite stakeholders', description: 'Onboard clients or partners with tailored permissions.', link: '/dashboard/storage' },
    { label: 'Reconcile finances', description: 'Issue invoices, record payments, and audit ledger activity.', link: '/finance' },
    { label: 'Launch marketing', description: 'Create campaigns, target audiences, and log engagement events.', link: '/marketing' }
  ];

  constructor(){ this.load(); }
  async load() {
    this.loading.set(true); this.error.set(null);
    try {
      const res = await this.http.get<any>(`${this.base}/v1/apps/logistics/roles`, { withCredentials: true }).toPromise();
      const list: string[] = res?.data || [];
      const current: Record<RoleKey, boolean> = { storage_owner: false, truck_owner: false, driver: false, staff: false };
      list.forEach(k => { if (k.endsWith('.storage_owner')) current.storage_owner = true; if (k.endsWith('.truck_owner')) current.truck_owner = true; if (k.endsWith('.driver')) current.driver = true; if (k.endsWith('.staff')) current.staff = true; });
      this.roles.set(current);
      this.loadAnalytics();
    } catch (e: any) { this.error.set('Please log in to manage roles.'); }
    finally { this.loading.set(false); }
  }
  async toggle(role: RoleKey) {
    this.error.set(null);
    try {
      if (this.roles()[role]) await this.http.delete(`${this.base}/v1/apps/logistics/roles/${role}`, { withCredentials: true }).toPromise();
      else await this.http.post(`${this.base}/v1/apps/logistics/roles`, { role }, { withCredentials: true }).toPromise();
      this.load();
    } catch (e: any) { this.error.set(e?.error?.message || 'Failed to update'); }
  }

  loadAnalytics() {
    this.analytics.dashboard().subscribe({
      next: (res) => {
        if (!res?.success || !res.data) return;
        const d = res.data;
        this.metrics = [
          { title: 'Storage utilisation', value: `${d.storageUtilisation.toFixed(1)}%`, trend: undefined, context: 'Average occupancy across your warehouses.' },
          { title: 'OTIF performance', value: `${d.otifPercentage.toFixed(1)}%`, trend: undefined, context: 'Deliveries completed on time for your fleet and drivers.' },
          { title: 'Marketplace velocity', value: `${d.marketplaceVelocity} new SKUs`, trend: undefined, context: 'Products added in the last 7 days.' },
          { title: 'Fleet availability', value: `${d.fleetAvailable} assets`, trend: undefined, context: 'Vehicles currently available to dispatch.' },
          { title: 'Outstanding invoices', value: `${d.invoiceDue.toFixed(2)} due`, trend: undefined, context: 'Total amount due across open invoices.' },
          { title: 'Campaigns running', value: `${d.campaignsRunning} live`, trend: undefined, context: 'Marketing campaigns currently running.' }
        ];
      },
      error: () => {}
    });
  }
}
