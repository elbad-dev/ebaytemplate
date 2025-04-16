import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  X, Rotate3d, Paintbrush, Scaling, Square, Circle, Triangle, 
  Image, Code, Copy, Layers, PenTool, Type
} from 'lucide-react';
import { SvgEditorProps, SvgPreset } from '../types';
import { useToast } from '@/hooks/use-toast';

// SVG Presets - simple common icons
const svgPresets: SvgPreset[] = [
  {
    id: 'truck',
    name: 'Truck',
    category: 'logistics',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v11"></path><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-2"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg>`
  },
  {
    id: 'star',
    name: 'Star',
    category: 'basic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
  },
  {
    id: 'heart',
    name: 'Heart',
    category: 'basic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
  },
  {
    id: 'shield',
    name: 'Shield',
    category: 'basic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
  },
  {
    id: 'check',
    name: 'Check',
    category: 'basic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
  },
  {
    id: 'tool',
    name: 'Tool',
    category: 'tools',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
  },
  {
    id: 'hammer',
    name: 'Hammer',
    category: 'tools',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"></path><path d="M17.64 15 22 10.64"></path><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"></path></svg>`
  }
];

const SvgEditor: React.FC<SvgEditorProps> = ({ svg, sectionId, onSave, onClose }) => {
  const { toast } = useToast();
  const [svgCode, setSvgCode] = useState(svg);
  const [color, setColor] = useState('#3498db');
  const [size, setSize] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [currentTab, setCurrentTab] = useState('visual');
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Parse and update existing SVG parameters
  useEffect(() => {
    if (svg) {
      try {
        // Extract color
        const colorMatch = svg.match(/stroke="([^"]+)"/);
        if (colorMatch && colorMatch[1] !== 'currentColor') {
          setColor(colorMatch[1]);
        }
        
        // Extract stroke width
        const strokeMatch = svg.match(/stroke-width="([^"]+)"/);
        if (strokeMatch) {
          setStrokeWidth(Number(strokeMatch[1]));
        }
      } catch (e) {
        console.error('Error parsing SVG:', e);
      }
    }
  }, [svg]);

  // Update preview when SVG code changes
  useEffect(() => {
    if (previewContainerRef.current) {
      previewContainerRef.current.innerHTML = svgCode;
      
      // Apply transformations to the SVG element
      const svgElement = previewContainerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = `${size}px`;
        svgElement.style.height = `${size}px`;
        svgElement.style.transform = `rotate(${rotation}deg)`;
        
        // Update color and stroke width for all stroked elements
        const strokedElements = svgElement.querySelectorAll('[stroke]');
        strokedElements.forEach((el) => {
          (el as SVGElement).setAttribute('stroke', color);
          (el as SVGElement).setAttribute('stroke-width', strokeWidth.toString());
        });
        
        // Also color filled elements that don't have a stroke
        const filledElements = svgElement.querySelectorAll('[fill]:not([stroke])');
        filledElements.forEach((el) => {
          if ((el as SVGElement).getAttribute('fill') !== 'none') {
            (el as SVGElement).setAttribute('fill', color);
          }
        });
      }
    }
  }, [svgCode, color, size, rotation, strokeWidth]);

  const handleApplyChanges = () => {
    // Parse the SVG to apply changes permanently
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgCode, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    if (svgElement) {
      // Convert style properties to attributes
      svgElement.removeAttribute('style');
      svgElement.setAttribute('width', `${size}`);
      svgElement.setAttribute('height', `${size}`);
      
      // Apply stroke colors
      const strokedElements = svgElement.querySelectorAll('[stroke]');
      strokedElements.forEach((el) => {
        (el as SVGElement).setAttribute('stroke', color);
        (el as SVGElement).setAttribute('stroke-width', strokeWidth.toString());
      });
      
      // Apply fill colors
      const filledElements = svgElement.querySelectorAll('[fill]:not([stroke])');
      filledElements.forEach((el) => {
        if ((el as SVGElement).getAttribute('fill') !== 'none') {
          (el as SVGElement).setAttribute('fill', color);
        }
      });
      
      // Convert back to string
      const serializer = new XMLSerializer();
      const updatedSvgCode = serializer.serializeToString(svgElement);
      setSvgCode(updatedSvgCode);
    }
  };

  const handlePresetClick = (preset: SvgPreset) => {
    setSvgCode(preset.svg);
    toast({
      title: 'Preset Applied',
      description: `${preset.name} icon has been applied`,
    });
  };

  const handleSave = () => {
    // Apply all changes before saving
    handleApplyChanges();
    onSave(svgCode, sectionId);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(svgCode);
    toast({
      title: 'Copied to Clipboard',
      description: 'SVG code has been copied to your clipboard',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Advanced SVG Editor</h2>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <Tabs defaultValue={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="visual" className="flex items-center gap-1">
              <Paintbrush className="w-4 h-4" />
              <span>Visual Editor</span>
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span>Presets</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              <span>Code Editor</span>
            </TabsTrigger>
          </TabsList>

          {/* Visual Editor */}
          <TabsContent value="visual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6 flex items-center justify-center">
                <div 
                  className="min-h-[150px] flex items-center justify-center" 
                  ref={previewContainerRef} 
                />
              </div>
              
              {/* Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="color" 
                      type="color" 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)} 
                      className="w-12 h-9 p-1"
                    />
                    <Input 
                      type="text" 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)} 
                      className="flex-1" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="size">Size ({size}px)</Label>
                    <Scaling className="w-4 h-4 text-gray-500" />
                  </div>
                  <Slider 
                    id="size"
                    min={20} 
                    max={200} 
                    step={1} 
                    value={[size]}
                    onValueChange={(value) => setSize(value[0])} 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="rotation">Rotation ({rotation}°)</Label>
                    <Rotate3d className="w-4 h-4 text-gray-500" />
                  </div>
                  <Slider 
                    id="rotation"
                    min={0} 
                    max={360} 
                    step={5} 
                    value={[rotation]} 
                    onValueChange={(value) => setRotation(value[0])} 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="strokeWidth">Stroke Width ({strokeWidth})</Label>
                    <PenTool className="w-4 h-4 text-gray-500" />
                  </div>
                  <Slider 
                    id="strokeWidth"
                    min={0.5} 
                    max={5} 
                    step={0.5} 
                    value={[strokeWidth]} 
                    onValueChange={(value) => setStrokeWidth(value[0])} 
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={handleApplyChanges}
                >
                  Apply Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Preset Icons */}
          <TabsContent value="presets" className="min-h-[300px]">
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                Select a preset icon to use as a starting point
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {svgPresets.map((preset) => (
                  <Card 
                    key={preset.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handlePresetClick(preset)}
                  >
                    <CardContent className="p-4 flex flex-col items-center gap-2">
                      <div className="h-16 w-16 flex items-center justify-center text-primary">
                        <div dangerouslySetInnerHTML={{ __html: preset.svg }} />
                      </div>
                      <div className="text-sm font-medium">{preset.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Code Editor */}
          <TabsContent value="code" className="space-y-4">
            <div className="flex justify-between mb-2">
              <Label htmlFor="svgCode">Edit SVG Code</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1 text-xs"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </Button>
            </div>
            <Textarea 
              id="svgCode"
              className="w-full h-[200px] p-3 border border-gray-300 rounded-md text-sm font-mono" 
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              placeholder="<svg>...</svg>"
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6 space-x-3">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SvgEditor;
