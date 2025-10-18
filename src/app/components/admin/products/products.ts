import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CloudinaryService, UploadResponse } from '../../../services/cloudinary.service';

export interface ProductForm {
  name: string;
  category: string;
  basePrice: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class AdminProductsComponent implements OnInit {
  protected productForm: ProductForm = {
    name: '',
    category: '',
    basePrice: '',
    description: '',
    imageUrl: '',
    imageFile: null
  };


  protected clothingCategories = [
    'T-Shirt',
    'Polo Shirt',
    'Hoodie',
    'Jacket',
    'Sweatshirt',
    'Tank Top',
    'Long Sleeve',
    'Shorts',
    'Pants',
    'Jeans',
    'Dress',
    'Skirt',
    'Hat',
    'Cap',
    'Beanie',
    'Scarf',
    'Gloves',
    'Socks',
    'Underwear',
    'Bra',
    'Swimwear',
    'Activewear',
    'Uniform',
    'Other'
  ];

  protected isUploading = signal(false);
  protected uploadedImageUrl = signal<string | null>(null);
  protected selectedFile = signal<string | null>(null);
  protected message = signal('');
  protected messageType = signal<'success' | 'error' | 'info' | ''>('');

  constructor(private cloudinaryService: CloudinaryService) {}

  ngOnInit(): void {
    // Initialize the price field
    this.productForm.basePrice = '0';
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
    console.log('Showing message:', message, 'Type:', type);
    this.message.set(message);
    this.messageType.set(type);
    console.log('Message set:', this.message(), 'Type set:', this.messageType());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('⚠️ Please upload a valid image file (JPG, PNG, SVG)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('⚠️ File size must be less than 5MB');
        return;
      }

      // Store the file and show preview
      this.productForm.imageFile = file;
      this.selectedFile.set(file.name);

      // Create a local preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImageUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImageToCloudinary(file: File): Promise<void> {
    try {
      this.isUploading.set(true);
      this.showMessage('📤 Uploading image to Cloudinary...', 'info');
      
      const result: UploadResponse = await this.cloudinaryService.uploadImage(file);
      
      // Store the Cloudinary URL
      this.productForm.imageUrl = result.secure_url;
      this.uploadedImageUrl.set(this.cloudinaryService.getThumbnailUrl(result.public_id, 200));
      
      console.log('Image uploaded successfully:', result);
      this.showMessage('✓ Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      this.showMessage('✗ Failed to upload image. Please try again.', 'error');
    } finally {
      this.isUploading.set(false);
    }
  }

  async onSaveProduct(): Promise<void> {
    // Validate required fields (just console log, don't show global message for validation)
    if (!this.productForm.name || !this.productForm.category || !this.productForm.basePrice) {
      alert('⚠️ Please fill in all required fields (Name, Category, Base Price)');
      return;
    }

    // Validate price format and value
    const numericPrice = this.getNumericPrice();
    if (numericPrice <= 0) {
      alert('⚠️ Please enter a valid price greater than ₱0.00');
      return;
    }

    // Check if image file is selected
    if (!this.productForm.imageFile) {
      alert('⚠️ Please select a product image');
      return;
    }

    try {
      // Upload image to Cloudinary first
      await this.uploadImageToCloudinary(this.productForm.imageFile);
      
      // Check if upload was successful
      if (!this.productForm.imageUrl) {
        return; // Error message already shown by uploadImageToCloudinary
      }

      // Show saving progress
      this.showMessage('💾 Saving product...', 'info');

      // TODO: Send to your backend API
      console.log('Saving product:', this.productForm);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success message
      this.showMessage('✓ Product saved successfully!', 'success');
      
      // Wait 3 seconds to show the success message, then reset and close
      setTimeout(() => {
        // Reset form data
        this.resetFormData();
        
        // Close modal
        const modal = document.getElementById('addProductModal');
        if (modal) {
          // @ts-ignore
          bootstrap.Modal.getInstance(modal)?.hide();
        }
        
        // Clear message after modal closes
        setTimeout(() => {
          this.message.set('');
          this.messageType.set('');
        }, 500);
      }, 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      this.showMessage('✗ Failed to save product. Please try again.', 'error');
    }
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Handle multiple decimal points
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Handle empty values
    if (value === '' || value === '.') {
      this.productForm.basePrice = '0';
      input.value = '';
      return;
    }
    
    // Parse the number
    const number = parseFloat(value);
    if (!isNaN(number) && number >= 0) {
      this.productForm.basePrice = number.toString();
    }
  }

  onPriceFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Clear the input to show just the numeric value for easier editing
    const numericValue = this.productForm.basePrice === '0' ? '' : this.productForm.basePrice;
    input.value = numericValue;
  }

  onPriceBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const number = parseFloat(this.productForm.basePrice) || 0;
    input.value = `₱${number.toFixed(2)}`;
    this.productForm.basePrice = number.toString();
  }

  private getNumericPrice(): number {
    return parseFloat(this.productForm.basePrice) || 0;
  }

  private resetForm(): void {
    this.productForm = {
      name: '',
      category: '',
      basePrice: '0',
      description: '',
      imageUrl: '',
      imageFile: null
    };
    this.uploadedImageUrl.set(null);
    this.selectedFile.set(null);
    this.isUploading.set(false);
    this.message.set('');
    this.messageType.set('');
  }

  private resetFormData(): void {
    this.productForm = {
      name: '',
      category: '',
      basePrice: '0',
      description: '',
      imageUrl: '',
      imageFile: null
    };
    this.uploadedImageUrl.set(null);
    this.selectedFile.set(null);
    this.isUploading.set(false);
    // Don't clear messages here
  }

  removeSelectedImage(): void {
    this.productForm.imageFile = null;
    this.productForm.imageUrl = '';
    this.uploadedImageUrl.set(null);
    this.selectedFile.set(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}