import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, Invoice, InvoiceDetail, InvoiceLine, InvoicePayment, LedgerEntry } from '../../finance.service';
import { ApiService } from '../../api.service';

type InvoiceStatusFilter = '' | 'draft' | 'issued' | 'overdue' | 'paid' | 'void';

@Component({
  selector: 'app-finance-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance-center.component.html'
})
export class FinanceCenterComponent {
  private finance = inject(FinanceService);
  private core = inject(ApiService);

  invoices = signal<Invoice[]>([]);
  invoiceLoading = signal(false);
  invoiceFilter = signal<InvoiceStatusFilter>('');
  invoiceSearch = signal('');

  selectedInvoice = signal<InvoiceDetail | null>(null);
  selecting = signal(false);

  payments = signal<InvoicePayment[]>([]);
  paymentsLoading = signal(false);

  ledger = signal<LedgerEntry[]>([]);
  ledgerLoading = signal(false);

  message = signal<string | null>(null);
  error = signal<string | null>(null);

  private userId?: string;

  constructor() {
    this.core.verify().subscribe({
      next: (res: any) => {
        this.userId = res?.data?.uid?.toString();
        this.initialize();
      },
      error: () => this.initialize()
    });
  }

  initialize() {
    this.loadInvoices();
    this.loadLedger();
    this.loadPayments();
  }

  onStatusFilterChange(value: string) {
    this.invoiceFilter.set((value as InvoiceStatusFilter) || '');
    this.onFilterChange();
  }

  loadInvoices() {
    this.invoiceLoading.set(true);
    this.finance.listInvoices({ status: this.invoiceFilter(), q: this.invoiceSearch() }, this.userId).subscribe({
      next: (res) => {
        this.invoices.set(res.data || []);
        this.invoiceLoading.set(false);
      },
      error: () => {
        this.invoices.set([]);
        this.invoiceLoading.set(false);
      }
    });
  }

  onFilterChange() {
    this.loadInvoices();
  }

  onSearchChange(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    this.invoiceSearch.set(value);
    this.loadInvoices();
  }

  selectInvoice(invoice: Invoice) {
    this.selecting.set(true);
    this.finance.getInvoice(invoice.id, this.userId).subscribe({
      next: (res) => {
        this.selectedInvoice.set(res.data);
        this.selecting.set(false);
      },
      error: () => {
        this.selectedInvoice.set(null);
        this.selecting.set(false);
      }
    });
  }

  createInvoice(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const customerContactId = (form.elements.namedItem('customerContactId') as HTMLInputElement).value.trim() || undefined;
    const reference = (form.elements.namedItem('reference') as HTMLInputElement).value.trim() || undefined;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as InvoiceStatusFilter;
    const currency = (form.elements.namedItem('currency') as HTMLInputElement).value.trim() || undefined;
    const issuedAt = (form.elements.namedItem('issuedAt') as HTMLInputElement).value || undefined;
    const dueAt = (form.elements.namedItem('dueAt') as HTMLInputElement).value || undefined;
    const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim() || undefined;
    this.finance.createInvoice({ customerContactId, reference, status, currency, issuedAt: issuedAt || undefined, dueAt: dueAt || undefined, notes }, this.userId).subscribe({
      next: (res) => {
        form.reset();
        this.message.set('Invoice created.');
        this.loadInvoices();
        if (res.data) {
          this.selectInvoice(res.data);
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Could not create invoice.');
      }
    });
  }

  addLine(ev: Event, invoiceId: string) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const description = (form.elements.namedItem('description') as HTMLInputElement).value.trim();
    const quantity = parseFloat((form.elements.namedItem('quantity') as HTMLInputElement).value);
    const unitPrice = parseFloat((form.elements.namedItem('unitPrice') as HTMLInputElement).value);
    const taxRate = parseFloat((form.elements.namedItem('taxRate') as HTMLInputElement).value);
    if (!description) return;
    this.finance.addInvoiceLine(invoiceId, { description, quantity: isNaN(quantity) ? undefined : quantity, unitPrice: isNaN(unitPrice) ? undefined : unitPrice, taxRate: isNaN(taxRate) ? undefined : taxRate }, this.userId)
      .subscribe({
        next: () => {
          form.reset();
          this.message.set('Line item added.');
          this.refreshSelected(invoiceId);
        },
        error: (err) => this.error.set(err?.error?.message || 'Failed to add line item.')
      });
  }

