import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorSectionProps } from '../types';
import { Info, ImageIcon } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FileUploader from './FileUploader';

const TitleEditor: React.FC<EditorSectionProps> = ({ data, onUpdate }) => {
  // Determine how the title was detected
  const [detectionMethod, setDetectionMethod] = useState<string>('');
  
  useEffect(() => {
    // Check if we found a title in the template
    if (data.title) {
      if (data.rawHtml?.includes('product-info') && data.rawHtml?.includes('<h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">')) {
        setDetectionMethod('Product Info Section');
      } else if (data.rawHtml?.includes('brand-text') && data.rawHtml?.includes('<h1>')) {
        setDetectionMethod('Brand Header Section');
      } else if (data.title.includes('Professioneller Werkzeugsatz Premium') || data.title.includes('HAUS WERKZEUGE')) {
        setDetectionMethod('Product Title Detection');
      } else {
        setDetectionMethod('Title Detection');
      }
    }
  }, [data.title, data.rawHtml]);
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Company name</h3>
      
      <div className="space-y-4">
        {/* Logo Editor */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Logo</label>
          <div className="flex items-center space-x-2 mb-2">
            {data.logo ? (
              <div className="mb-2 flex items-center">
                <div className="border border-gray-200 rounded-md p-2 bg-white max-w-[180px] mr-2">
                  {data.logo.includes('<svg') ? (
                    <div dangerouslySetInnerHTML={{ __html: data.logo }} />
                  ) : (
                    <img src={data.logo} alt="Logo" className="h-10" />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdate({ logo: '' })}
                  className="text-xs"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm">No logo set</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <FileUploader
              onFileUploaded={(url) => onUpdate({ logo: url })}
              buttonLabel="Upload Logo"
              className="text-xs"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Upload a new logo to replace the current one</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-xs text-gray-600">Company name</label>
            
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
                      {detectionMethod === 'Product Info Section' 
                        ? 'This title was detected in the product-info section of your template.' 
                        : detectionMethod === 'Brand Header Section'
                        ? 'This title was detected in the brand header section of your template.'
                        : 'This title was detected using our enhanced detection algorithm.'}
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
            placeholder="Enter company name"
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
            placeholder="Enter company subtitle"
          />
        </div>
      </div>
    </div>
  );
};

export default TitleEditor;
