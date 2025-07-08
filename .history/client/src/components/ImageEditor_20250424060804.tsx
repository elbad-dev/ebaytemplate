import React from 'react';
import { EditorSectionProps } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './FileUploader';

export default function ImageEditor({ data, onUpdate }: EditorSectionProps) {
  const { toast } = useToast();
  const MAX_IMAGES = 15;

  const handleImageUpload = async (url: string) => {
    if (data.images.length >= MAX_IMAGES) {
      toast({
        title: 'Maximum images reached',
        description: `You can only have up to ${MAX_IMAGES} images (${Math.ceil(MAX_IMAGES/5)} sets of 5)`,
        variant: 'destructive'
      });
      return;
    }

    const newImages = [...data.images];
    const newImgId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    newImages.push({ id: newImgId, url });
    onUpdate({ images: newImages });
    
    // Show which set this image will appear in
    const setNumber = Math.floor((newImages.length - 1) / 5) + 1;
    toast({
      title: 'Image added',
      description: `Added to set ${setNumber}`
    });
  };

  const removeImage = (id: string) => {
    const oldLength = data.images.length;
    const newImages = data.images.filter(image => image.id !== id);
    onUpdate({ images: newImages });
    
    // Update user about gallery organization
    if (newImages.length > 0) {
      const oldSets = Math.ceil(oldLength / 5);
      const newSets = Math.ceil(newImages.length / 5);
      if (oldSets !== newSets) {
        toast({
          title: 'Gallery updated',
          description: `Gallery now has ${newSets} set${newSets > 1 ? 's' : ''}`
        });
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Product Images</h3>
        <span className="text-sm text-gray-500">
          {data.images.length} / {MAX_IMAGES} images
        </span>
      </div>
      
      <FileUploader onFileUploaded={handleImageUpload} accept="image/*" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {data.images.map((image, index) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={image.url} 
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeImage(image.id)}
              >
                Remove
              </Button>
            </div>
            <span className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              Set {Math.floor(index / 5) + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
