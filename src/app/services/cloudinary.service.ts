import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface UploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = environment.cloudinary.cloudName;
  private apiKey = environment.cloudinary.apiKey;

  constructor(private http: HttpClient) {}

  /**
   * Upload image to Cloudinary using unsigned upload
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rfm_uploads');

    try {
      // Note: For unsigned uploads, you need an upload preset
      // For now, we'll show you how to create the preset first
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedUrl(publicId: string, width?: number, height?: number, quality = 'auto'): string {
    let transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`, 'f_auto');

    const transformString = transformations.join(',');
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * Get thumbnail URL for previews
   */
  getThumbnailUrl(publicId: string, size = 300): string {
    return this.getOptimizedUrl(publicId, size, size, 'auto');
  }

  /**
   * Get original image URL
   */
  getOriginalUrl(publicId: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`;
  }
}
