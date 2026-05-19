import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Customer, Place } from '../../../core/models';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customers.component.html',
})
export class AdminCustomersComponent implements OnInit {
  customers: Customer[] = [];
  places: Place[] = [];
  showForm = false;
  editId: number | null = null;
  error = '';
  form: FormGroup;
  editForm: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', Validators.required],
      phone: [''],
      placeId: [null as number | null, Validators.required],
    });
    this.editForm = this.fb.group({
      email: ['', Validators.email],
      fullName: [''],
      phone: [''],
    });
  }

  ngOnInit() { this.load(); }
  load() {
    this.api.get<Customer[]>('/admin/customers').subscribe(c => this.customers = c);
    this.api.get<Place[]>('/admin/places', { unassigned: true }).subscribe(p => this.places = p);
  }
  openCreate() { this.editId = null; this.form.reset(); this.showForm = true; this.error = ''; }
  openEdit(c: Customer) {
    this.editId = c.id;
    this.editForm.patchValue({ email: c.user?.email ?? '', fullName: c.fullName, phone: c.phone });
    this.showForm = true; this.error = '';
  }
  save() {
    if (this.editId) {
      this.api.patch(`/admin/customers/${this.editId}`, this.editForm.value)
        .subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => this.error = e.error?.message });
    } else {
      if (this.form.invalid) return;
      this.api.post('/admin/customers', this.form.value)
        .subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => this.error = e.error?.message });
    }
  }
  delete(id: number) {
    if (!confirm('Delete this customer? Their place will be freed.')) return;
    this.api.delete(`/admin/customers/${id}`).subscribe({ next: () => this.load(), error: e => alert(e.error?.message) });
  }
}


