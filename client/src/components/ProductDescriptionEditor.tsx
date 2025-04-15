import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EditorSectionProps } from '@/types';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ProductDescriptionEditor: React.FC<EditorSectionProps> = ({ 
  data, 
  onUpdate 
}) => {
  const [title, setTitle] = useState(data.title || '');
  const [price, setPrice] = useState(data.price || '');
  const [currency, setCurrency] = useState(data.currency || 'EUR');
  const [description, setDescription] = useState(data.description || '');
  const [detectingDescription, setDetectingDescription] = useState(false);
  const [detectingTitle, setDetectingTitle] = useState(false);
  const contentEditableRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update local state when data changes
    setTitle(data.title || '');
    setPrice(data.price || '');
    setCurrency(data.currency || 'EUR');
    setDescription(data.description || '');
    
    // Update the contentEditable div with the description HTML
    if (contentEditableRef.current && data.description) {
      contentEditableRef.current.innerHTML = data.description;
    }
  }, [data]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    onUpdate({ price: newPrice });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    onUpdate({ currency: value });
  };

  // Handle input in the contentEditable div
  const handleDescriptionChange = () => {
    if (contentEditableRef.current) {
      const newDescription = contentEditableRef.current.innerHTML;
      setDescription(newDescription);
      onUpdate({ description: newDescription });
    }
  };

  const handleDetectTitle = () => {
    if (data.rawHtml) {
      setDetectingTitle(true);
      
      // Look for title in the template
      if (data.title) {
        setTitle(data.title);
      }
      
      setTimeout(() => {
        setDetectingTitle(false);
      }, 1000);
    }
  };

  const handleDetectDescription = () => {
    if (data.rawHtml) {
      setDetectingDescription(true);
      
      // Use the existing description from parsed template data
      if (data.description) {
        setDescription(data.description);
        onUpdate({ description: data.description });
        
        // Update the contentEditable div with the detected HTML
        if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = data.description;
        }
      }
      
      setTimeout(() => {
        setDetectingDescription(false);
      }, 1000);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Product Information</h3>
            <p className="text-sm text-gray-500">
              Edit the product title, description, price, and currency.
            </p>
          </div>

          {/* Product Title Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="productTitle">Product Title</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDetectTitle}
                disabled={!data.rawHtml || detectingTitle}
                className="relative"
              >
                {detectingTitle ? 'Detecting...' : 'Detect Title'}
                {detectingTitle && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                )}
              </Button>
            </div>
            <Input
              id="productTitle"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter product title (e.g. Professioneller Werkzeugsatz Premium)"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This title will appear above the price in your template.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price Input */}
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={price}
                onChange={handlePriceChange}
                placeholder="e.g. 199.99"
                className="max-w-xs"
              />
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={currency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger id="currency" className="max-w-xs">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Product Description</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDetectDescription}
                disabled={!data.rawHtml || detectingDescription}
                className="relative"
              >
                {detectingDescription ? 'Detecting...' : 'Detect Description'}
                {detectingDescription && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                )}
              </Button>
            </div>
            <div>
              <div 
                className="relative border rounded-md overflow-hidden"
              >
                {!description && (
                  <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                    Enter product description here...
                  </div>
                )}
                <div
                  ref={contentEditableRef}
                  id="description"
                  contentEditable
                  onInput={handleDescriptionChange}
                  onBlur={handleDescriptionChange}
                  className="w-full p-3 min-h-[200px] max-h-[400px] overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    color: '#333'
                  }}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This description will be shown in the "Produktbeschreibung" section of your template.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDescriptionEditor;