import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehousesService, Warehouse } from '../../warehouses.service';
import { InventoryService } from '../../inventory.service';
import { ApiService } from '../../api.service';
import { MapPickerComponent } from '../../components/map-picker/map-picker.component';
import { BookingCalendarComponent } from '../../components/booking-calendar/booking-calendar.component';
import { BookingsService, Booking } from '../../bookings.service';

@Component({
  selector: 'app-storage-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, MapPickerComponent, BookingCalendarComponent],
  templateUrl: './storage-manage.component.html'
})
export class StorageManagePageComponent {
  @ViewChild(MapPickerComponent) mapPicker?: MapPickerComponent;
  private wh = inject(WarehousesService);
  private inv = inject(InventoryService);
  private bookingsApi = inject(BookingsService);
  private core = inject(ApiService);
  readonly currencies = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR', 'INR'];
  readonly billingIntervals = [
    { value: 'per_hour', label: 'Per hour' },
    { value: 'per_day', label: 'Per day' },
    { value: 'per_week', label: 'Per week' },
    { value: 'per_month', label: 'Per month' },
    { value: 'per_year', label: 'Per year' }
  ];
  warehouses: Warehouse[] = [];
  selected: Warehouse | null = null;
  units: any[] = [];
  staff: any[] = [];
  bookings: Booking[] = [];
  userId: string | undefined;
  lat?: number; lng?: number;
  bookingsLoading = false;
  locationValue = '';
  locationOptions: { label: string; lat: number; lng: number }[] = [];
  locationLoading = false;
  private locationTimer?: any;
  private locationHideTimer?: any;
  private readonly mapboxToken: string | undefined = typeof window !== 'undefined'
    ? ((window as any).__ENV?.mapboxToken || (window as any).MAPBOX_TOKEN)
    : undefined;
  private readonly apiBase: string = (() => {
    if (typeof window === 'undefined') {
      return 'https://logistics-api.berjis.tech';
    }
    const configured = (window as any).__LOGISTICS_API__;
    const fallback = 'https://logistics-api.berjis.tech';
    const base = (typeof configured === 'string' && configured.trim().length > 0) ? configured.trim() : fallback;
    return base.replace(/\/+$/, '');
  })();

  constructor() {
    this.core.verify().subscribe({ next: (r: any) => { this.userId = this.core.userIdFrom(r); this.refreshWarehouses(); }, error: () => { this.refreshWarehouses(); } });
  }

  refreshWarehouses() {
    this.wh.list(this.userId).subscribe({
      next: r => {
        this.warehouses = r.data;
        if (this.warehouses.length && !this.selected) {
          this.select(this.warehouses[0]);
        }
      },
      error: () => { this.warehouses = []; this.selected = null; this.units = []; this.staff = []; this.bookings = []; }
    });
  }

  onMapSelected(p: {lat:number; lng:number}) {
    this.lat = p.lat; this.lng = p.lng;
    this.syncLatLngInputs();
  }

  onCreateWarehouse(ev: Event) {
    ev.preventDefault(); const f = ev.target as HTMLFormElement;
    const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim();
    const location = (f.elements.namedItem('location') as HTMLInputElement).value.trim();
    const state = (f.elements.namedItem('state') as HTMLSelectElement)?.value || 'available';
    const isMultiUnit = (f.elements.namedItem('isMultiUnit') as HTMLInputElement)?.checked || false;
    const priceAmountRaw = (f.elements.namedItem('priceAmount') as HTMLInputElement)?.value;
    const currency = (f.elements.namedItem('currency') as HTMLSelectElement)?.value || undefined;
    const pricingMode = (f.elements.namedItem('pricingMode') as HTMLSelectElement)?.value || undefined;
    const areaSqmRaw = (f.elements.namedItem('areaSqm') as HTMLInputElement)?.value;
    if (!name) return;
    const payload: any = {
      name,
      location,
      lat: this.lat,
      lng: this.lng,
      state,
      isMultiUnit,
      priceAmount: priceAmountRaw ? parseFloat(priceAmountRaw) : undefined,
      currency,
      pricingMode,
      areaSqm: areaSqmRaw ? parseFloat(areaSqmRaw) : undefined
    };
    this.wh.create(payload, this.userId)
      .subscribe({
        next: () => {
          f.reset();
          this.lat = undefined; this.lng = undefined;
          this.locationValue = '';
          this.locationOptions = [];
          this.refreshWarehouses();
        },
        error: () => {}
      });
  }

  select(w: Warehouse) {
    this.selected = w;
    void this.refreshUnits();
    void this.refreshStaff();
    this.refreshBookings();
  }

