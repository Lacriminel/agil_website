import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-bons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bons.component.html',
})
export class BonsComponent implements OnInit {
  orders: Order[] = [];
  selected: Order | null = null;
  filterStatus = '';
  search = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    const p: any = {};
    if (this.filterStatus) p.status = this.filterStatus;
    this.api.get<Order[]>('/admin/orders', p).subscribe(o => this.orders = o);
  }

  get filtered() {
    if (!this.search) return this.orders;
    const s = this.search.toLowerCase();
    return this.orders.filter(o =>
      String(o.id).includes(s) ||
      o.customer?.fullName?.toLowerCase().includes(s) ||
      o.customer?.place?.name?.toLowerCase().includes(s)
    );
  }

  statusClass(s: string) {
    return ({ PENDING: 'pill-yellow', CONFIRMED: 'pill-blue', DELIVERED: 'pill-green' } as any)[s] ?? 'pill-gray';
  }
  statusLabel(s: string) {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée' } as any)[s] ?? s;
  }

  print(order: Order) {
    this.selected = order;
    setTimeout(() => window.print(), 200);
  }
}
