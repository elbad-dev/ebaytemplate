import React from 'react';
import { TemplateData, Image } from '../types';
import { Input } from '@/components/ui/input';
import { nanoid } from 'nanoid';
import FileUploader from './FileUploader';
import { X, Plus, Image as ImageIcon } from 'lucide-react';
import { EditorSectionProps } from '../types';
import { useToast } from '@/hooks/use-toast';

const ImageEditor: React.FC<EditorSectionProps> = ({ data, onUpdate }) => {
  const { toast } = useToast();
  
  const addNewImage = () => {
    // Check if we have less than 15 images (3 sets of 5)
    if (data.images.length >= 15) {
      toast({
        title: 'Maximum images reached',
        description: 'You can have a maximum of 15 images (3 sets of 5)',
        variant: 'destructive'
      });
      return;
    }

    const newImages = [...data.images, {
      id: nanoid(),
      url: ''
    }];
    onUpdate({ images: newImages });
    
    // Show which set this image will appear in
    const setNumber = Math.floor((newImages.length - 1) / 5) + 1;
    toast({
      title: 'Image added',
      description: `Added to set ${setNumber}`
    });
  };

  const removeImage = (id: string) => {
    const newImages = data.images.filter(image => image.id !== id);
    onUpdate({ images: newImages });
    
    // Update user about gallery organization
    if (newImages.length > 0) {
      const setCount = Math.ceil(newImages.length / 5);
      toast({
        title: 'Image removed',
        description: `Gallery now has ${setCount} set${setCount > 1 ? 's' : ''}`
      });
    }
  };

  const updateImageUrl = (id: string, url: string) => {
    const newImages = data.images.map(image => 
      image.id === id ? { ...image, url } : image
    );
    onUpdate({ images: newImages });
  };

  const getCurrentSet = (index: number) => Math.floor(index / 5) + 1;

  return (
    <div className="p-4" id="tab-images">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Product Gallery Images</h3>
        {data.images.length > 0 && (
          <span className="text-xs text-gray-500">
            {Math.ceil(data.images.length / 5)} set{Math.ceil(data.images.length / 5) > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {data.images.length === 0 ? (
        <div className="p-6 text-center">
          <ImageIcon className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500 mb-4">No images yet. Add your first product image.</p>
          <button 
            onClick={addNewImage}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add First Image
          </button>
        </div>
      ) : (
        <>
          {data.images.map((image, index) => (
            <div key={image.id} className="mb-4 border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    Image #{index + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    (Set {getCurrentSet(index)})
                  </span>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => removeImage(image.id)}
                >
                  <span className="sr-only">Remove</span>
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex space-x-3">
                <div className="w-20 h-20 bg-white border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                  {image.url ? (
                    <img 
                      className="object-contain max-w-full max-h-full" 
                      src={image.url} 
                      alt={`Product image ${index + 1}`} 
                    />
                  ) : (
                    <div className="text-gray-300 text-xs text-center">
                      No image
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Image URL</label>
                    <Input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                      value={image.url} 
                      onChange={(e) => updateImageUrl(image.id, e.target.value)}
                      placeholder="Enter image URL"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <FileUploader
                      onFileUploaded={(url) => updateImageUrl(image.id, url)}
                      buttonLabel="Upload Image"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {data.images.length < 15 && (
            <button 
              className="mt-2 flex items-center text-sm text-primary font-medium hover:text-blue-700 transition-colors"
              onClick={addNewImage}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Another Image {data.images.length > 0 && `(${data.images.length}/15)`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ImageEditor;
