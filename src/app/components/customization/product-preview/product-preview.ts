import { Component, Input, Output, EventEmitter, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProductView {
  id: string;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-product-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-preview.html',
  styleUrl: './product-preview.css'
})
export class ProductPreviewComponent implements OnChanges {
  @Input() selectedColor = '#ffffff';
  @Input() designImage: File | null = null;
  @Input() activeView = 'front';
  @Output() viewChanged = new EventEmitter<string>();

  protected views = signal<ProductView[]>([
    { id: 'front', name: 'Front', isActive: true },
    { id: 'back', name: 'Back', isActive: false },
    { id: 'jersey-nu', name: 'Jersey Nu', isActive: false },
    { id: 'xxl-sleeve', name: 'XXL Sleeve', isActive: false }
  ]);

  protected designImageUrl = signal<string | null>(null);

  ngOnChanges(): void {
    if (this.designImage) {
      this.loadDesignImage();
    }
  }

  private loadDesignImage(): void {
    if (this.designImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.designImageUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(this.designImage);
    }
  }

  selectView(viewId: string): void {
    // Update views
    const updatedViews = this.views().map(view => ({
      ...view,
      isActive: view.id === viewId
    }));
    this.views.set(updatedViews);
    
    this.viewChanged.emit(viewId);
  }

  // Undo/Redo functionality
  undo(): void {
    // This will be implemented with the canvas integration
    console.log('Undo action');
  }

  redo(): void {
    // This will be implemented with the canvas integration
    console.log('Redo action');
  }
}