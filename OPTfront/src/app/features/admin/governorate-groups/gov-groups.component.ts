import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { GovernorateGroup } from '../../../core/models';

@Component({
  selector: 'app-gov-groups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gov-groups.component.html',
})
export class GovGroupsComponent implements OnInit {
  groups: GovernorateGroup[] = [];
  showForm = false;
  editId: number | null = null;
  error = '';
  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({ name: ['', Validators.required] });
  }

  ngOnInit() { this.load(); }
  load() { this.api.get<GovernorateGroup[]>('/admin/governorate-groups').subscribe(g => this.groups = g); }

  openCreate() { this.editId = null; this.form.reset(); this.showForm = true; this.error = ''; }
  openEdit(g: GovernorateGroup) { this.editId = g.id; this.form.patchValue({ name: g.name }); this.showForm = true; this.error = ''; }

  save() {
    if (this.form.invalid) return;
    const obs = this.editId
      ? this.api.patch(`/admin/governorate-groups/${this.editId}`, this.form.value)
      : this.api.post('/admin/governorate-groups', this.form.value);
    obs.subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => this.error = e.error?.message });
  }

  delete(id: number) {
    if (!confirm('Delete this group?')) return;
    this.api.delete(`/admin/governorate-groups/${id}`).subscribe({ next: () => this.load(), error: e => alert(e.error?.message) });
  }
}


