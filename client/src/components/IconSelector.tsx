import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Business category SVG icons
const businessIcons = [
  {
    id: 'shipping',
    name: 'Shipping',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15h14"/><path d="M5 8a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"/><circle cx="8" cy="18" r="2"/><path d="M10 18h4"/><circle cx="16" cy="18" r="2"/></svg>`
  },
  {
    id: 'returns',
    name: 'Returns',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`
  },
  {
    id: 'support',
    name: 'Support',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 3h-3a1.5 1.5 0 0 0-1.5 1.5"/><path d="M19.5 3h-3a1.5 1.5 0 0 1-1.5 1.5"/><path d="M10.5 20.5v-1a1.5 1.5 0 0 1 1.5-1.5h0a1.5 1.5 0 0 1 1.5 1.5v1"/><path d="M7.5 8v1a1.5 1.5 0 0 1-1.5 1.5h-1"/><path d="M19 10.5h-1a1.5 1.5 0 0 1-1.5-1.5V8"/><path d="M14 21h-4a2 2 0 0 1-2-2v-3a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v3a2 2 0 0 1-2 2z"/><path d="M12 10V5"/></svg>`
  },
  {
    id: 'warranty',
    name: 'Warranty',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`
  }
];

// Product category SVG icons
const productIcons = [
  {
    id: 'quality',
    name: 'Quality',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h7l-6 4 3 7-7-4-7 4 3-7-6-4h7l3-7z"/></svg>`
  },
  {
    id: 'certification',
    name: 'Certification',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>`
  },
  {
    id: 'tools',
    name: 'Tools',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
  },
  {
    id: 'features',
    name: 'Features',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
  }
];

// Company category SVG icons
const companyIcons = [
  {
    id: 'globe',
    name: 'Global',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>`
  },
  {
    id: 'award',
    name: 'Award',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`
  },
  {
    id: 'users',
    name: 'Team',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    id: 'history',
    name: 'History',
    svg: (color: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  }
];

interface IconSelectorProps {
  onIconSelect: (svg: string) => void;
  onColorChange: (color: string) => void;
  currentIcon?: string;
  currentColor?: string;
}

export default function IconSelector({ onIconSelect, onColorChange, currentIcon, currentColor = "#3498db" }: IconSelectorProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  
  // Predefined colors
  const colorOptions = [
    "#3498db", // Blue
    "#e74c3c", // Red
    "#2ecc71", // Green
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#1abc9c", // Teal
    "#34495e", // Dark Blue
    "#7f8c8d"  // Gray
  ];
  
  // Handle color change
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };
  
  // Handle icon selection
  const handleIconSelect = (svgFunction: (color: string) => string) => {
    onIconSelect(svgFunction(selectedColor));
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Change Icon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Icon and Color</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-5">
          {/* Color picker */}
          <div>
            <h3 className="text-sm font-medium mb-2">Choose a color</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border ${selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input 
                type="color" 
                value={selectedColor} 
                onChange={(e) => handleColorChange(e.target.value)} 
                className="w-10 h-10 p-1" 
              />
              <Input 
                type="text" 
                value={selectedColor} 
                onChange={(e) => handleColorChange(e.target.value)} 
                className="w-32" 
                placeholder="#000000" 
              />
            </div>
          </div>
          
          {/* Icon categories */}
          <Tabs defaultValue="business">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>
            
            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {businessIcons.map((icon) => (
                  <div 
                    key={icon.id}
                    className="flex flex-col items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => handleIconSelect(icon.svg)}
                  >
                    <div 
                      className="w-12 h-12 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: icon.svg(selectedColor) }}
                    />
                    <span className="text-xs text-center">{icon.name}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="product" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {productIcons.map((icon) => (
                  <div 
                    key={icon.id}
                    className="flex flex-col items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => handleIconSelect(icon.svg)}
                  >
                    <div 
                      className="w-12 h-12 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: icon.svg(selectedColor) }}
                    />
                    <span className="text-xs text-center">{icon.name}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {companyIcons.map((icon) => (
                  <div 
                    key={icon.id}
                    className="flex flex-col items-center gap-2 p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => handleIconSelect(icon.svg)}
                  >
                    <div 
                      className="w-12 h-12 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: icon.svg(selectedColor) }}
                    />
                    <span className="text-xs text-center">{icon.name}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}