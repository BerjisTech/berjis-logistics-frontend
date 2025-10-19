import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactsService, Contact } from '../../contacts.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-dashboard-crm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>CRM</h2>
    <div style="display:grid; grid-template-columns: repeat(auto-fit,minmax(320px,1fr)); gap:16px;">
      <div style="border:1px solid #eee; border-radius:12px; padding:12px;">
        <h3>Clients</h3>
        <form (submit)="add('client',$event)" style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-bottom:8px;">
          <input name="name" placeholder="Name" required style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="company" placeholder="Company" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="email" placeholder="Email" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="phone" placeholder="Phone" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="notes" placeholder="Notes" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <button type="submit">Add</button>
        </form>
        <ul>
          <li *ngFor="let c of clients">{{c.name}} <small *ngIf="c.company">— {{c.company}}</small> <button (click)="remove('client', c.id)">Remove</button></li>
        </ul>
      </div>
      <div style="border:1px solid #eee; border-radius:12px; padding:12px;">
        <h3>Suppliers</h3>
        <form (submit)="add('supplier',$event)" style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-bottom:8px;">
          <input name="name" placeholder="Name" required style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="company" placeholder="Company" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="email" placeholder="Email" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="phone" placeholder="Phone" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="notes" placeholder="Notes" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <button type="submit">Add</button>
        </form>
        <ul>
          <li *ngFor="let c of suppliers">{{c.name}} <small *ngIf="c.company">— {{c.company}}</small> <button (click)="remove('supplier', c.id)">Remove</button></li>
        </ul>
      </div>
      <div style="border:1px solid #eee; border-radius:12px; padding:12px;">
        <h3>Wholesalers</h3>
        <form (submit)="add('wholesaler',$event)" style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-bottom:8px;">
          <input name="name" placeholder="Name" required style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="company" placeholder="Company" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="email" placeholder="Email" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="phone" placeholder="Phone" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <input name="notes" placeholder="Notes" style="padding:6px; border:1px solid #ddd; border-radius:6px;" />
          <button type="submit">Add</button>
        </form>
        <ul>
          <li *ngFor="let c of wholesalers">{{c.name}} <small *ngIf="c.company">— {{c.company}}</small> <button (click)="remove('wholesaler', c.id)">Remove</button></li>
        </ul>
      </div>
    </div>
  `
})
export class DashboardCrmComponent {
  private api = inject(ContactsService);
  private core = inject(ApiService);
  clients: Contact[] = [];
  suppliers: Contact[] = [];
  wholesalers: Contact[] = [];
  userId?: string;
  constructor(){ this.core.verify().subscribe({ next:(r:any)=>{ this.userId=r?.data?.uid?.toString(); this.refreshAll(); }, error:()=> this.refreshAll() }); }
  refreshAll(){
    this.api.list(this.userId,'client').subscribe({ next:r=> this.clients = r.data||[] });
    this.api.list(this.userId,'supplier').subscribe({ next:r=> this.suppliers = r.data||[] });
    this.api.list(this.userId,'wholesaler').subscribe({ next:r=> this.wholesalers = r.data||[] });
  }
  add(kind: 'client'|'supplier'|'wholesaler', ev: Event){ ev.preventDefault(); const f=ev.target as HTMLFormElement; const name=(f.elements.namedItem('name') as HTMLInputElement).value.trim(); const email=(f.elements.namedItem('email') as HTMLInputElement).value.trim()||undefined; const phone=(f.elements.namedItem('phone') as HTMLInputElement).value.trim()||undefined; const company=(f.elements.namedItem('company') as HTMLInputElement).value.trim()||undefined; const notes=(f.elements.namedItem('notes') as HTMLInputElement).value.trim()||undefined; if(!name) return; this.api.create({kind,name,email,phone,company,notes},this.userId).subscribe({ next:()=>{ f.reset(); this.refreshAll(); } }); }
  remove(kind:'client'|'supplier'|'wholesaler', id:string){ this.api.remove(id,this.userId).subscribe({ next:()=> this.refreshAll() }); }
}

