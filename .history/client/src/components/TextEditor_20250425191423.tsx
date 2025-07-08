import React, { useState, useEffect } from 'react';
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

interface TextEditorProps {
  text: string;
  style: {
    color?: string;
    fontSize?: string;
    fontFamily?: string;
  };
  position: {
    x: number;
    y: number;
  };
  onSave: (text: string, style: any) => void;
  onClose: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
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
    'system-ui'
  ];

  const handleSave = () => {
    onSave(editedText, editedStyle);
    onClose();
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
          <Label htmlFor="text">Text</Label>
          <Input
            id="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={editedStyle.color || '#000000'}
            onChange={(e) => setEditedStyle({ ...editedStyle, color: e.target.value })}
          />
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

        <div className="flex justify-end space-x-2 pt-4">
          <button
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </Card>
  );
};

export default TextEditor;