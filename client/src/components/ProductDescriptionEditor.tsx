import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorSectionProps } from '../types';

const ProductDescriptionEditor: React.FC<EditorSectionProps> = ({ data, onUpdate }) => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Product Description</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Title Above Price</label>
          <Input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md text-sm" 
            value={data.title} 
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter product title"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Product Price</label>
          <div className="flex items-center space-x-2">
            <Input 
              type="text" 
              className="w-24 p-2 border border-gray-300 rounded-md text-sm" 
              value={data.price || ''} 
              onChange={(e) => onUpdate({ price: e.target.value })}
              placeholder="0.00"
            />
            <Select 
              defaultValue={data.currency || 'EUR'} 
              onValueChange={(value) => onUpdate({ currency: value })}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="EUR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Product Description</label>
          <Textarea 
            className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[200px]" 
            value={data.description || ''} 
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Enter product description"
          />
          <p className="mt-1 text-xs text-gray-500">
            The product description will be displayed in the "Produktbeschreibung" section
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDescriptionEditor;