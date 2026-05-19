import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Place, Governorate } from '../../../core/models';

@Component({
  selector: 'app-admin-places',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './places.component.html',
})
export class AdminPlacesComponent implements OnInit {
  places: Place[] = [];
  governorates: Governorate[] = [];
  showForm = false;
  editId: number | null = null;
  error = '';
  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      governorateId: [null as number | null, Validators.required],
    });
  }

  ngOnInit() { this.load(); }
  load() {
    this.api.get<Place[]>('/admin/places').subscribe(p => this.places = p);
    this.api.get<Governorate[]>('/admin/governorates').subscribe(g => this.governorates = g);
  }
  openCreate() { this.editId = null; this.form.reset(); this.showForm = true; this.error = ''; }
  openEdit(p: Place) {
    this.editId = p.id;
    this.form.patchValue({ name: p.name, governorateId: p.governorateId });
    this.showForm = true; this.error = '';
  }
  save() {
    if (this.form.invalid) return;
    const obs = this.editId
      ? this.api.patch(`/admin/places/${this.editId}`, this.form.value)
      : this.api.post('/admin/places', this.form.value);
    obs.subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => this.error = e.error?.message });
  }
  delete(id: number) {
    if (!confirm('Delete place?')) return;
    this.api.delete(`/admin/places/${id}`).subscribe({ next: () => this.load(), error: e => alert(e.error?.message) });
  }
}


