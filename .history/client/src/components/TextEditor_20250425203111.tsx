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

interface StyleEditorProps {
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
  onStyleChange: (style: any) => void;
  onClose: () => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({
  style,
  position,
  onStyleChange,
  onClose,
}) => {
  const [editedStyle, setEditedStyle] = useState(style);

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'system-ui'
  ];
  const alignments = ['left', 'center', 'right', 'justify'];

  const handleStyleChange = (property: string, value: string) => {
    const newStyle = { ...editedStyle, [property]: value };
    setEditedStyle(newStyle);
    onStyleChange(newStyle);
  };

  return (
    <Card className="fixed p-4 shadow-lg rounded-lg bg-white z-50"
          style={{
            left: position.x,
            top: position.y,
            minWidth: '300px'
          }}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="color">Text Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={editedStyle.color || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-12"
            />
            <Input
              type="text"
              value={editedStyle.color || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="fontSize">Font Size</Label>
          <Select
            value={editedStyle.fontSize}
            onValueChange={(value) => handleStyleChange('fontSize', value)}
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
          <Label htmlFor="fontFamily">Font Family</Label>
          <Select
            value={editedStyle.fontFamily}
            onValueChange={(value) => handleStyleChange('fontFamily', value)}
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
          <Label htmlFor="lineHeight">Line Height</Label>
          <Input
            id="lineHeight"
            type="number"
            min="1"
            max="3"
            step="0.1"
            value={editedStyle.lineHeight?.replace('em', '') || '1.5'}
            onChange={(e) => handleStyleChange('lineHeight', `${e.target.value}em`)}
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
            value={editedStyle.letterSpacing?.replace('px', '') || '0'}
            onChange={(e) => handleStyleChange('letterSpacing', `${e.target.value}px`)}
          />
        </div>

        <div>
          <Label htmlFor="textAlign">Text Alignment</Label>
          <Select
            value={editedStyle.textAlign}
            onValueChange={(value) => handleStyleChange('textAlign', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select alignment" />
            </SelectTrigger>
            <SelectContent>
              {alignments.map((align) => (
                <SelectItem key={align} value={align}>
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Card>
  );
};

export default StyleEditor;