import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorSectionProps } from '@shared/schema';
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
      } else if (data.title.includes('Professioneller Werkzeugsatz Premium')) {
        setDetectionMethod('Product Title Detection');
      } else {
        setDetectionMethod('Title Detection');
      }
    }
  }, [data.title, data.rawHtml]);
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Edit Information</h3>
      
      <div className="space-y-6">
        {/* Company Section */}
        <div className="border-b pb-4">
          <h4 className="text-sm font-medium mb-3 text-gray-700">Company Details</h4>
          
          {/* Logo Editor */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-1">Company Logo</label>
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

          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-1">Company Name</label>
            <Input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md text-sm" 
              value={data.company_name || data.title || ''} 
              onChange={(e) => onUpdate({ company_name: e.target.value })}
              placeholder="Enter company name"
            />
            <p className="mt-1 text-xs text-gray-500">Your company or store name</p>
          </div>
        </div>
        
        {/* Product Section */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700">Product Details</h4>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-xs text-gray-600">Product Title</label>
              
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
              value={data.title || ''} 
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Enter product title"
            />
            <p className="mt-1 text-xs text-gray-500">The main product title displayed in the template</p>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Product Subtitle (Optional)</label>
            <Input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md text-sm" 
              value={data.subtitle || ''} 
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Enter product subtitle"
            />
            <p className="mt-1 text-xs text-gray-500">Additional description shown below the main title</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleEditor;
