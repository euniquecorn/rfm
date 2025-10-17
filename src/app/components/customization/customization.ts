import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

import { OptionsPanelComponent, PriceBreakdown, TextOptions } from './options-panel/options-panel';
import { ProductPreviewComponent } from './product-preview/product-preview';
import { UploadPanelComponent } from './upload-panel/upload-panel';

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
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    console.log('Image uploaded:', file.name);
  }

  onTemplateSelected(template: string): void {
    this.selectedTemplate.set(template);
    this.applyTemplate(template);
  }

  private applyTemplate(template: string): void {
    switch (template) {
      case 'sports':
        this.onTextOptionsChanged({
          fontFamily: 'Arial', fontSize: 24, isBold: true, isItalic: false,
          isUnderline: false, color: '#ffffff', letterSpacing: '1px'
        });
        break;
      case 'minimal':
        this.onTextOptionsChanged({
          fontFamily: 'Helvetica', fontSize: 16, isBold: false, isItalic: false,
          isUnderline: false, color: '#333333', letterSpacing: 'normal'
        });
        break;
      case 'vintage':
        this.onTextOptionsChanged({
          fontFamily: 'Georgia', fontSize: 18, isBold: false, isItalic: true,
          isUnderline: false, color: '#8b4513', letterSpacing: '0.5px'
        });
        break;
      case 'modern':
        this.onTextOptionsChanged({
          fontFamily: 'Roboto', fontSize: 20, isBold: true, isItalic: false,
          isUnderline: false, color: '#667eea', letterSpacing: '1px'
        });
        break;
    }
  }

  onViewChanged(view: string): void {
    this.activeProductView.set(view);
  }

  onColorChanged(color: string): void {
    this.selectedShirtColor.set(color);
  }

  onSizeChanged(size: string): void {
    let sizeMultiplier = 1.0;
    switch (size) {
      case 'xs':
      case 's': sizeMultiplier = 0.9; break;
      case 'xl': sizeMultiplier = 1.1; break;
      case 'xxl': sizeMultiplier = 1.2; break;
    }
    this.basePrice.set(1050.00 * sizeMultiplier);
  }

  onTextOptionsChanged(textOptions: TextOptions): void {
    this.currentTextOptions.set(textOptions);
  }

  onPriceUpdated(priceBreakdown: PriceBreakdown): void {
    this.currentPriceBreakdown.set(priceBreakdown);
  }

  addToCart(): void {
    if (!this.validateDesign()) return;
    alert('Item added to cart successfully!');
  }

  buyNow(): void {
    if (!this.validateDesign()) return;
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
    const savedDesigns = JSON.parse(localStorage.getItem('savedDesigns') || '[]');
    savedDesigns.push(designState);
    localStorage.setItem('savedDesigns', JSON.stringify(savedDesigns));
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
    }
  }

  exportDesign(): void {
    const designData = {
      shirtColor: this.selectedShirtColor(),
      uploadedImageUrl: this.uploadedImageUrl(),
      textOptions: this.currentTextOptions(),
      productView: this.activeProductView(),
      selectedTemplate: this.selectedTemplate(),
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(designData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `design-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  getDesignPreview(): string {
    return JSON.stringify({
      shirtColor: this.selectedShirtColor(),
      hasImage: !!this.uploadedImage(),
      template: this.selectedTemplate(),
      textOptions: this.currentTextOptions()
    });
  }
}
