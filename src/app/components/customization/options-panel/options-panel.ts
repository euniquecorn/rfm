import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ColorOption {
  name: string;
  value: string;
  isSelected: boolean;
}

export interface SizeOption {
  id: string;
  label: string;
  isSelected: boolean;
}

export interface TextOptions {
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  color: string;
  letterSpacing: string;
}

export interface PriceBreakdown {
  basePrice: number;
  quantity: number;
  discount: number;
  finalPrice: number;
}

@Component({
  selector: 'app-options-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './options-panel.html',
  styleUrl: './options-panel.css'
})
export class OptionsPanelComponent implements OnInit {
  @Input() basePrice = 1050.00;
  @Output() colorChanged = new EventEmitter<string>();
  @Output() sizeChanged = new EventEmitter<string>();
  @Output() textOptionsChanged = new EventEmitter<TextOptions>();
  @Output() priceUpdated = new EventEmitter<PriceBreakdown>();

  // Shirt Options
  protected shirtColors = signal<ColorOption[]>([
    { name: 'Black', value: '#000000', isSelected: true },
    { name: 'White', value: '#ffffff', isSelected: false },
    { name: 'Orange', value: '#ff6600', isSelected: false },
    { name: 'Light Green', value: '#90EE90', isSelected: false },
    { name: 'Green', value: '#008000', isSelected: false },
    { name: 'Teal', value: '#008080', isSelected: false },
    { name: 'Purple', value: '#800080', isSelected: false },
    { name: 'Light Purple', value: '#9370DB', isSelected: false }
  ]);

  protected sizes = signal<SizeOption[]>([
    { id: 'xs', label: 'XS', isSelected: false },
    { id: 's', label: 'S', isSelected: false },
    { id: 'm', label: 'M', isSelected: true },
    { id: 'l', label: 'L', isSelected: false },
    { id: 'xl', label: 'XL', isSelected: false },
    { id: 'xxl', label: 'XXL', isSelected: false }
  ]);

  // Text Options
  protected textOptions = signal<TextOptions>({
    fontFamily: 'Roboto',
    fontSize: 16,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    color: '#ff4444',
    letterSpacing: 'normal'
  });

  protected fontFamilies = ['Roboto', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia'];
  protected textColors = ['#ff4444', '#ffcc00', '#00cc44', '#0088ff'];
  protected letterSpacingOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Tight', value: '-0.5px' },
    { label: 'Wide', value: '1px' },
    { label: 'Extra Wide', value: '2px' }
  ];

  // Image Options
  protected imageControls = [
    { icon: '🔒', label: 'Lock aspect ratio', action: 'lock' },
    { icon: '📋', label: 'Copy', action: 'copy' },
    { icon: '🗑️', label: 'Delete', action: 'delete' },
    { icon: '📤', label: 'Export', action: 'export' },
    { icon: '🔗', label: 'Link', action: 'link' }
  ];

  protected lockAspectRatio = signal(false);

  // Pricing
  protected quantity = signal(1);
  protected discount = signal(0.10); // 10% off
  protected calculatedPrice = signal<PriceBreakdown | null>(null);

  selectColor(color: ColorOption): void {
    const updatedColors = this.shirtColors().map(c => ({
      ...c,
      isSelected: c.value === color.value
    }));
    this.shirtColors.set(updatedColors);
    this.colorChanged.emit(color.value);
    this.updatePrice();
  }

  selectSize(size: SizeOption): void {
    const updatedSizes = this.sizes().map(s => ({
      ...s,
      isSelected: s.id === size.id
    }));
    this.sizes.set(updatedSizes);
    this.sizeChanged.emit(size.id);
    this.updatePrice();
  }

  updateTextStyle(property: keyof TextOptions, value: any): void {
    const current = this.textOptions();
    const updated = { ...current, [property]: value };
    this.textOptions.set(updated);
    this.textOptionsChanged.emit(updated);
  }

  toggleTextStyle(property: 'isBold' | 'isItalic' | 'isUnderline'): void {
    const current = this.textOptions();
    const updated = { ...current, [property]: !current[property] };
    this.textOptions.set(updated);
    this.textOptionsChanged.emit(updated);
  }

  updateQuantity(newQuantity: number): void {
    if (newQuantity >= 1) {
      this.quantity.set(newQuantity);
      this.updatePrice();
    }
  }

  private updatePrice(): void {
    const qty = this.quantity();
    const discount = this.discount();
    const finalPrice = this.basePrice * qty * (1 - discount);
    
    const priceBreakdown: PriceBreakdown = {
      basePrice: this.basePrice,
      quantity: qty,
      discount: discount,
      finalPrice: finalPrice
    };
    
    this.calculatedPrice.set(priceBreakdown);
    this.priceUpdated.emit(priceBreakdown);
  }

  getSelectedSizeId(): string {
    const selectedSize = this.sizes().find(size => size.isSelected);
    return selectedSize ? selectedSize.id : 'm';
  }

  onSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedSizeId = target.value;
    const selectedSize = this.sizes().find(size => size.id === selectedSizeId);
    if (selectedSize) {
      this.selectSize(selectedSize);
    }
  }

  onImageControlClick(action: string): void {
    switch (action) {
      case 'lock':
        this.lockAspectRatio.set(!this.lockAspectRatio());
        break;
      case 'copy':
        console.log('Copy image');
        break;
      case 'delete':
        console.log('Delete image');
        break;
      case 'export':
        console.log('Export image');
        break;
      case 'link':
        console.log('Link image');
        break;
    }
  }

  // Font size control
  updateFontSize(size: number): void {
    const current = this.textOptions();
    const updated = { ...current, fontSize: Math.max(8, Math.min(72, size)) };
    this.textOptions.set(updated);
    this.textOptionsChanged.emit(updated);
  }

  increaseFontSize(): void {
    this.updateFontSize(this.textOptions().fontSize + 2);
  }

  decreaseFontSize(): void {
    this.updateFontSize(this.textOptions().fontSize - 2);
  }

  // Initialize price calculation
  ngOnInit(): void {
    this.updatePrice();
  }
}