import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CanvasComponent } from '../../canvas/canvas';
import { UploadPanelComponent } from './upload-panel/upload-panel';
import { ProductPreviewComponent } from './product-preview/product-preview';
import { OptionsPanelComponent, PriceBreakdown, TextOptions } from './options-panel/options-panel';

@Component({
  selector: 'app-customization',
  imports: [
    CommonModule,
    CanvasComponent,
    UploadPanelComponent,
    ProductPreviewComponent,
    OptionsPanelComponent
  ],
  templateUrl: './customization.html',
  styleUrl: './customization.css'
})
export class CustomizationComponent {
  // State management
  protected selectedShirtColor = signal('#000000');
  protected uploadedImage = signal<File | null>(null);
  protected activeProductView = signal('front');
  protected basePrice = signal(1050.00);
  protected currentPriceBreakdown = signal<PriceBreakdown | null>(null);
  protected currentTextOptions = signal<TextOptions | null>(null);

  // Event handlers for upload panel
  onImageUploaded(file: File): void {
    this.uploadedImage.set(file);
    console.log('Image uploaded:', file.name);
    
    // Here you would integrate with your canvas/design system
    // For example, add the image to the Fabric.js canvas
  }

  onTemplateSelected(template: string): void {
    console.log('Template selected:', template);
    
    // Here you would load the selected template into the design area
    // This could involve applying predefined designs or layouts
  }

  // Event handlers for product preview
  onViewChanged(view: string): void {
    this.activeProductView.set(view);
    console.log('Product view changed to:', view);
    
    // Here you would update the preview to show different angles/views
    // This might involve switching canvas contents or 3D model views
  }

  // Event handlers for options panel
  onColorChanged(color: string): void {
    this.selectedShirtColor.set(color);
    console.log('Shirt color changed to:', color);
    
    // Update the product preview with the new color
    // This would typically update the t-shirt base color in the preview
  }

  onSizeChanged(size: string): void {
    console.log('Size changed to:', size);
    
    // Here you might adjust pricing based on size
    // Or update the product preview dimensions
  }

  onTextOptionsChanged(textOptions: TextOptions): void {
    this.currentTextOptions.set(textOptions);
    console.log('Text options changed:', textOptions);
    
    // Apply text styling changes to the canvas
    // This would update any text elements in the design
  }

  onPriceUpdated(priceBreakdown: PriceBreakdown): void {
    this.currentPriceBreakdown.set(priceBreakdown);
    console.log('Price updated:', priceBreakdown);
    
    // Update the pricing display and calculations
    // This might trigger updates to shipping, taxes, etc.
  }

  // Action handlers for bottom bar
  addToCart(): void {
    const designData = {
      shirtColor: this.selectedShirtColor(),
      uploadedImage: this.uploadedImage(),
      textOptions: this.currentTextOptions(),
      priceBreakdown: this.currentPriceBreakdown(),
      productView: this.activeProductView()
    };
    
    console.log('Adding to cart:', designData);
    
    // Here you would:
    // 1. Validate the design is complete
    // 2. Generate a preview image of the final design
    // 3. Add the item to the shopping cart
    // 4. Possibly redirect to cart page or show confirmation
  }

  buyNow(): void {
    const designData = {
      shirtColor: this.selectedShirtColor(),
      uploadedImage: this.uploadedImage(),
      textOptions: this.currentTextOptions(),
      priceBreakdown: this.currentPriceBreakdown(),
      productView: this.activeProductView()
    };
    
    console.log('Buy now:', designData);
    
    // Here you would:
    // 1. Validate the design is complete
    // 2. Generate a preview image of the final design
    // 3. Proceed directly to checkout with this item
    // 4. Redirect to checkout page
  }

  // Utility methods for future canvas integration
  saveDesign(): void {
    // Save the current design state
    // This could save to localStorage, backend, or both
  }

  loadDesign(designId: string): void {
    // Load a previously saved design
    // This would restore all the component states
  }

  exportDesign(): void {
    // Export the design as an image
    // This would generate a high-resolution preview
  }
}
