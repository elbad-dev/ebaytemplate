import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Undo,
  Redo,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditorToolbarProps {
  isVisible: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onCancel: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFormatText: (command: string, value?: string) => void;
}

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Verdana', label: 'Verdana' }
];

const fontSizes = [
  '8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'
];

export function InlineEditorToolbar({
  isVisible,
  onUndo,
  onRedo,
  onSave,
  onCancel,
  canUndo,
  canRedo,
  onFormatText
}: InlineEditorToolbarProps) {
  const handleFontFamilyChange = useCallback((value: string) => {
    onFormatText('fontName', value);
  }, [onFormatText]);

  const handleFontSizeChange = useCallback((value: string) => {
    onFormatText('fontSize', value);
  }, [onFormatText]);

  if (!isVisible) return null;
  return (
    <div className="editor-controls w-full">
      <select 
        className="h-8 rounded-md px-2 border border-gray-200 text-sm"
        onChange={(e) => handleFontFamilyChange(e.target.value)}
      >
        <option value="">Font</option>
        {fontFamilies.map(font => (
          <option key={font.value} value={font.value}>{font.label}</option>
        ))}
      </select>

      <select
        className="h-8 rounded-md px-2 border border-gray-200 text-sm w-20"
        onChange={(e) => handleFontSizeChange(e.target.value)}
      >
        <option value="">Size</option>
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>

      <div className="flex items-center gap-1 border-l border-r px-2 mx-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <input
        type="color"
        className="h-8 w-8 p-0 cursor-pointer"
        onChange={(e) => onFormatText('foreColor', e.target.value)}
      />

      <div className="flex items-center gap-1 border-l px-2 ml-1">
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          className="h-8 px-3"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 px-3"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
