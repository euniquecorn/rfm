import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-panel.html',
  styleUrl: './upload-panel.css'
})
export class UploadPanelComponent {
  @Output() imageUploaded = new EventEmitter<File>();
  @Output() templateSelected = new EventEmitter<string>();

  protected isDragOver = signal(false);
  protected supportedFormats = ['JPG', 'PNG', 'SVG'];
  protected removeBackground = signal(true);
  protected enhanceQuality = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileUpload(input.files[0]);
    }
  }

  private handleFileUpload(file: File): void {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, SVG)');
      return;
    }

    this.imageUploaded.emit(file);
  }

  selectTemplate(template: string): void {
    this.templateSelected.emit(template);
  }

  toggleRemoveBackground(): void {
    this.removeBackground.set(!this.removeBackground());
  }

  toggleEnhanceQuality(): void {
    this.enhanceQuality.set(!this.enhanceQuality());
  }
}