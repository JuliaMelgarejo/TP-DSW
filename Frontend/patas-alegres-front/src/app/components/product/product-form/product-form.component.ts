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
  selectedProductFile: File | null = null;
  selectedProductPreview: string | null = null;
  isEditMode = false;
  productId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private photoService: PhotoService,
    public errorService: ErrorService,
    public productService: ProductService,
    public auth: AuthService,
    public categoryService: CategoryService,
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
  }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => {
        alert(error);
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
        const product = response.data;
        this.ProductForm.patchValue({
          name: product.name,
          description: product.description,
          stock: product.stock,
          crossed_out_price: product.crossed_out_price,
          price: product.prices[0]?.amount || 0,
          category: product.category.id,
        });
        if (product.photos && product.photos.length > 0) {
          this.selectedProductPreview = product.photos[0].url;
        }
      },
      error: (error) => {
        alert(error);
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
      next: (data) => {
        alert(data.message);
        this.ProductForm.reset();
        this.router.navigate(['/product'])
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  updateProduct() {
    if (!this.productId) return;

    this.productService.updateProduct({ ...this.ProductForm.value, id: this.productId }).subscribe({
      next: (data) => {
        alert(data.message);
        this.router.navigate(['/product'])
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onProductPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedProductFile = file;

    if (this.selectedProductPreview) URL.revokeObjectURL(this.selectedProductPreview);
    this.selectedProductPreview = file ? URL.createObjectURL(file) : null;
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
}
