import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { openCloudinaryWidget, getFullImageUrl, validateCloudinaryConfig } from '@/utils/cloudinary';

export interface MultiImageUploadItem {
  cloudinary_public_id: string;
  secureUrl: string;
  caption: string;
}

interface MultiImageUploadProps {
  onImagesChange: (images: MultiImageUploadItem[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function MultiImageUpload({
  onImagesChange,
  maxImages = 10,
  disabled = false,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<MultiImageUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imagesRef = useRef<MultiImageUploadItem[]>([]);

  const handleUpload = () => {
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate Cloudinary config
    if (!validateCloudinaryConfig()) {
      setError('Cloudinary configuration is missing. Please check your .env file.');
      return;
    }

    setUploading(true);
    setError(null);

    openCloudinaryWidget(
      (publicId: string, secureUrl: string) => {
        console.log('Image uploaded:', publicId);
        const newImage: MultiImageUploadItem = {
          cloudinary_public_id: publicId,
          secureUrl: secureUrl,
          caption: '',
        };
        
        // Add to ref immediately
        imagesRef.current = [...imagesRef.current, newImage];
        console.log('Images ref updated:', imagesRef.current.length);
        
        // Update state and notify parent
        setImages(imagesRef.current);
        onImagesChange(imagesRef.current);
      },
      (errorMessage: string) => {
        console.error('Upload error:', errorMessage);
        setError(errorMessage);
        setUploading(false);
      },
      true, // Enable multiple file selection
      'youths4change/projects', // Folder path
      undefined, // No custom options
      () => {
        // Widget closed, all uploads complete
        console.log('Widget closed, final count:', imagesRef.current.length);
        setImages(imagesRef.current);
        onImagesChange(imagesRef.current);
        setUploading(false);
      }
    );
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, caption } : img
    );
    imagesRef.current = updatedImages;
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    imagesRef.current = updatedImages;
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleUpload}
        disabled={disabled || uploading || images.length >= maxImages}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images ({images.length}/{maxImages})
          </>
        )}
      </Button>

      {/* Images List */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No images uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Click the button above to upload images</p>
        </div>
      ) : (
        <div className="space-y-4">
          {images.map((image, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex gap-4">
                {/* Image Preview */}
                <div className="flex-shrink-0">
                  <img
                    src={getFullImageUrl(image.cloudinary_public_id)}
                    alt={`Upload ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>

                {/* Caption Input */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`caption-${index}`}>
                      Caption (Optional) - Image {index + 1}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <Textarea
                    id={`caption-${index}`}
                    placeholder="Add a description for this image..."
                    value={image.caption}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    disabled={disabled}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {images.length} image{images.length !== 1 ? 's' : ''} ready to upload
        </p>
      )}
    </div>
  );
}
