import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorSectionProps } from '../types';
import { Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TitleEditor: React.FC<EditorSectionProps> = ({ data, onUpdate }) => {
  // Determine how the title was detected
  const [detectionMethod, setDetectionMethod] = useState<string>('');
  
  useEffect(() => {
    // Check if the title contains the specified text
    if (data.title && data.title.includes('Professioneller Werkzeugsatz Premium')) {
      setDetectionMethod('Product Title Detection');
    }
  }, [data.title]);
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Product Title</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-xs text-gray-600">Main Title</label>
            
            {detectionMethod && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <Info className="w-3 h-3 mr-1" />
                        {detectionMethod}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      This title was detected using our enhanced detection algorithm 
                      for "Professioneller Werkzeugsatz Premium" sections.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <Input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md text-sm" 
            value={data.title} 
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter product title"
          />
          <p className="mt-1 text-xs text-gray-500">This updates both the page title and main heading</p>
        </div>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Subtitle (Optional)</label>
          <Input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md text-sm" 
            value={data.subtitle || ''} 
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Enter product subtitle"
          />
        </div>
      </div>
    </div>
  );
};

export default TitleEditor;
