import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Governorate, GovernorateGroup } from '../../../core/models';

@Component({
  selector: 'app-admin-governorates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './governorates.component.html',
})
export class AdminGovernoratesComponent implements OnInit {
  governorates: Governorate[] = [];
  groups: GovernorateGroup[] = [];
  showForm = false;
  editId: number | null = null;
  error = '';
  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      governorateGroupId: [null as number | null, Validators.required],
    });
  }

  ngOnInit() { this.load(); }
  load() {
    this.api.get<Governorate[]>('/admin/governorates').subscribe(g => this.governorates = g);
    this.api.get<GovernorateGroup[]>('/admin/governorate-groups').subscribe(g => this.groups = g);
  }
  openCreate() { this.editId = null; this.form.reset(); this.showForm = true; this.error = ''; }
  openEdit(g: Governorate) {
    this.editId = g.id;
    this.form.patchValue({ name: g.name, governorateGroupId: g.governorateGroupId });
    this.showForm = true; this.error = '';
  }
  save() {
    if (this.form.invalid) return;
    const obs = this.editId
      ? this.api.patch(`/admin/governorates/${this.editId}`, this.form.value)
      : this.api.post('/admin/governorates', this.form.value);
    obs.subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => this.error = e.error?.message });
  }
  delete(id: number) {
    if (!confirm('Delete this governorate?')) return;
    this.api.delete(`/admin/governorates/${id}`).subscribe({ next: () => this.load(), error: e => alert(e.error?.message) });
  }
}


