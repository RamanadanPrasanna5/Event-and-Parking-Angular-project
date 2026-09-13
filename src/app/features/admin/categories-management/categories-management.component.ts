import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateCategoryDto, EventCategory } from '../../../core/models/category.models';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-categories-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent, LoadingSpinnerComponent, ErrorBannerComponent],
  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Classification</span>
          <h1 class="page-title mb-1">Event Categories</h1>
          <p class="text-muted mb-0">Manage event genres, types, and classification tags</p>
        </div>

        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="fa-solid fa-plus me-1"></i> Add Category
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading categories..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadCategories()"></app-error-banner>
      } @else {
        <div class="card p-0 overflow-hidden">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (c of categories(); track c.id) {
                  <tr>
                    <td><strong class="text-white">{{ c.name }}</strong></td>
                    <td class="text-muted">{{ c.description || 'No description' }}</td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-1">
                        <button class="btn btn-sm btn-secondary" (click)="openEditModal(c)">
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="promptDelete(c)">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeOnBackdrop($event)">
          <div class="modal-container">
            <div class="modal-header">
              <h4>{{ isEditing ? 'Edit Category' : 'New Category' }}</h4>
              <button class="btn btn-icon btn-outline" (click)="showModal = false">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="modal-body">
              <form [formGroup]="catForm" (ngSubmit)="saveCategory()">
                <div class="form-group mb-3">
                  <label class="form-label" for="cName">Category Name *</label>
                  <input id="cName" type="text" class="form-control" formControlName="name" placeholder="e.g. Concert, Sports, Tech" />
                </div>
                <div class="form-group mb-4">
                  <label class="form-label" for="cDesc">Description</label>
                  <textarea id="cDesc" class="form-control" formControlName="description" rows="3"></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="showModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="catForm.invalid || saving()">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <app-confirmation-modal
        [isOpen]="showDeleteModal"
        title="Delete Category"
        [message]="'Are you sure you want to delete category ' + (selectedCategory?.name || '') + '?'"
        confirmText="Delete Category"
        [isDanger]="true"
        [isLoading]="deleting()"
        (confirm)="confirmDelete()"
        (cancel)="showDeleteModal = false">
      </app-confirmation-modal>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2rem; font-weight: 800; }
  `]
})
export class CategoriesManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  categories = signal<EventCategory[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  saving = signal<boolean>(false);

  showDeleteModal = false;
  selectedCategory: EventCategory | null = null;
  deleting = signal<boolean>(false);

  catForm!: FormGroup;

  ngOnInit(): void {
    this.catForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (c) => { this.categories.set(c || []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Failed to load categories.'); }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.catForm.reset();
    this.showModal = true;
  }

  openEditModal(c: EventCategory): void {
    this.isEditing = true;
    this.editingId = c.id;
    this.catForm.patchValue({ name: c.name, description: c.description });
    this.showModal = true;
  }

  saveCategory(): void {
    if (this.catForm.invalid) return;
    this.saving.set(true);
    const dto: CreateCategoryDto = this.catForm.value;

    if (this.isEditing && this.editingId) {
      this.categoryService.updateCategory(this.editingId, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal = false;
          this.toastService.success('Category updated.');
          this.loadCategories();
        },
        error: (err) => {
          this.saving.set(false);
          this.toastService.error(err.error?.message || 'Failed to update category.');
        }
      });
    } else {
      this.categoryService.createCategory(dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal = false;
          this.toastService.success('Category created.');
          this.loadCategories();
        },
        error: (err) => {
          this.saving.set(false);
          this.toastService.error(err.error?.message || 'Failed to create category.');
        }
      });
    }
  }

  promptDelete(c: EventCategory): void {
    this.selectedCategory = c;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedCategory) return;
    this.deleting.set(true);
    this.categoryService.deleteCategory(this.selectedCategory.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal = false;
        this.toastService.success('Category deleted.');
        this.loadCategories();
      },
      error: (err) => {
        this.deleting.set(false);
        this.toastService.error(err.error?.message || 'Failed to delete category.');
      }
    });
  }

  closeOnBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal = false;
  }
}
