import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const [description, setDescription] = useState(data.description || '');
  const [detectingDescription, setDetectingDescription] = useState(false);
  const contentEditableRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update local state when data changes
    setDescription(data.description || '');
    
    // Update the contentEditable div with the description HTML
    if (contentEditableRef.current && data.description) {
      contentEditableRef.current.innerHTML = data.description;
    }
  }, [data]);

  // Handle input in the contentEditable div
  const handleDescriptionChange = () => {
    if (contentEditableRef.current) {
      const newDescription = contentEditableRef.current.innerHTML;
      setDescription(newDescription);
      onUpdate({ description: newDescription });
    }
  };
  
  // Handle paste events to preserve formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text');
    
    if (document.queryCommandSupported('insertHTML')) {
      document.execCommand('insertHTML', false, text);
    } else {
      // Fallback for browsers that don't support insertHTML
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    // Ensure we capture the update
    if (contentEditableRef.current) {
      const newDescription = contentEditableRef.current.innerHTML;
      setDescription(newDescription);
      onUpdate({ description: newDescription });
    }
  };

  // Remove detect title function since we handle this in the Company Information section

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

  // Remove Product Title, Price, and Currency fields from the description editor
  // Only keep the description editing UI
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Product Description</h3>
            <p className="text-sm text-gray-500">
              Edit the product description below. This will be shown in the 'Produktbeschreibung' section of your template.
            </p>
          </div>

          {/* Title of Description Section */}
          <div className="space-y-2">
            <Label htmlFor="descTitle">Title of Description</Label>
            <Input
              id="descTitle"
              value={data.descriptionTitle || ''}
              onChange={e => onUpdate({ descriptionTitle: e.target.value })}
              placeholder="e.g. Produktbeschreibung"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This title will appear above the product description (e.g. 'Produktbeschreibung').
            </p>
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
                  onPaste={handlePaste}
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
              This description will be shown in the 'Produktbeschreibung' section of your template.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDescriptionEditor;