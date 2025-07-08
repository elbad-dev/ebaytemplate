import React, { useState } from 'react';
import { EditorSectionProps, ProductTag } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const ProductDetailsEditor: React.FC<EditorSectionProps> = ({ data, onUpdate }) => {
  // Tags state for editing
  const [tagInput, setTagInput] = useState('');

  // Add a new tag
  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTag: ProductTag = { id: Math.random().toString(36).slice(2), label: tagInput.trim() };
    onUpdate({ tags: [...(data.tags || []), newTag] });
    setTagInput('');
  };

  // Remove a tag
  const removeTag = (id: string) => {
    onUpdate({ tags: (data.tags || []).filter(tag => tag.id !== id) });
  };

  // Update a tag label
  const updateTag = (id: string, label: string) => {
    onUpdate({ tags: (data.tags || []).map(tag => tag.id === id ? { ...tag, label } : tag) });
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Product Details</h3>
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Product Title</label>
        <Input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={data.title || ''}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Enter product title"
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Tags (Badges)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(data.tags || []).map(tag => (
            <span key={tag.id} className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
              <Input
                type="text"
                value={tag.label}
                onChange={e => updateTag(tag.id, e.target.value)}
                className="w-auto text-xs bg-transparent border-none focus:ring-0 focus:outline-none px-0"
                style={{ minWidth: 40 }}
              />
              <button type="button" className="ml-1 text-blue-400 hover:text-red-500" onClick={() => removeTag(tag.id)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="Add tag"
            className="text-xs"
            onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
          />
          <Button size="sm" type="button" onClick={addTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Price</label>
        <Input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={data.price || ''}
          onChange={e => onUpdate({ price: e.target.value })}
          placeholder="Enter price"
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Price Note</label>
        <Input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={data.priceNote || ''}
          onChange={e => onUpdate({ priceNote: e.target.value })}
          placeholder="e.g. inkl. MwSt. zzgl. Versand"
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Cart Button Text</label>
        <Input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={data.cartButtonText || ''}
          onChange={e => onUpdate({ cartButtonText: e.target.value })}
          placeholder="e.g. In den Warenkorb"
        />
      </div>
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Buy Button Text</label>
        <Input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={data.buyButtonText || ''}
          onChange={e => onUpdate({ buyButtonText: e.target.value })}
          placeholder="e.g. Sofort Kaufen"
        />
      </div>
    </div>
  );
};

export default ProductDetailsEditor;
