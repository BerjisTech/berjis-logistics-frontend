import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface MarketingCampaign {
  id: string;
  ownerUserId: string;
  name: string;
  objective?: string;
  channel?: string;
  status: string;
  budget?: number;
  spend: number;
  currency: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
}

export interface MarketingTarget {
  id: string;
  campaignId: string;
  contactId?: string;
  segment?: string;
  createdAt: string;
}

export interface MarketingEvent {
  id: string;
  campaignId: string;
  eventType: string;
  value?: number;
  occurredAt: string;
  metadata: unknown;
}

export interface CampaignDetail {
  campaign: MarketingCampaign;
  targets: MarketingTarget[];
  events: MarketingEvent[];
}

@Injectable({ providedIn: 'root' })
export class MarketingService {
  constructor(private http: HttpClient) {}

  private headers(userId?: string): HttpHeaders | undefined {
    return userId ? new HttpHeaders({ 'X-User-UUID': userId }) : undefined;
  }

  listCampaigns(params: { status?: string; q?: string; limit?: number; offset?: number } = {}, userId?: string) {
    let query = new HttpParams();
    if (params.status) query = query.set('status', params.status);
    if (params.q) query = query.set('q', params.q);
    if (params.limit != null) query = query.set('limit', String(params.limit));
    if (params.offset != null) query = query.set('offset', String(params.offset));
    return this.http.get<{ success: boolean; data: MarketingCampaign[] }>(`${base}/v1/marketing/campaigns`, { headers: this.headers(userId), params: query });
  }

  createCampaign(input: Partial<MarketingCampaign>, userId?: string) {
    return this.http.post<{ success: boolean; data: MarketingCampaign }>(`${base}/v1/marketing/campaigns`, input, { headers: this.headers(userId) });
  }

  updateCampaign(id: string, input: Partial<MarketingCampaign>, userId?: string) {
    return this.http.put<{ success: boolean; data: MarketingCampaign }>(`${base}/v1/marketing/campaigns/${encodeURIComponent(id)}`, input, { headers: this.headers(userId) });
  }

  getCampaign(id: string, userId?: string) {
    return this.http.get<{ success: boolean; data: CampaignDetail }>(`${base}/v1/marketing/campaigns/${encodeURIComponent(id)}`, { headers: this.headers(userId) });
  }

  addTarget(campaignId: string, input: { contactId?: string; segment?: string }, userId?: string) {
    return this.http.post<{ success: boolean; data: MarketingTarget }>(`${base}/v1/marketing/campaigns/${encodeURIComponent(campaignId)}/targets`, input, { headers: this.headers(userId) });
  }

  recordEvent(campaignId: string, input: { eventType: string; value?: number; occurredAt?: string; metadata?: Record<string, unknown> }, userId?: string) {
    return this.http.post<{ success: boolean; data: MarketingEvent }>(`${base}/v1/marketing/campaigns/${encodeURIComponent(campaignId)}/events`, input, { headers: this.headers(userId) });
  }
}
