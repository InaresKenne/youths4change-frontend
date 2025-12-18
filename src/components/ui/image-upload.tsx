import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { openCloudinaryWidget, getCloudinaryUrl, validateCloudinaryConfig } from '@/utils/cloudinary';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string; // Current image URL or cloudinary_public_id
  onChange: (url: string, publicId?: string) => void;
  onRemove?: () => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  previewWidth?: number;
  previewHeight?: number;
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Image',
  description,
  disabled = false,
  className,
  previewWidth = 400,
  previewHeight = 300,
  folder,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = () => {
    // Validate Cloudinary config
    if (!validateCloudinaryConfig()) {
      setError('Cloudinary configuration is missing. Please check your .env file.');
      return;
    }

    setUploading(true);
    setError(null);

    openCloudinaryWidget(
      (publicId: string, secureUrl: string) => {
        console.log('Upload successful:', { publicId, secureUrl });
        onChange(secureUrl, publicId);
        setUploading(false);
      },
      (uploadError: any) => {
        console.error('Upload failed:', uploadError);
        setError('Failed to upload image. Please try again.');
        setUploading(false);
      },
      false,
      folder
    );
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('', '');
    }
    setError(null);
  };

  // If value is already a full URL, use it directly; otherwise construct from public ID
  const imageUrl = value ? (
    value.startsWith('http') ? value : getCloudinaryUrl(value, { 
      width: previewWidth, 
      height: previewHeight,
      crop: 'fill',
      quality: 'auto',
    })
  ) : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label and Description */}
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <div className="space-y-4">
        {/* Preview */}
        {imageUrl ? (
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt="Preview"
              className="rounded-lg border shadow-sm"
              style={{ 
                width: `${previewWidth}px`, 
                height: `${previewHeight}px`,
                objectFit: 'cover' 
              }}
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors p-12 cursor-pointer"
            style={{ 
              width: `${previewWidth}px`, 
              height: `${previewHeight}px` 
            }}
            onClick={disabled ? undefined : handleUpload}
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">Click to upload image</p>
            <p className="text-xs text-gray-500">
              JPG, PNG, WEBP, GIF (Max 10MB)
            </p>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUpload}
            disabled={disabled || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {imageUrl ? 'Change Image' : 'Upload Image'}
              </>
            )}
          </Button>

          {imageUrl && !disabled && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        {/* Current Public ID (for debugging) */}
        {value && (
          <p className="text-xs text-gray-500 font-mono">
            Public ID: {value}
          </p>
        )}
      </div>
    </div>
  );
}