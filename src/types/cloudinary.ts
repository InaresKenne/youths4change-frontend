// Cloudinary Upload Widget types
export interface CloudinaryUploadWidgetOptions {
  cloudName: string;
  uploadPreset: string;
  sources?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  clientAllowedFormats?: string[];
  maxImageWidth?: number;
  maxImageHeight?: number;
  cropping?: boolean;
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
}

export interface CloudinaryUploadResult {
  event: string;
  info: {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    created_at: string;
    [key: string]: any;
  };
}

export interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
  update: (options: Partial<CloudinaryUploadWidgetOptions>) => void;
}

// Extend window interface for Cloudinary
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: CloudinaryUploadWidgetOptions,
        callback: (error: any, result: CloudinaryUploadResult) => void
      ) => CloudinaryWidget;
    };
  }
}
