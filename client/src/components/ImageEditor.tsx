import React from 'react';
import { TemplateData, Image } from '../types';
import { Input } from '@/components/ui/input';
import { nanoid } from 'nanoid';
import FileUploader from './FileUploader';
import { X, Plus } from 'lucide-react';
import { EditorSectionProps } from '../types';

const ImageEditor: React.FC<EditorSectionProps> = ({ data, onUpdate }) => {
  const addNewImage = () => {
    const newImages = [...data.images, {
      id: nanoid(),
      url: ''
    }];
    onUpdate({ images: newImages });
  };

  const removeImage = (id: string) => {
    const newImages = data.images.filter(image => image.id !== id);
    onUpdate({ images: newImages });
  };

  const updateImageUrl = (id: string, url: string) => {
    const newImages = data.images.map(image => 
      image.id === id ? { ...image, url } : image
    );
    onUpdate({ images: newImages });
  };

  return (
    <div className="p-4" id="tab-images">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Product Gallery Images</h3>
      
      {data.images.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">No images yet. Add your first product image.</p>
          <button 
            onClick={addNewImage}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600"
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
                <span className="text-xs font-medium text-gray-500">Image #{index + 1}</span>
                <button 
                  className="text-gray-400 hover:text-gray-600"
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
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            className="mt-2 flex items-center text-sm text-primary font-medium hover:text-blue-700"
            onClick={addNewImage}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Another Image
          </button>
        </>
      )}
    </div>
  );
};

export default ImageEditor;
