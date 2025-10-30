import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

const base = (typeof window !== 'undefined' && (window as any).__LOGISTICS_API__) || 'https://logistics-api.berjis.tech';

export interface Invoice {
  id: string;
  ownerUserId: string;
  customerContactId?: string;
  reference?: string;
  status: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountDue: number;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  paidTotal: number;
  outstandingState: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  createdAt: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  ownerUserId: string;
  method?: string;
  amount: number;
  currency: string;
  status: string;
  reference?: string;
  processedAt?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  ownerUserId: string;
  kind: 'revenue' | 'expense' | 'adjustment';
  reference?: string;
  amount: number;
  currency: string;
  occurredAt: string;
  metadata: unknown;
  createdAt: string;
}

export interface InvoiceDetail {
  invoice: Invoice;
  lines: InvoiceLine[];
  payments: InvoicePayment[];
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  constructor(private http: HttpClient) {}

  private headers(userId?: string): HttpHeaders | undefined {
    return userId ? new HttpHeaders({ 'X-User-ID': userId }) : undefined;
  }

  listInvoices(params: { status?: string; q?: string; limit?: number; offset?: number } = {}, userId?: string) {
    let query = new HttpParams();
    if (params.status) query = query.set('status', params.status);
    if (params.q) query = query.set('q', params.q);
    if (params.limit != null) query = query.set('limit', String(params.limit));
    if (params.offset != null) query = query.set('offset', String(params.offset));
    return this.http.get<{ success: boolean; data: Invoice[] }>(`${base}/v1/finance/invoices`, { headers: this.headers(userId), params: query });
  }

  createInvoice(input: Partial<Invoice> & { customerContactId?: string }, userId?: string) {
    return this.http.post<{ success: boolean; data: Invoice }>(`${base}/v1/finance/invoices`, input, { headers: this.headers(userId) });
  }

  updateInvoice(id: string, input: Partial<Invoice>, userId?: string) {
    return this.http.put<{ success: boolean; data: Invoice }>(`${base}/v1/finance/invoices/${encodeURIComponent(id)}`, input, { headers: this.headers(userId) });
  }

  getInvoice(id: string, userId?: string) {
    return this.http.get<{ success: boolean; data: InvoiceDetail }>(`${base}/v1/finance/invoices/${encodeURIComponent(id)}`, { headers: this.headers(userId) });
  }

  addInvoiceLine(id: string, input: { description: string; quantity?: number; unitPrice?: number; taxRate?: number }, userId?: string) {
    return this.http.post<{ success: boolean; data: InvoiceLine }>(`${base}/v1/finance/invoices/${encodeURIComponent(id)}/lines`, input, { headers: this.headers(userId) });
  }

  deleteInvoiceLine(invoiceId: string, lineId: string, userId?: string) {
    return this.http.delete<{ success: boolean }>(`${base}/v1/finance/invoices/${encodeURIComponent(invoiceId)}/lines/${encodeURIComponent(lineId)}`, { headers: this.headers(userId) });
  }

  recordPayment(id: string, input: { amount: number; method?: string; currency?: string; status?: string; reference?: string; processedAt?: string }, userId?: string) {
    return this.http.post<{ success: boolean; data: InvoicePayment }>(`${base}/v1/finance/invoices/${encodeURIComponent(id)}/payments`, input, { headers: this.headers(userId) });
  }

  listPayments(params: { status?: string; invoiceId?: string; limit?: number; offset?: number } = {}, userId?: string) {
    let query = new HttpParams();
    if (params.status) query = query.set('status', params.status);
    if (params.invoiceId) query = query.set('invoiceId', params.invoiceId);
    if (params.limit != null) query = query.set('limit', String(params.limit));
    if (params.offset != null) query = query.set('offset', String(params.offset));
    return this.http.get<{ success: boolean; data: InvoicePayment[] }>(`${base}/v1/finance/payments`, { headers: this.headers(userId), params: query });
  }

  listLedger(params: { kind?: string; from?: string; to?: string; limit?: number; offset?: number } = {}, userId?: string) {
    let query = new HttpParams();
    if (params.kind) query = query.set('kind', params.kind);
    if (params.from) query = query.set('from', params.from);
    if (params.to) query = query.set('to', params.to);
    if (params.limit != null) query = query.set('limit', String(params.limit));
    if (params.offset != null) query = query.set('offset', String(params.offset));
    return this.http.get<{ success: boolean; data: LedgerEntry[] }>(`${base}/v1/finance/ledger`, { headers: this.headers(userId), params: query });
  }

  createLedgerEntry(input: { kind: 'revenue' | 'expense' | 'adjustment'; reference?: string; amount: number; currency?: string; occurredAt?: string; metadata?: Record<string, unknown> }, userId?: string) {
    return this.http.post<{ success: boolean; data: LedgerEntry }>(`${base}/v1/finance/ledger`, input, { headers: this.headers(userId) });
  }
}
