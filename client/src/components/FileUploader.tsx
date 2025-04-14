import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ImageUploadResponse } from '../types';
import { UploadCloud } from 'lucide-react';

interface FileUploaderProps {
  onFileUploaded: (url: string) => void;
  className?: string;
  buttonLabel?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileUploaded, 
  className = "", 
  buttonLabel = "Upload New Image" 
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept image files
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: ImageUploadResponse = await response.json();
      onFileUploaded(data.url);
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Button 
        type="button" 
        variant="ghost" 
        onClick={triggerFileInput}
        disabled={isUploading}
        className="text-xs text-primary hover:text-blue-700 font-medium"
      >
        {isUploading ? (
          <>
            <UploadCloud className="h-4 w-4 mr-1 animate-spin" />
            Uploading...
          </>
        ) : (
          buttonLabel
        )}
      </Button>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploader;
