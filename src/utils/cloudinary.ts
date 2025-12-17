import type { 
  CloudinaryUploadWidgetOptions, 
  CloudinaryUploadResult,
  CloudinaryWidget 
} from '@/types/cloudinary';

// Get Cloudinary config from env
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Generate optimized Cloudinary URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 */
export const getOptimizedImageUrl = (
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'auto:best' | 'auto:good' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto:best', format = 'auto' } = options || {};
  
  // Build transformation string
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push('c_fit'); // Fit within dimensions without cropping
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  const transformString = transformations.join(',');
  
  // Insert transformation into URL
  return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * Create and open Cloudinary upload widget
 */
export const openCloudinaryWidget = (
  onSuccess: (publicId: string, secureUrl: string) => void,
  onError?: (error: string) => void,
  multiple?: boolean,
  folder?: string,
  customOptions?: Partial<CloudinaryUploadWidgetOptions>,
  onClose?: () => void
): CloudinaryWidget | null => {
  // Check if Cloudinary is loaded
  if (!window.cloudinary) {
    console.error('Cloudinary widget not loaded');
    if (onError) onError('Cloudinary widget not loaded');
    return null;
  }

  // Default widget options
  const defaultOptions: CloudinaryUploadWidgetOptions = {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    sources: ['local', 'url', 'camera'],
    multiple: multiple || false,
    maxFiles: multiple ? 20 : 1,
    maxFileSize: 15000000, // 15MB for higher quality images
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'tiff'],
    maxImageWidth: 4000, // Higher resolution
    maxImageHeight: 4000, // Higher resolution
    cropping: false,
    folder: folder || 'youths4change',
    tags: ['youths4change', 'website'],
  };

  // Merge with custom options
  const options = { ...defaultOptions, ...customOptions };

  // Create widget
  const widget = window.cloudinary.createUploadWidget(
    options,
    (error: any, result: CloudinaryUploadResult) => {
      console.log('Cloudinary event:', result?.event, 'Info:', result?.info?.public_id);
      
      if (error) {
        console.error('Cloudinary upload error:', error);
        if (onError) onError(error.message || 'Upload failed');
        return;
      }

      // Handle successful upload - trigger immediately for each file
      if (result.event === 'success') {
        console.log('Upload success, calling onSuccess for:', result.info.public_id);
        const { public_id, secure_url } = result.info;
        onSuccess(public_id, secure_url);
      }
      
      // Handle widget close event
      if (result.event === 'close') {
        console.log('Widget closed');
        // Widget closed, all uploads complete
        if (onClose) onClose();
      }
    }
  );

  console.log('Opening Cloudinary widget with options:', { 
    multiple: options.multiple, 
    maxFiles: options.maxFiles,
    folder: options.folder 
  });

  // Open widget
  widget.open();

  return widget;
};

/**
 * Generate Cloudinary image URL from public_id with transformations
 */
export const getCloudinaryUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    gravity?: 'auto' | 'face' | 'center';
  }
): string => {
  if (!publicId) return '';
  if (!CLOUDINARY_CLOUD_NAME) {
    console.error('VITE_CLOUDINARY_CLOUD_NAME not set in .env');
    return '';
  }

  // Default transformations
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
  } = options || {};

  // Build transformation string
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (gravity && crop === 'fill') transformations.push(`g_${gravity}`);

  const transformString = transformations.length > 0 
    ? `${transformations.join(',')}/` 
    : '';

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}${publicId}`;
};

/**
 * Generate thumbnail URL (small preview)
 */
export const getThumbnailUrl = (publicId: string): string => {
  return getCloudinaryUrl(publicId, {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  });
};

/**
 * Generate card image URL (medium size for cards)
 */
export const getCardImageUrl = (publicId: string): string => {
  return getCloudinaryUrl(publicId, {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  });
};

/**
 * Generate hero image URL (large, optimized)
 */
export const getHeroImageUrl = (publicId: string): string => {
  return getCloudinaryUrl(publicId, {
    width: 1920,
    height: 800,
    crop: 'fit',
    quality: 'auto',
    format: 'auto',
  });
};

/**
 * Generate full size image URL (original quality)
 */
export const getFullImageUrl = (publicId: string): string => {
  return getCloudinaryUrl(publicId, {
    quality: 'auto',
    format: 'auto',
  });
};

/**
 * Validate environment variables
 */
export const validateCloudinaryConfig = (): boolean => {
  if (!CLOUDINARY_CLOUD_NAME) {
    console.error('Missing VITE_CLOUDINARY_CLOUD_NAME in .env file');
    return false;
  }
  if (!CLOUDINARY_UPLOAD_PRESET) {
    console.error('Missing VITE_CLOUDINARY_UPLOAD_PRESET in .env file');
    return false;
  }
  return true;
};