  async onCreateUnit(ev: Event) {
    ev.preventDefault();
    if (!this.selected) return;
    const f = ev.target as HTMLFormElement;
    const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim();
    const areaRaw = (f.elements.namedItem('areaSqm') as HTMLInputElement).value;
    const state = (f.elements.namedItem('state') as HTMLSelectElement).value || 'available';
    const area = areaRaw ? parseFloat(areaRaw) : undefined;
    if (!name) return;
    try {
      const res = await fetch(`${this.apiBase}/v1/warehouses/${this.selected.id}/units`, {
        method: 'POST',
        headers: this.apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name, areaSqm: area, state })
      });
      if (!res.ok) {
        return;
      }
      f.reset();
      await this.refreshUnits();
    } catch {}
  }

  async onInviteStaff(ev: Event) {
    ev.preventDefault();
    if (!this.selected) return;
    const f = ev.target as HTMLFormElement;
    const uid = (f.elements.namedItem('userId') as HTMLInputElement).value.trim();
    const role = (f.elements.namedItem('role') as HTMLSelectElement).value || 'staff';
    if (!uid) return;
    const permissions = {
      edit_prices: (f.elements.namedItem('perm_edit_prices') as HTMLInputElement)?.checked || false,
      edit_availability: (f.elements.namedItem('perm_edit_availability') as HTMLInputElement)?.checked || false,
      manage_discounts: (f.elements.namedItem('perm_manage_discounts') as HTMLInputElement)?.checked || false,
      manage_inventory: (f.elements.namedItem('perm_manage_inventory') as HTMLInputElement)?.checked || false,
      manage_units: (f.elements.namedItem('perm_manage_units') as HTMLInputElement)?.checked || false,
      manage_staff: (f.elements.namedItem('perm_manage_staff') as HTMLInputElement)?.checked || false,
    };
    try {
      const res = await fetch(`${this.apiBase}/v1/warehouses/${this.selected.id}/staff`, {
        method: 'POST',
        headers: this.apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ userId: uid, role, permissions })
      });
      if (!res.ok) {
        return;
      }
      await this.refreshStaff();
    } catch {}
  }

  async refreshUnits() {
    if (!this.selected) return;
    try {
      const res = await fetch(`${this.apiBase}/v1/warehouses/${this.selected.id}/units`, {
        headers: this.apiHeaders()
      });
      if (!res.ok) {
        this.units = [];
        return;
      }
      const json = await res.json().catch(() => null);
      this.units = json?.data || [];
    } catch {
      this.units = [];
    }
  }
  async refreshStaff() {
    if (!this.selected) return;
    try {
      const res = await fetch(`${this.apiBase}/v1/warehouses/${this.selected.id}/staff`, {
        headers: this.apiHeaders()
      });
      if (!res.ok) {
        this.staff = [];
        return;
      }
      const json = await res.json().catch(() => null);
      this.staff = json?.data || [];
    } catch {
      this.staff = [];
    }
  }

  refreshBookings() {
    if (!this.selected) { this.bookings = []; return; }
    this.bookingsLoading = true;
    this.bookingsApi.listForWarehouse(this.selected.id, this.userId).subscribe({
      next: r => { this.bookings = r.data || []; this.bookingsLoading = false; },
      error: () => { this.bookings = []; this.bookingsLoading = false; }
    });
  }

  onCreateBooking(ev: Event) {
    ev.preventDefault();
    if (!this.selected) return;
    const form = ev.target as HTMLFormElement;
    const start = (form.elements.namedItem('startDate') as HTMLInputElement).value;
    const end = (form.elements.namedItem('endDate') as HTMLInputElement).value || undefined;
    const spaceReservedRaw = (form.elements.namedItem('spaceReserved') as HTMLInputElement).value;
    if (!start) return;
    const payload: { startDate: string; endDate?: string; spaceReserved?: number } = { startDate: start };
    if (end) payload.endDate = end;
    if (spaceReservedRaw) payload.spaceReserved = parseFloat(spaceReservedRaw);
    this.bookingsApi.create(this.selected.id, payload, this.userId).subscribe({
      next: () => { form.reset(); this.refreshBookings(); },
      error: () => {}
    });
  }

  onCancelBooking(id: string) {
    this.bookingsApi.cancel(id, this.userId).subscribe({ next: () => this.refreshBookings() });
  }

  onLocationInput(value: string) {
    this.locationValue = value;
    if (this.locationTimer) {
      clearTimeout(this.locationTimer);
    }
    if (!value || !value.trim() || !this.mapboxToken) {
      this.locationOptions = [];
      this.locationLoading = false;
      return;
    }
    this.locationLoading = true;
    this.locationTimer = setTimeout(() => this.fetchLocationSuggestions(value.trim()), 300);
  }

  onLocationFocus() {
    if (this.locationHideTimer) {
      clearTimeout(this.locationHideTimer);
      this.locationHideTimer = undefined;
    }
  }

  onLocationBlur() {
    if (this.locationHideTimer) {
      clearTimeout(this.locationHideTimer);
    }
    this.locationHideTimer = setTimeout(() => {
      this.locationOptions = [];
      this.locationHideTimer = undefined;
    }, 200);
  }

  selectLocation(option: { label: string; lat: number; lng: number }) {
    if (this.locationHideTimer) {
      clearTimeout(this.locationHideTimer);
      this.locationHideTimer = undefined;
    }
    this.locationValue = option.label;
    this.locationOptions = [];
    this.locationLoading = false;
    this.lat = option.lat;
    this.lng = option.lng;
    this.syncLatLngInputs();
    this.mapPicker?.setPosition(option.lat, option.lng, 12);
  }

  private fetchLocationSuggestions(query: string) {
    if (!this.mapboxToken) {
      this.locationLoading = false;
      return;
    }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.mapboxToken}&autocomplete=true&limit=5`;
    fetch(url)
      .then(res => res.json())
      .then((data) => {
        const features = Array.isArray(data?.features) ? data.features : [];
        this.locationOptions = features.map((feature: any) => ({
          label: feature?.place_name || '',
          lat: feature?.center?.[1],
          lng: feature?.center?.[0]
        })).filter((opt: any) => typeof opt.lat === 'number' && typeof opt.lng === 'number' && opt.label);
        this.locationLoading = false;
      })
      .catch(() => {
        this.locationOptions = [];
        this.locationLoading = false;
      });
  }

  private apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (this.userId) {
      headers['X-User-UUID'] = this.userId;
    }
    return headers;
  }

  private syncLatLngInputs() {
    const latInput = document.querySelector('input[name="lat"]') as HTMLInputElement | null;
    const lngInput = document.querySelector('input[name="lng"]') as HTMLInputElement | null;
    if (latInput) latInput.value = this.lat != null ? this.lat.toFixed(6) : '';
    if (lngInput) lngInput.value = this.lng != null ? this.lng.toFixed(6) : '';
  }
}
