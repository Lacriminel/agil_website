import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Truck, GovernorateGroup } from '../../../core/models';

@Component({
  selector: 'app-admin-trucks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trucks.component.html',
})
export class AdminTrucksComponent implements OnInit {
  trucks: Truck[] = [];
  groups: GovernorateGroup[] = [];
  showForm = false;
  editId: number | null = null;
  error = '';
  loading = true;
  comboKeys = ['A', 'B', 'C', 'D', 'E'];
  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      governorateGroupId: [null as number | null, Validators.required],
      comboKey: ['A', Validators.required],
      status: ['AVAILABLE'],
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    forkJoin({
      trucks: this.api.get<Truck[]>('/admin/trucks'),
      groups: this.api.get<GovernorateGroup[]>('/admin/governorate-groups'),
    }).subscribe({
      next: ({ trucks, groups }) => { this.trucks = trucks; this.groups = groups; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate() { this.editId = null; this.form.reset({ comboKey: 'A', status: 'AVAILABLE' }); this.showForm = true; this.error = ''; }

  openEdit(t: Truck) {
    this.editId = t.id;
    this.form.patchValue({ name: t.name, governorateGroupId: t.governorateGroupId, status: t.status });
    this.showForm = true; this.error = '';
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const obs = this.editId
      ? this.api.patch(`/admin/trucks/${this.editId}`, { name: v.name, governorateGroupId: v.governorateGroupId, status: v.status })
      : this.api.post('/admin/trucks', { name: v.name, governorateGroupId: v.governorateGroupId, comboKey: v.comboKey });
    obs.subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => this.error = e.error?.message });
  }

  delete(id: number) {
    if (!confirm('Supprimer ce camion ?')) return;
    this.api.delete(`/admin/trucks/${id}`).subscribe({ next: () => this.load(), error: e => alert(e.error?.message) });
  }

  statusClass(s: string) {
    return ({ AVAILABLE: 'bg-green-100 text-green-700', IN_TRANSIT: 'bg-blue-100 text-blue-700', MAINTENANCE: 'bg-red-100 text-red-700' } as any)[s] ?? '';
  }
  statusLabel(s: string) {
    return ({ AVAILABLE: 'Disponible', IN_TRANSIT: 'En transit', MAINTENANCE: 'Maintenance' } as any)[s] ?? s;
  }
}


