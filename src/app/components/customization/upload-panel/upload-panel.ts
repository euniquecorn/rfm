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
  protected uploadedFile = signal<File | null>(null);
  protected uploadedImageUrl = signal<string | null>(null);
  protected isUploading = signal(false);

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

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    this.isUploading.set(true);
    this.uploadedFile.set(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageUrl.set(e.target?.result as string);
      this.isUploading.set(false);
      this.imageUploaded.emit(file);
    };
    reader.readAsDataURL(file);
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

  removeUploadedImage(): void {
    this.uploadedFile.set(null);
    this.uploadedImageUrl.set(null);
  }

  // Template data
  protected templates = [
    { id: 'sports', name: 'Sports', preview: 'Athletic design template' },
    { id: 'minimal', name: 'Minimal', preview: 'Clean and simple template' },
    { id: 'vintage', name: 'Vintage', preview: 'Retro style template' },
    { id: 'modern', name: 'Modern', preview: 'Contemporary design template' }
  ];
}