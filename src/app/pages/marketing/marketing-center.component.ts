import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketingService, MarketingCampaign, CampaignDetail } from '../../marketing.service';
import { ApiService } from '../../api.service';

type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';

@Component({
  selector: 'app-marketing-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketing-center.component.html'
})
export class MarketingCenterComponent {
  private marketing = inject(MarketingService);
  private core = inject(ApiService);

  campaigns = signal<MarketingCampaign[]>([]);
  loadingCampaigns = signal(false);
  statusFilter = signal<CampaignStatus | ''>('');
  query = signal('');

  selected = signal<CampaignDetail | null>(null);
  selecting = signal(false);

  message = signal<string | null>(null);
  error = signal<string | null>(null);

  private userId?: string;

  constructor() {
    this.core.verify().subscribe({
      next: (res: any) => {
        this.userId = res?.data?.uid?.toString();
        this.loadCampaigns();
      },
      error: () => this.loadCampaigns()
    });
  }

  loadCampaigns() {
    this.loadingCampaigns.set(true);
    this.marketing.listCampaigns({ status: this.statusFilter() || undefined, q: this.query() || undefined }, this.userId).subscribe({
      next: (res) => {
        this.campaigns.set(res.data || []);
        this.loadingCampaigns.set(false);
      },
      error: () => {
        this.campaigns.set([]);
        this.loadingCampaigns.set(false);
      }
    });
  }

  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.query.set(value);
    this.loadCampaigns();
  }

  onStatusSelect(value: string) {
    this.onStatusChange(value as CampaignStatus | '');
  }

  onStatusChange(status: CampaignStatus | '') {
    this.statusFilter.set(status);
    this.loadCampaigns();
  }

  selectCampaign(campaign: MarketingCampaign) {
    this.selecting.set(true);
    this.marketing.getCampaign(campaign.id, this.userId).subscribe({
      next: (res) => {
        this.selected.set(res.data);
        this.selecting.set(false);
      },
      error: () => {
        this.selected.set(null);
        this.selecting.set(false);
      }
    });
  }

  createCampaign(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    if (!name) return;
    const objective = (form.elements.namedItem('objective') as HTMLInputElement).value.trim() || undefined;
    const channel = (form.elements.namedItem('channel') as HTMLInputElement).value.trim() || undefined;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as CampaignStatus;
    const budgetRaw = parseFloat((form.elements.namedItem('budget') as HTMLInputElement).value);
    const currency = (form.elements.namedItem('currency') as HTMLInputElement).value.trim() || undefined;
    const startsAt = (form.elements.namedItem('startsAt') as HTMLInputElement).value || undefined;
    const endsAt = (form.elements.namedItem('endsAt') as HTMLInputElement).value || undefined;
    this.marketing.createCampaign({ name, objective, channel, status, budget: isNaN(budgetRaw) ? undefined : budgetRaw, currency, startsAt: startsAt || undefined, endsAt: endsAt || undefined }, this.userId)
      .subscribe({
        next: (res) => {
          form.reset();
          this.message.set('Campaign created.');
          this.loadCampaigns();
          if (res.data) this.selectCampaign(res.data);
        },
        error: (err) => this.error.set(err?.error?.message || 'Failed to create campaign.')
      });
  }

  updateStatus(campaign: MarketingCampaign, status: CampaignStatus) {
    this.marketing.updateCampaign(campaign.id, { status }, this.userId).subscribe({
      next: () => {
        this.message.set('Campaign updated.');
        this.loadCampaigns();
        this.refreshSelected(campaign.id);
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to update campaign.')
    });
  }

  addTarget(ev: Event, campaignId: string) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const contactId = (form.elements.namedItem('contactId') as HTMLInputElement).value.trim() || undefined;
    const segment = (form.elements.namedItem('segment') as HTMLInputElement).value.trim() || undefined;
    this.marketing.addTarget(campaignId, { contactId, segment }, this.userId).subscribe({
      next: () => {
        form.reset();
        this.message.set('Target added.');
        this.refreshSelected(campaignId);
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to add target.')
    });
  }

  recordEvent(ev: Event, campaignId: string) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const eventType = (form.elements.namedItem('eventType') as HTMLSelectElement).value;
    const value = parseFloat((form.elements.namedItem('value') as HTMLInputElement).value);
    const occurredAt = (form.elements.namedItem('occurredAt') as HTMLInputElement).value || undefined;
    const metadataRaw = (form.elements.namedItem('eventMetadata') as HTMLTextAreaElement).value.trim();
    let metadata: Record<string, unknown> | undefined;
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw);
      } catch {
        this.error.set('Event metadata must be valid JSON.');
        return;
      }
    }
    this.marketing.recordEvent(campaignId, { eventType, value: isNaN(value) ? undefined : value, occurredAt: occurredAt || undefined, metadata }, this.userId).subscribe({
      next: () => {
        form.reset();
        this.message.set('Event recorded.');
        this.refreshSelected(campaignId);
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to record event.')
    });
  }

  private refreshSelected(id: string) {
    this.marketing.getCampaign(id, this.userId).subscribe({
      next: (res) => this.selected.set(res.data),
      error: () => this.selected.set(null)
    });
  }
}