  removeLine(invoiceId: string, line: InvoiceLine) {
    this.finance.deleteInvoiceLine(invoiceId, line.id, this.userId).subscribe({
      next: () => {
        this.message.set('Line removed.');
        this.refreshSelected(invoiceId);
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to remove line.')
    });
  }

  addPayment(ev: Event, invoiceId: string) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const amountRaw = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    if (isNaN(amountRaw) || amountRaw <= 0) return;
    const method = (form.elements.namedItem('method') as HTMLInputElement).value.trim() || undefined;
    const currency = (form.elements.namedItem('paymentCurrency') as HTMLInputElement).value.trim() || undefined;
    const status = (form.elements.namedItem('paymentStatus') as HTMLSelectElement).value || undefined;
    const reference = (form.elements.namedItem('paymentReference') as HTMLInputElement).value.trim() || undefined;
    const processedAt = (form.elements.namedItem('processedAt') as HTMLInputElement).value || undefined;
    this.finance.recordPayment(invoiceId, { amount: amountRaw, method, currency, status, reference, processedAt: processedAt || undefined }, this.userId).subscribe({
      next: () => {
        form.reset();
        this.message.set('Payment recorded.');
        this.refreshSelected(invoiceId);
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to record payment.')
    });
  }

  loadPayments() {
    this.paymentsLoading.set(true);
    this.finance.listPayments({ limit: 50 }, this.userId).subscribe({
      next: (res) => {
        this.payments.set(res.data || []);
        this.paymentsLoading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.paymentsLoading.set(false);
      }
    });
  }

  loadLedger() {
    this.ledgerLoading.set(true);
    this.finance.listLedger({ limit: 50 }, this.userId).subscribe({
      next: (res) => {
        this.ledger.set(res.data || []);
        this.ledgerLoading.set(false);
      },
      error: () => {
        this.ledger.set([]);
        this.ledgerLoading.set(false);
      }
    });
  }

  createLedger(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const kind = (form.elements.namedItem('ledgerKind') as HTMLSelectElement).value as 'revenue' | 'expense' | 'adjustment';
    const amount = parseFloat((form.elements.namedItem('ledgerAmount') as HTMLInputElement).value);
    if (!kind || isNaN(amount) || amount === 0) return;
    const reference = (form.elements.namedItem('ledgerReference') as HTMLInputElement).value.trim() || undefined;
    const currency = (form.elements.namedItem('ledgerCurrency') as HTMLInputElement).value.trim() || undefined;
    const occurredAt = (form.elements.namedItem('ledgerDate') as HTMLInputElement).value || undefined;
    const metadataRaw = (form.elements.namedItem('ledgerMetadata') as HTMLTextAreaElement).value.trim();
    let metadata: Record<string, unknown> | undefined;
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw);
      } catch {
        this.error.set('Metadata must be valid JSON.');
        return;
      }
    }
    this.finance.createLedgerEntry({ kind, amount, reference, currency, occurredAt: occurredAt || undefined, metadata }, this.userId).subscribe({
      next: () => {
        form.reset();
        this.message.set('Ledger entry created.');
        this.loadLedger();
      },
      error: (err) => this.error.set(err?.error?.message || 'Failed to create ledger entry.')
    });
  }

  private refreshSelected(id: string) {
    if (!id) return;
    this.finance.getInvoice(id, this.userId).subscribe({
      next: (res) => this.selectedInvoice.set(res.data),
      error: () => this.selectedInvoice.set(null)
    });
    this.loadPayments();
    this.loadInvoices();
  }
}
