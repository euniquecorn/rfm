import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadPanelComponent } from './upload-panel/upload-panel';
import { ProductPreviewComponent } from './product-preview/product-preview';
import { OptionsPanelComponent, PriceBreakdown, TextOptions } from './options-panel/options-panel';

@Component({
  selector: 'app-customization',
  imports: [
    CommonModule,
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
  protected uploadedImageUrl = signal<string | null>(null);
  protected activeProductView = signal('front');
  protected basePrice = signal(1050.00);
  protected currentPriceBreakdown = signal<PriceBreakdown | null>(null);
  protected currentTextOptions = signal<TextOptions | null>(null);
  protected selectedTemplate = signal<string | null>(null);

  // Event handlers for upload panel
  onImageUploaded(file: File): void {
    this.uploadedImage.set(file);
    
    // Create preview URL for the product preview component
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    console.log('Image uploaded:', file.name);
  }

  onTemplateSelected(template: string): void {
    this.selectedTemplate.set(template);
    console.log('Template selected:', template);
    
    // Apply template-specific styling or design elements
    this.applyTemplate(template);
  }

  private applyTemplate(template: string): void {
    switch (template) {
      case 'sports':
        // Apply sports template styling
        this.onTextOptionsChanged({
          fontFamily: 'Arial',
          fontSize: 24,
          isBold: true,
          isItalic: false,
          isUnderline: false,
          color: '#ffffff',
          letterSpacing: '1px'
        });
        break;
      case 'minimal':
        // Apply minimal template styling
        this.onTextOptionsChanged({
          fontFamily: 'Helvetica',
          fontSize: 16,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          color: '#333333',
          letterSpacing: 'normal'
        });
        break;
      case 'vintage':
        // Apply vintage template styling
        this.onTextOptionsChanged({
          fontFamily: 'Georgia',
          fontSize: 18,
          isBold: false,
          isItalic: true,
          isUnderline: false,
          color: '#8b4513',
          letterSpacing: '0.5px'
        });
        break;
      case 'modern':
        // Apply modern template styling
        this.onTextOptionsChanged({
          fontFamily: 'Roboto',
          fontSize: 20,
          isBold: true,
          isItalic: false,
          isUnderline: false,
          color: '#667eea',
          letterSpacing: '1px'
        });
        break;
    }
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
  }

  onSizeChanged(size: string): void {
    console.log('Size changed to:', size);
    
    // Adjust pricing based on size
    let sizeMultiplier = 1.0;
    switch (size) {
      case 'xs':
      case 's':
        sizeMultiplier = 0.9;
        break;
      case 'xl':
        sizeMultiplier = 1.1;
        break;
      case 'xxl':
        sizeMultiplier = 1.2;
        break;
      default:
        sizeMultiplier = 1.0;
    }
    
    // Update base price with size adjustment
    const adjustedPrice = 1050.00 * sizeMultiplier;
    this.basePrice.set(adjustedPrice);
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
    if (!this.validateDesign()) {
      return;
    }

    const designData = {
      shirtColor: this.selectedShirtColor(),
      uploadedImage: this.uploadedImage(),
      uploadedImageUrl: this.uploadedImageUrl(),
      textOptions: this.currentTextOptions(),
      priceBreakdown: this.currentPriceBreakdown(),
      productView: this.activeProductView(),
      selectedTemplate: this.selectedTemplate()
    };
    
    console.log('Adding to cart:', designData);
    
    // Show success message
    alert('Item added to cart successfully!');
  }

  buyNow(): void {
    if (!this.validateDesign()) {
      return;
    }

    const designData = {
      shirtColor: this.selectedShirtColor(),
      uploadedImage: this.uploadedImage(),
      uploadedImageUrl: this.uploadedImageUrl(),
      textOptions: this.currentTextOptions(),
      priceBreakdown: this.currentPriceBreakdown(),
      productView: this.activeProductView(),
      selectedTemplate: this.selectedTemplate()
    };
    
    console.log('Buy now:', designData);
    
    // Show purchase confirmation
    alert('Proceeding to checkout...');
  }

  private validateDesign(): boolean {
    if (!this.uploadedImage() && !this.selectedTemplate()) {
      alert('Please upload an image or select a template to continue.');
      return false;
    }
    
    if (!this.currentPriceBreakdown()) {
      alert('Please wait for price calculation to complete.');
      return false;
    }
    
    return true;
  }

  // Utility methods for future canvas integration
  saveDesign(): void {
    const designState = {
      id: Date.now().toString(),
      shirtColor: this.selectedShirtColor(),
      uploadedImageUrl: this.uploadedImageUrl(),
      textOptions: this.currentTextOptions(),
      productView: this.activeProductView(),
      selectedTemplate: this.selectedTemplate(),
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const savedDesigns = JSON.parse(localStorage.getItem('savedDesigns') || '[]');
    savedDesigns.push(designState);
    localStorage.setItem('savedDesigns', JSON.stringify(savedDesigns));
    
    console.log('Design saved:', designState);
    alert('Design saved successfully!');
  }

  loadDesign(designId: string): void {
    const savedDesigns = JSON.parse(localStorage.getItem('savedDesigns') || '[]');
    const design = savedDesigns.find((d: any) => d.id === designId);
    
    if (design) {
      this.selectedShirtColor.set(design.shirtColor);
      this.uploadedImageUrl.set(design.uploadedImageUrl);
      this.currentTextOptions.set(design.textOptions);
      this.activeProductView.set(design.productView);
      this.selectedTemplate.set(design.selectedTemplate);
      
      console.log('Design loaded:', design);
    }
  }

  exportDesign(): void {
    // Create a simple export of the current design state
    const designData = {
      shirtColor: this.selectedShirtColor(),
      uploadedImageUrl: this.uploadedImageUrl(),
      textOptions: this.currentTextOptions(),
      productView: this.activeProductView(),
      selectedTemplate: this.selectedTemplate(),
      exportedAt: new Date().toISOString()
    };
    
    // Convert to JSON and create downloadable file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `design-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    console.log('Design exported');
  }

  // Get design preview for sharing
  getDesignPreview(): string {
    return JSON.stringify({
      shirtColor: this.selectedShirtColor(),
      hasImage: !!this.uploadedImage(),
      template: this.selectedTemplate(),
      textOptions: this.currentTextOptions()
    });
  }
}
