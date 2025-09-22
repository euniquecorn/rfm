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
  protected designPosition = signal({ x: 50, y: 50 }); // Percentage position
  protected designSize = signal({ width: 40, height: 40 }); // Percentage size
  protected isDragging = signal(false);
  protected isResizing = signal(false);
  protected dragStart = { x: 0, y: 0 };
  protected designHistory: Array<{ imageUrl: string | null, position: { x: number, y: number }, size: { width: number, height: number } }> = [];
  protected historyIndex = signal(-1);

  ngOnChanges(): void {
    if (this.designImage) {
      this.loadDesignImage();
    }
    
    // Update active view when input changes
    if (this.activeView) {
      this.selectView(this.activeView);
    }
  }

  private loadDesignImage(): void {
    if (this.designImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        this.designImageUrl.set(imageUrl);
        this.saveToHistory();
      };
      reader.readAsDataURL(this.designImage);
    } else {
      this.designImageUrl.set(null);
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

  // Design manipulation
  onDesignMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dragStart = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  onDesignMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    
    event.preventDefault();
    const container = (event.target as HTMLElement).closest('.design-area');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const x = ((event.clientX - containerRect.left) / containerRect.width) * 100;
    const y = ((event.clientY - containerRect.top) / containerRect.height) * 100;
    
    // Constrain to bounds
    const constrainedX = Math.max(0, Math.min(100 - this.designSize().width, x));
    const constrainedY = Math.max(0, Math.min(100 - this.designSize().height, y));
    
    this.designPosition.set({ x: constrainedX, y: constrainedY });
  }

  onDesignMouseUp(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
      this.saveToHistory();
    }
  }

  onDesignResize(direction: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing.set(true);
    
    const startSize = this.designSize();
    const startPos = this.designPosition();
    const startX = event.clientX;
    const startY = event.clientY;
    
    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = startPos.x;
      let newY = startPos.y;
      
      switch (direction) {
        case 'se': // bottom-right
          newWidth = Math.max(10, Math.min(60, startSize.width + (deltaX / 5)));
          newHeight = Math.max(10, Math.min(60, startSize.height + (deltaY / 5)));
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(10, Math.min(60, startSize.width - (deltaX / 5)));
          newHeight = Math.max(10, Math.min(60, startSize.height + (deltaY / 5)));
          newX = startPos.x + (startSize.width - newWidth);
          break;
        case 'ne': // top-right
          newWidth = Math.max(10, Math.min(60, startSize.width + (deltaX / 5)));
          newHeight = Math.max(10, Math.min(60, startSize.height - (deltaY / 5)));
          newY = startPos.y + (startSize.height - newHeight);
          break;
        case 'nw': // top-left
          newWidth = Math.max(10, Math.min(60, startSize.width - (deltaX / 5)));
          newHeight = Math.max(10, Math.min(60, startSize.height - (deltaY / 5)));
          newX = startPos.x + (startSize.width - newWidth);
          newY = startPos.y + (startSize.height - newHeight);
          break;
      }
      
      // Ensure design stays within bounds
      if (newX + newWidth > 100) newX = 100 - newWidth;
      if (newY + newHeight > 100) newY = 100 - newHeight;
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      
      this.designSize.set({ width: newWidth, height: newHeight });
      this.designPosition.set({ x: newX, y: newY });
    };
    
    const onMouseUp = () => {
      this.isResizing.set(false);
      this.saveToHistory();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // History management
  private saveToHistory(): void {
    const state = {
      imageUrl: this.designImageUrl(),
      position: { ...this.designPosition() },
      size: { ...this.designSize() }
    };
    
    // Remove any history after current index
    this.designHistory = this.designHistory.slice(0, this.historyIndex() + 1);
    this.designHistory.push(state);
    this.historyIndex.set(this.designHistory.length - 1);
    
    // Limit history to 20 items
    if (this.designHistory.length > 20) {
      this.designHistory.shift();
      this.historyIndex.set(this.historyIndex() - 1);
    }
  }

  // Undo/Redo functionality
  undo(): void {
    if (this.historyIndex() > 0) {
      this.historyIndex.set(this.historyIndex() - 1);
      const state = this.designHistory[this.historyIndex()];
      this.restoreState(state);
    }
  }

  redo(): void {
    if (this.historyIndex() < this.designHistory.length - 1) {
      this.historyIndex.set(this.historyIndex() + 1);
      const state = this.designHistory[this.historyIndex()];
      this.restoreState(state);
    }
  }

  private restoreState(state: any): void {
    this.designImageUrl.set(state.imageUrl);
    this.designPosition.set(state.position);
    this.designSize.set(state.size);
  }

  // Utility methods
  canUndo(): boolean {
    return this.historyIndex() > 0;
  }

  canRedo(): boolean {
    return this.historyIndex() < this.designHistory.length - 1;
  }

  resetDesign(): void {
    this.designImageUrl.set(null);
    this.designPosition.set({ x: 50, y: 50 });
    this.designSize.set({ width: 40, height: 40 });
    this.saveToHistory();
  }

  centerDesign(): void {
    this.designPosition.set({
      x: 50 - this.designSize().width / 2,
      y: 50 - this.designSize().height / 2
    });
    this.saveToHistory();
  }
}