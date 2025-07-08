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

  if (!isVisible) return null;  return (
    <div className="editor-controls w-full">
      <div className="editor-controls-group">
        <select 
          className="editor-select"
          onChange={(e) => handleFontFamilyChange(e.target.value)}
        >
          <option value="">Font</option>
          {fontFamilies.map(font => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>

        <select
          className="editor-select"
          onChange={(e) => handleFontSizeChange(e.target.value)}
        >
          <option value="">Size</option>
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      
      <div className="editor-controls-group">
        <button
          onClick={() => onFormatText('bold')}
          className="editor-button"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => onFormatText('italic')}
          className="editor-button"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => onFormatText('underline')}
          className="editor-button"
        >
          <Underline className="h-4 w-4" />
        </button>
      </div>      <div className="editor-controls-group">
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="editor-button"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <div className="editor-controls-group">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-gray-500" />
          <input
            type="color"
            className="editor-color-picker"
            onChange={(e) => onFormatText('foreColor', e.target.value)}
            title="Text Color"
          />
        </div>
      </div><div className="editor-actions">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="editor-action-button undo"
        >
          <Undo className="h-4 w-4 mr-1" />
          Undo
        </button>
        <button
          onClick={onSave}
          className="editor-action-button save"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="editor-action-button cancel"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </button>
      </div>
    </div>
  );
}
