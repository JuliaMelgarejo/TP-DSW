import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorService } from '../../../services/errors/error.service.js';
import { ProductService } from '../../../services/product/product.service.js';
import { AuthService } from '../../../services/auth/auth.service.js';
import { CategoryService } from '../../../services/Category/category.service.js';
import { Category } from '../../../models/category/category.js';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../../services/photo/photo.service.js';
import { Product } from '../../../models/product/product.js';
import { AppConfig } from '../../../core/config/app.config.js';
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service.js';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  ProductForm: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  productId: number | null = null;
  selectedProductFile: File | null = null;
  selectedProductPreview: string | null = null;
  uploading = false;
  uploadError: string | null = null;
  selectedProduct: Product;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private photoService: PhotoService,
    public errorService: ErrorService,
    public productService: ProductService,
    public auth: AuthService,
    public categoryService: CategoryService,
    private toast: ToastNotificationService,
  ) {
    this.ProductForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, Validators.required],
      stock: [0, Validators.required],
      shelter: [0, Validators.required],
      crossed_out_price: [0],
      category: [null, Validators.required],
    });
    this.selectedProduct = {} as Product;
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (e) => {
        this.toast.show(e.error.msg, 'danger')
      }
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number) {
    this.productService.getProduct(id).subscribe({
      next: (response) => {
        this.selectedProduct = response.data;
        this.ProductForm.patchValue({
          name: this.selectedProduct.name,
          description: this.selectedProduct.description,
          stock: this.selectedProduct.stock,
          crossed_out_price: this.selectedProduct.crossed_out_price,
          price: this.selectedProduct.prices[0]?.amount || 0,
          category: this.selectedProduct.category.id,
        });
        if (this.selectedProduct.photos && this.selectedProduct.photos.length > 0) {
          this.selectedProductPreview = AppConfig.apiBase + this.selectedProduct.photos[0].url;
        }
      },
      error: (e) => {
        this.toast.show(e.error.msg, 'danger')
      }
    });
  }

  onSubmit() {
    this.ProductForm.patchValue({
      shelter: this.auth.getShelterIdToken()
    });

    if (this.isEditMode) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  createProduct() {
    this.productService.postProduct(this.ProductForm.value).subscribe({
      next: (res) => {

        const createdProduct = res.data;
        if (!createdProduct?.id) {
          console.error('El producto creado no tiene ID');
          return;
        }

        if (this.selectedProductFile) {
          this.photoService.uploadPhoto('product', createdProduct.id, this.selectedProductFile).subscribe({
              next: () => {
                this.router.navigate(['/product']);
              },
              error: (err) => {
                console.error(err);
                this.router.navigate(['/product']);
              }
            });
        } else {
          this.router.navigate(['/product']);
        }
      },
      error: (e) => {
        this.toast.show(e.error.msg, 'danger')
      }
    });
  }

  updateProduct() {
    if (!this.productId) return;

    this.productService.updateProduct({ ...this.ProductForm.value, id: this.productId }).subscribe({
      next: () => {

        if (this.selectedProductFile) {
          this.photoService.uploadPhoto('product', this.productId!, this.selectedProductFile)
            .subscribe({
              next: () => this.router.navigate(['/product']),
              error: () => this.router.navigate(['/product'])
            });
        } else {
          this.router.navigate(['/product']);
        }

      },
      error: (e) => {
        this.toast.show(e.error.msg, 'danger')
      }
    });
}

  onProductPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedProductFile = file;

    if (file) {
      this.selectedProductPreview = URL.createObjectURL(file);
    }
  }

  incrementStock() {
    const current = this.ProductForm.get('stock')?.value || 0;
    this.ProductForm.get('stock')?.setValue(current + 1);
  }

  decrementStock() {
    const current = this.ProductForm.get('stock')?.value || 0;
    if (current > 0) {
      this.ProductForm.get('stock')?.setValue(current - 1);
    }
  }

  uploadPhoto() {
    if (!this.productId || !this.selectedProductFile) return;

    this.uploading = true;

    this.photoService
      .uploadPhoto('product', this.productId, this.selectedProductFile)
      .subscribe({
        next: () => {
          this.uploading = false;
          this.selectedProductFile = null;
          this.selectedProductPreview = null;
          this.loadProduct(this.productId!);
        },
        error: (err) => {
          this.uploading = false;
          this.uploadError = err?.error?.message ?? 'Error subiendo foto';
        }
      });
  }

  deletePhoto(photoId: number) {
    if (!this.productId) return;

    const ok = confirm('¿Eliminar esta foto?');
    if (!ok) return;

    this.photoService.deletePhoto(photoId).subscribe({
      next: () =>{ this.loadProduct(this.productId ? this.productId : 0);
        this.selectedProductPreview = null;
        this.selectedProductFile = null;
    },
      error: (e) => this.toast.show(e.error.msg, 'danger')
    });
  }

  getPhotoUrl(p: any): string {
    const url = p?.url;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : AppConfig.apiBase + url;
  }

  getMainPhotoUrl(){
    if (this.selectedProductPreview) return this.selectedProductPreview;

    const url = this.selectedProduct?.photos?.length
      ? this.selectedProduct.photos[0].url
      : null;

    if (!url) return null;

    return url.startsWith('http') ? url : AppConfig.apiBase + url;
  }

  goToSlide(index: number) {
    const carousel = document.querySelector('#productCarousel');
    if (!carousel) return;

    const bsCarousel = (window as any).bootstrap?.Carousel.getOrCreateInstance(carousel);
    bsCarousel.to(index);
  }

}
