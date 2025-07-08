import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TextEditorProps {
  text: string;
  style: {
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textAlign?: string;
  };
  position: {
    x: number;
    y: number;
  };
  onSave: (text: string, style: any) => void;
  onClose: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  style,
  position,
  onSave,
  onClose,
}) => {
  const [editedText, setEditedText] = useState(text);
  const [editedStyle, setEditedStyle] = useState(style);

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Roboto',
    'Open Sans',
    'system-ui'
  ];
  const alignments = ['left', 'center', 'right', 'justify'];

  const handleSave = () => {
    onSave(editedText, editedStyle);
    onClose();
  };

  return (
    <Card 
      className="fixed p-4 shadow-lg rounded-lg bg-white z-50"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '300px',
        maxWidth: '400px'
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Edit Text</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="text">Text Content</Label>
          <Input
            id="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="fontFamily">Font Family</Label>
          <Select
            value={editedStyle.fontFamily}
            onValueChange={(value) => setEditedStyle({ ...editedStyle, fontFamily: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fontSize">Font Size</Label>
          <Select
            value={editedStyle.fontSize}
            onValueChange={(value) => setEditedStyle({ ...editedStyle, fontSize: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={editedStyle.color || '#000000'}
              onChange={(e) => setEditedStyle({ ...editedStyle, color: e.target.value })}
              className="w-12"
            />
            <Input
              type="text"
              value={editedStyle.color || '#000000'}
              onChange={(e) => setEditedStyle({ ...editedStyle, color: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="lineHeight">Line Height</Label>
          <Input
            id="lineHeight"
            type="number"
            min="1"
            max="3"
            step="0.1"
            value={parseFloat(editedStyle.lineHeight?.replace('em', '') || '1.5')}
            onChange={(e) => setEditedStyle({ ...editedStyle, lineHeight: `${e.target.value}em` })}
          />
        </div>

        <div>
          <Label htmlFor="letterSpacing">Letter Spacing</Label>
          <Input
            id="letterSpacing"
            type="number"
            min="-2"
            max="10"
            step="0.1"
            value={parseFloat(editedStyle.letterSpacing?.replace('px', '') || '0')}
            onChange={(e) => setEditedStyle({ ...editedStyle, letterSpacing: `${e.target.value}px` })}
          />
        </div>

        <div>
          <Label htmlFor="textAlign">Text Alignment</Label>
          <div className="grid grid-cols-4 gap-2">
            {alignments.map((align) => (
              <Button
                key={align}
                type="button"
                variant={editedStyle.textAlign === align ? 'default' : 'outline'}
                onClick={() => setEditedStyle({ ...editedStyle, textAlign: align })}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
};