import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditorSectionProps } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

interface ColorCustomizerProps extends EditorSectionProps {
  onResetColors: () => void;
}

export default function ColorCustomizer({ data, onUpdate, onResetColors }: ColorCustomizerProps) {
  // Color change handler
  const handleColorChange = (colorType: string, value: string) => {
    const updates: any = {};
    updates[colorType] = value;
    onUpdate(updates);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Color Settings</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onResetColors}
          className="flex items-center gap-1"
        >
          <RotateCw className="h-4 w-4" />
          Reset colors
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary color */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="colorPrimary">Primary Color</Label>
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.colorPrimary || '#3498db' }}
            />
          </div>
          <div className="flex gap-2">
            <Input
              id="colorPrimary"
              type="color"
              value={data.colorPrimary || '#3498db'}
              onChange={(e) => handleColorChange('colorPrimary', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={data.colorPrimary || '#3498db'}
              onChange={(e) => handleColorChange('colorPrimary', e.target.value)}
              placeholder="#3498db"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used for buttons, links, and primary actions
          </p>
        </div>

        {/* Secondary color */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="colorSecondary">Secondary Color</Label>
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.colorSecondary || '#2c3e50' }}
            />
          </div>
          <div className="flex gap-2">
            <Input
              id="colorSecondary"
              type="color"
              value={data.colorSecondary || '#2c3e50'}
              onChange={(e) => handleColorChange('colorSecondary', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={data.colorSecondary || '#2c3e50'}
              onChange={(e) => handleColorChange('colorSecondary', e.target.value)}
              placeholder="#2c3e50"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used for headings and important text
          </p>
        </div>

        {/* Accent color */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="colorAccent">Accent Color</Label>
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.colorAccent || '#e74c3c' }}
            />
          </div>
          <div className="flex gap-2">
            <Input
              id="colorAccent"
              type="color"
              value={data.colorAccent || '#e74c3c'}
              onChange={(e) => handleColorChange('colorAccent', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={data.colorAccent || '#e74c3c'}
              onChange={(e) => handleColorChange('colorAccent', e.target.value)}
              placeholder="#e74c3c"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used for price, calls to action, and emphasis
          </p>
        </div>

        {/* Background color */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="colorBackground">Background Color</Label>
            <div 
              className="w-4 h-4 rounded-full border border-gray-200" 
              style={{ backgroundColor: data.colorBackground || '#ffffff' }}
            />
          </div>
          <div className="flex gap-2">
            <Input
              id="colorBackground"
              type="color"
              value={data.colorBackground || '#ffffff'}
              onChange={(e) => handleColorChange('colorBackground', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={data.colorBackground || '#ffffff'}
              onChange={(e) => handleColorChange('colorBackground', e.target.value)}
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Main background color of the template
          </p>
        </div>

        {/* Text color */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="colorText">Text Color</Label>
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.colorText || '#333333' }}
            />
          </div>
          <div className="flex gap-2">
            <Input
              id="colorText"
              type="color"
              value={data.colorText || '#333333'}
              onChange={(e) => handleColorChange('colorText', e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={data.colorText || '#333333'}
              onChange={(e) => handleColorChange('colorText', e.target.value)}
              placeholder="#333333"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Main text color used throughout the template
          </p>
        </div>
      </div>

      <div className="p-4 rounded-md bg-muted mt-6">
        <h3 className="font-semibold mb-2">Color Preview</h3>
        <div className="flex flex-wrap gap-3">
          <div
            className="w-16 h-16 rounded flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: data.colorPrimary || '#3498db' }}
          >
            Primary
          </div>
          <div
            className="w-16 h-16 rounded flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: data.colorSecondary || '#2c3e50' }}
          >
            Secondary
          </div>
          <div
            className="w-16 h-16 rounded flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: data.colorAccent || '#e74c3c' }}
          >
            Accent
          </div>
          <div
            className="w-16 h-16 rounded flex items-center justify-center text-xs font-semibold border"
            style={{ 
              backgroundColor: data.colorBackground || '#ffffff',
              color: data.colorText || '#333333'
            }}
          >
            Background
          </div>
          <div
            className="w-16 h-16 rounded flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: data.colorText || '#333333' }}
          >
            Text
          </div>
        </div>
      </div>
    </div>
  );
}