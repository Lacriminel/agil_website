import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: res => {
        this.loading = false;
        const target = res.user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard';
        this.router.navigate([target]).then(success => {
          if (!success) this.error = 'Échec de la navigation — vérifiez la console (F12)';
        });
      },
      error: err => {
        const msg = err.error?.message;
        this.error = Array.isArray(msg) ? msg.join(', ') : (msg || err.message || 'Identifiants incorrects');
        this.loading = false;
      },
    });
  }
}


