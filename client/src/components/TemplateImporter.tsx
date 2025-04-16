import React, { useState } from 'react';
import { parseTemplate } from '../utils/templateParser';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { TemplateData } from '@/types';

interface TemplateImporterProps {
  onTemplateImported: (templateData: TemplateData) => void;
}

export default function TemplateImporter({ onTemplateImported }: TemplateImporterProps) {
  const { toast } = useToast();
  const [htmlContent, setHtmlContent] = useState<string>('');

  const handleImport = () => {
    if (!htmlContent.trim()) {
      toast({
        title: 'No HTML provided',
        description: 'Please paste HTML code into the text area',
        variant: 'destructive'
      });
      return;
    }

    try {
      const templateData = parseTemplate(htmlContent);
      onTemplateImported(templateData);
      toast({
        title: 'Template imported',
        description: 'You can now edit the template content',
      });
    } catch (error) {
      console.error('Error parsing template:', error);
      toast({
        title: 'Error parsing template',
        description: 'There was a problem with the HTML code provided',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-dashed mb-4">
      <h3 className="text-xl font-semibold mb-4 text-center">Import Template</h3>
      <div className="flex flex-col space-y-4">
        <div>
          <label htmlFor="htmlCode" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your HTML template code here:
          </label>
          <textarea
            id="htmlCode"
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="<!-- Paste your HTML code here -->"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleImport}
            className="px-6 bg-primary text-white"
          >
            Import Template
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 px-2 text-gray-500">OR</span>
          </div>
        </div>
        
        <div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.html';
              input.onchange = async (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files && target.files[0]) {
                  const file = target.files[0];
                  const reader = new FileReader();
                  
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      setHtmlContent(event.target.result as string);
                    }
                  };
                  
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
          >
            Upload HTML File
          </Button>
        </div>
      </div>
    </div>
  );
}