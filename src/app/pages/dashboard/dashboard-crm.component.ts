import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactsService, Contact } from '../../contacts.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-dashboard-crm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-crm.component.html'
})
export class DashboardCrmComponent {
  private api = inject(ContactsService);
  private core = inject(ApiService);
  clients: Contact[] = [];
  suppliers: Contact[] = [];
  wholesalers: Contact[] = [];
  userId?: string;
  constructor(){ this.core.verify().subscribe({ next:(r:any)=>{ this.userId=this.core.userIdFrom(r); this.refreshAll(); }, error:()=> this.refreshAll() }); }
  refreshAll(){
    this.api.list(this.userId,'client').subscribe({ next:r=> this.clients = r.data||[] });
    this.api.list(this.userId,'supplier').subscribe({ next:r=> this.suppliers = r.data||[] });
    this.api.list(this.userId,'wholesaler').subscribe({ next:r=> this.wholesalers = r.data||[] });
  }
  add(kind: 'client'|'supplier'|'wholesaler', ev: Event){ ev.preventDefault(); const f=ev.target as HTMLFormElement; const name=(f.elements.namedItem('name') as HTMLInputElement).value.trim(); const email=(f.elements.namedItem('email') as HTMLInputElement).value.trim()||undefined; const phone=(f.elements.namedItem('phone') as HTMLInputElement).value.trim()||undefined; const company=(f.elements.namedItem('company') as HTMLInputElement).value.trim()||undefined; const notes=(f.elements.namedItem('notes') as HTMLInputElement).value.trim()||undefined; if(!name) return; this.api.create({kind,name,email,phone,company,notes},this.userId).subscribe({ next:()=>{ f.reset(); this.refreshAll(); } }); }
  remove(kind:'client'|'supplier'|'wholesaler', id:string){ this.api.remove(id,this.userId).subscribe({ next:()=> this.refreshAll() }); }
}


