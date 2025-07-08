import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

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

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Roboto',
  'Open Sans'
];

export default function StyleEditor({ style, position, onStyleChange, onClose }: StyleEditorProps) {
  return (
    <Card
      className="absolute z-50 p-4 bg-white shadow-lg min-w-[300px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Text Styling</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Font Family */}
        <div>
          <Label>Font Family</Label>
          <Select
            value={style.fontFamily}
            onValueChange={(value) => onStyleChange({ ...style, fontFamily: value })}
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </Select>
        </div>

        {/* Font Size */}
        <div>
          <Label>Font Size</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={parseInt(style.fontSize || '16')}
              onChange={(e) => onStyleChange({ ...style, fontSize: `${e.target.value}px` })}
            />
            <span className="self-center">px</span>
          </div>
        </div>

        {/* Color */}
        <div>
          <Label>Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={style.color || '#000000'}
              onChange={(e) => onStyleChange({ ...style, color: e.target.value })}
              className="w-12 h-8 p-1"
            />
            <Input
              type="text"
              value={style.color || '#000000'}
              onChange={(e) => onStyleChange({ ...style, color: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        {/* Line Height */}
        <div>
          <Label>Line Height</Label>
          <Input
            type="number"
            step="0.1"
            value={parseFloat(style.lineHeight || '1.5')}
            onChange={(e) => onStyleChange({ ...style, lineHeight: e.target.value })}
          />
        </div>

        {/* Letter Spacing */}
        <div>
          <Label>Letter Spacing</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              value={parseFloat(style.letterSpacing || '0')}
              onChange={(e) => onStyleChange({ ...style, letterSpacing: `${e.target.value}px` })}
            />
            <span className="self-center">px</span>
          </div>
        </div>

        {/* Text Alignment */}
        <div>
          <Label>Text Alignment</Label>
          <div className="flex gap-2">
            {['left', 'center', 'right', 'justify'].map((align) => (
              <Button
                key={align}
                variant={style.textAlign === align ? 'default' : 'outline'}
                onClick={() => onStyleChange({ ...style, textAlign: align })}
                className="flex-1"
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}