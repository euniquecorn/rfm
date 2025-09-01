import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css'
})
export class CanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
  
  private fabricCanvas: any;
  private fabric: any;
  protected canvasName = signal('My Canvas');
  protected isLoading = signal(false);
  protected message = signal('');

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFabricAndInitialize();
    }
  }

  ngOnDestroy(): void {
    if (this.fabricCanvas) {
      this.fabricCanvas.dispose();
    }
  }

  private async loadFabricAndInitialize(): Promise<void> {
    try {
      // Dynamically import fabric.js only on the client side
      this.fabric = await import('fabric');
      this.initializeCanvas();
    } catch (error) {
      console.error('Failed to load fabric.js:', error);
      this.message.set('Failed to load canvas library');
    }
  }

  private initializeCanvas(): void {
    if (!this.fabric || !this.canvasElement) return;
    
    this.fabricCanvas = new this.fabric.Canvas(this.canvasElement.nativeElement, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    // Add some default objects for demonstration
    this.addDefaultObjects();
  }

  private addDefaultObjects(): void {
    if (!this.fabric || !this.fabricCanvas) return;
    
    // Add a rectangle
    const rect = new this.fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#ff6b6b',
      stroke: '#333',
      strokeWidth: 2
    });

    // Add a circle
    const circle = new this.fabric.Circle({
      left: 250,
      top: 150,
      radius: 50,
      fill: '#4ecdc4',
      stroke: '#333',
      strokeWidth: 2
    });

    // Add text
    const text = new this.fabric.Text('Hello Fabric.js!', {
      left: 100,
      top: 250,
      fontSize: 24,
      fill: '#333'
    });

    this.fabricCanvas.add(rect, circle, text);
  }

  addRectangle(): void {
    if (!this.fabric || !this.fabricCanvas) return;
    
    const rect = new this.fabric.Rect({
      left: Math.random() * 600,
      top: Math.random() * 400,
      width: 80,
      height: 80,
      fill: this.getRandomColor(),
      stroke: '#333',
      strokeWidth: 1
    });
    this.fabricCanvas.add(rect);
  }

  addCircle(): void {
    if (!this.fabric || !this.fabricCanvas) return;
    
    const circle = new this.fabric.Circle({
      left: Math.random() * 600,
      top: Math.random() * 400,
      radius: 40,
      fill: this.getRandomColor(),
      stroke: '#333',
      strokeWidth: 1
    });
    this.fabricCanvas.add(circle);
  }

  addText(): void {
    if (!this.fabric || !this.fabricCanvas) return;
    
    const text = new this.fabric.Text('New Text', {
      left: Math.random() * 600,
      top: Math.random() * 400,
      fontSize: 20,
      fill: this.getRandomColor()
    });
    this.fabricCanvas.add(text);
  }

  deleteSelected(): void {
    if (!this.fabricCanvas) return;
    
    const activeObjects = this.fabricCanvas.getActiveObjects();
    if (activeObjects.length) {
      this.fabricCanvas.remove(...activeObjects);
      this.fabricCanvas.discardActiveObject();
    }
  }

  clearCanvas(): void {
    if (!this.fabricCanvas) return;
    
    this.fabricCanvas.clear();
    this.fabricCanvas.backgroundColor = '#ffffff';
  }

  saveCanvas(): void {
    if (!this.fabricCanvas) return;
    
    this.isLoading.set(true);
    const canvasData = this.fabricCanvas.toJSON();
    
    this.apiService.saveCanvas(canvasData, this.canvasName()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.message.set('Canvas saved successfully!');
        } else {
          this.message.set('Failed to save canvas: ' + response.message);
        }
        setTimeout(() => this.message.set(''), 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.message.set('Error saving canvas: ' + error.message);
        setTimeout(() => this.message.set(''), 3000);
      }
    });
  }

  exportAsImage(): void {
    if (!this.fabricCanvas) return;
    
    const dataURL = this.fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${this.canvasName()}.png`;
    link.href = dataURL;
    link.click();
  }

  private getRandomColor(): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
