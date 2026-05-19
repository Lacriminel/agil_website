import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  selected: Order | null = null;
  filterStatus = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }
  load() {
    const p: any = {};
    if (this.filterStatus) p.status = this.filterStatus;
    this.api.get<Order[]>('/admin/orders', p).subscribe(o => this.orders = o);
  }

  confirm(id: number) {
    this.api.patch(`/admin/orders/${id}/confirm`, {}).subscribe(() => { this.selected = null; this.load(); });
  }
  deliver(id: number) {
    this.api.patch(`/admin/orders/${id}/deliver`, {}).subscribe(() => { this.selected = null; this.load(); });
  }

  countByStatus(s: string) { return this.orders.filter(o => o.status === s).length; }

  statusPillClass(s: string) {
    return ({ PENDING: 'pill-yellow', CONFIRMED: 'pill-blue', DELIVERED: 'pill-green' } as any)[s] ?? 'pill-gray';
  }
  statusLabel(s: string) {
    return ({ PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée' } as any)[s] ?? s;
  }
}


