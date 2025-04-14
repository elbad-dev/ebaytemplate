import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorSectionProps } from '../types';

const TitleEditor: React.FC<EditorSectionProps> = ({ data, onUpdate }) => {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Product Title</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Main Title</label>
          <Input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md text-sm" 
            value={data.title} 
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter product title"
          />
          <p className="mt-1 text-xs text-gray-500">This updates both the page title and main heading</p>
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Subtitle (Optional)</label>
          <Input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md text-sm" 
            value={data.subtitle || ''} 
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Enter product subtitle"
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
      </div>
    </div>
  );
};

export default TitleEditor;
