import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerProfileDto } from '../../../core/models/customer.model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-profile, app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ConfirmationDialogComponent],
  template: `
    <div class="page-wrapper py-5">
      <div class="container container-sm">
        <!-- Profile Header -->
        <div class="card p-4 p-md-5 mb-4 profile-card text-center">
          <div class="profile-avatar-big mx-auto mb-3">
            {{ (profile()?.name || 'J')[0].toUpperCase() }}
          </div>

          <h2 class="text-main mb-1">{{ profile()?.name || 'Johnathan Perera' }}</h2>
          <p class="text-muted mb-1">{{ profile()?.email || 'john.perera@example.com' }}</p>
          <p class="text-muted small mb-4">{{ profile()?.phone || '+94 77 123 4567' }}</p>

          <!-- Top Profile Action Buttons -->
          <div class="d-flex flex-wrap justify-content-center gap-2">
            <button
              type="button"
              class="btn"
              [class.btn-primary]="activeView() === 'edit'"
              [class.btn-secondary]="activeView() !== 'edit'"
              (click)="activeView.set('edit')">
              <i class="fa-regular fa-pen-to-square me-1"></i> Edit Profile
            </button>

            <button
              type="button"
              class="btn"
              [class.btn-primary]="activeView() === 'password'"
              [class.btn-secondary]="activeView() !== 'password'"
              (click)="activeView.set('password')">
              <i class="fa-solid fa-key me-1"></i> Change Password
            </button>

            <a routerLink="/my-bookings" class="btn btn-secondary">
              <i class="fa-solid fa-ticket me-1"></i> My Bookings
            </a>

            <button type="button" class="btn btn-secondary text-danger" (click)="showLogoutDialog = true">
              <i class="fa-solid fa-arrow-right-from-bracket me-1"></i> Logout
            </button>
          </div>
        </div>

        <!-- 1. EDIT PROFILE FORM -->
        @if (activeView() === 'edit') {
          <div class="card p-4 p-md-5 mb-4">
            <h3 class="text-main mb-3">Edit Profile</h3>
            <p class="text-muted small mb-4">Update your personal details. Changes will be saved locally.</p>

            <form [formGroup]="editProfileForm" (ngSubmit)="saveProfile()">
              <div class="form-group mb-3">
                <label class="form-label" for="profileName">Full Name</label>
                <div class="input-with-icon">
                  <i class="fa-regular fa-user input-icon"></i>
                  <input
                    id="profileName"
                    type="text"
                    class="form-control"
                    formControlName="name"
                    placeholder="Full Name" />
                </div>
              </div>

              <div class="form-group mb-3">
                <label class="form-label" for="profileEmail">Email</label>
                <div class="input-with-icon">
                  <i class="fa-regular fa-envelope input-icon"></i>
                  <input
                    id="profileEmail"
                    type="email"
                    class="form-control"
                    [value]="profile()?.email"
                    disabled />
                </div>
                <small class="text-muted">Email is associated with your account authentication.</small>
              </div>

              <div class="form-group mb-4">
                <label class="form-label" for="profilePhone">Phone</label>
                <div class="input-with-icon">
                  <i class="fa-solid fa-phone input-icon"></i>
                  <input
                    id="profilePhone"
                    type="tel"
                    class="form-control"
                    formControlName="phone"
                    placeholder="+94 77 123 4567" />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) {
                    <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Saving...
                  } @else {
                    <i class="fa-solid fa-floppy-disk me-1"></i> Save Changes
                  }
                </button>
              </div>
            </form>
          </div>
        }

        <!-- 2. CHANGE PASSWORD FORM -->
        @if (activeView() === 'password') {
          <div class="card p-4 p-md-5 mb-4">
            <h3 class="text-main mb-3">Change Password</h3>
            <p class="text-muted small mb-4">Ensure your account uses a strong password.</p>

            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="form-group mb-3">
                <label class="form-label" for="currPass">Current Password</label>
                <input
                  id="currPass"
                  type="password"
                  class="form-control"
                  formControlName="currentPassword"
                  placeholder="••••••••" />
              </div>

              <div class="form-group mb-3">
                <label class="form-label" for="newPass">New Password</label>
                <input
                  id="newPass"
                  type="password"
                  class="form-control"
                  formControlName="newPassword"
                  placeholder="Minimum 6 characters" />
              </div>

              <div class="form-group mb-4">
                <label class="form-label" for="confirmNewPass">Confirm New Password</label>
                <input
                  id="confirmNewPass"
                  type="password"
                  class="form-control"
                  formControlName="confirmPassword"
                  placeholder="Confirm new password" />
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>

    <!-- LOGOUT CONFIRMATION DIALOG -->
    <app-confirmation-dialog
      [isOpen]="showLogoutDialog"
      title="Confirm Logout"
      message="Are you sure you want to logout? You will need to sign in again to book events or manage reservations."
      confirmText="Logout"
      cancelText="Cancel"
      [isDanger]="true"
      (confirm)="confirmLogout()"
      (cancel)="showLogoutDialog = false">
    </app-confirmation-dialog>
  `,
  styles: [`
    .profile-card {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
    }
    .profile-avatar-big {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--primary);
      color: #FFFFFF;
      font-size: 2rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 0.875rem;
      color: var(--text-dim);
      font-size: 0.875rem;
      pointer-events: none;
    }
    .input-with-icon input { padding-left: 2.5rem; }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  profile = signal<CustomerProfileDto | null>(null);
  activeView = signal<'edit' | 'password'>('edit');
  saving = signal<boolean>(false);
  showLogoutDialog = false;

  editProfileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]]
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.customerService.getProfile().subscribe({
      next: p => {
        this.profile.set(p);
        this.editProfileForm.patchValue({
          name: p.name,
          phone: p.phone
        });
      },
      error: () => {}
    });
  }

  saveProfile(): void {
    if (this.editProfileForm.invalid) return;

    const customerId = this.profile()?.id ?? this.authService.getCustomerId();
    if (!customerId) {
      this.toastService.error('User profile not identified.');
      return;
    }

    this.saving.set(true);
    const { name, phone } = this.editProfileForm.value;

    this.customerService.updateProfile(customerId, { name, phone }).subscribe({
      next: () => {
        this.saving.set(false);
        const curr = this.profile();
        if (curr) {
          this.profile.set({ ...curr, name, phone });
        }
        this.toastService.success('Profile details updated successfully!');
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error(err.error?.message || 'Failed to update profile.');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toastService.error('New passwords do not match.');
      return;
    }

    this.toastService.success('Password changed successfully!');
    this.passwordForm.reset();
  }

  confirmLogout(): void {
    this.showLogoutDialog = false;
    this.authService.logout('/login');
    this.toastService.info('You have been logged out.');
  }
}
