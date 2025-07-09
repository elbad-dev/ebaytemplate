import React, { useState, useRef } from 'react';
import { UploadState, TemplateData } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { parseTemplate } from '../utils/templateParser';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import TemplateSectionSelector from './TemplateSectionSelector';

// Helper function to detect if we're in demo mode (GitHub Pages)
const isDemoMode = () => {
  return window.location.hostname.includes('github.io') || 
         (process.env.NODE_ENV === 'production' && !window.location.hostname.includes('localhost'));
};

interface TemplateUploaderProps {
  onTemplateImport: (data: TemplateData) => void;
}

export default function TemplateUploader({ onTemplateImport }: TemplateUploaderProps) {
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [currentHtmlContent, setCurrentHtmlContent] = useState('');
  const [currentTemplateData, setCurrentTemplateData] = useState<TemplateData | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept HTML files
    if (file.type !== 'text/html') {
      setUploadError('Please upload an HTML file');
      setUploadState('error');
      return;
    }

    try {
      setUploadState('uploading');
      setUploadError('');

      let htmlContent: string;

      // Check if we're in demo mode (GitHub Pages)
      if (isDemoMode()) {
        // In demo mode, read the file content directly using FileReader
        htmlContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
              resolve(e.target.result);
            } else {
              reject(new Error('Failed to read file content'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      } else {
        // In full-stack mode, upload the file to the server
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/html', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload template');
        }

        const data = await response.json();
        htmlContent = data.content;
      }

      setCurrentHtmlContent(htmlContent);

      // Parse the template HTML
      const templateData = parseTemplate(htmlContent);
      
      // Add the raw HTML to the template data
      templateData.rawHtml = htmlContent;
      
      // Store the template data for possible manual editing
      setCurrentTemplateData(templateData);
      
      // Check if any essential sections are missing or incomplete
      const needsManualSelection = checkIfNeedsManualSelection(templateData);
      
      if (needsManualSelection) {
        // Show manual section selector
        toast({
          title: "Template sections might be incomplete",
          description: "Some template sections couldn't be automatically detected. Please select them manually.",
        });
        setShowManualSelector(true);
      } else {
        // Template is good to go, proceed
        // Call the onTemplateImport callback
        onTemplateImport(templateData);
        setUploadState('success');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload template');
      setUploadState('error');
    }
  };
  
  // Helper function to check if we need manual section selection
  const checkIfNeedsManualSelection = (templateData: TemplateData): boolean => {
    const missingTitle = !templateData.title || templateData.title === 'Product Title';
    const missingDescription = !templateData.description;
    const missingImages = !templateData.images || templateData.images.length === 0;
    const missingSpecs = !templateData.specs || templateData.specs.length === 0;
    
    // If any major component is missing
    return missingTitle || missingDescription || missingImages || missingSpecs;
  };
  
  // Handle template data updates from manual selector
  const handleManualSectionUpdate = (updates: Partial<TemplateData>) => {
    if (!currentTemplateData) return;
    
    setCurrentTemplateData(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };
  
  // Close manual selector and proceed with the template
  const handleManualSelectorClose = () => {
    setShowManualSelector(false);
    
    if (currentTemplateData) {
      onTemplateImport(currentTemplateData);
      setUploadState('success');
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check if HTML content is available in clipboard
    const htmlContent = clipboardData.getData('text/html') || clipboardData.getData('text');
    if (!htmlContent) {
      setUploadError('No HTML content found in clipboard');
      setUploadState('error');
      return;
    }

    try {
      setUploadState('uploading');
      setUploadError('');
      setCurrentHtmlContent(htmlContent);

      // Parse the template HTML
      const templateData = parseTemplate(htmlContent);
      
      // Add the raw HTML to the template data
      templateData.rawHtml = htmlContent;
      
      // Store the template data for possible manual editing
      setCurrentTemplateData(templateData);
      
      // Check if any essential sections are missing or incomplete
      const needsManualSelection = checkIfNeedsManualSelection(templateData);
      
      if (needsManualSelection) {
        // Show manual section selector
        toast({
          title: "Template sections might be incomplete",
          description: "Some template sections couldn't be automatically detected. Please select them manually.",
        });
        setShowManualSelector(true);
      } else {
        // Template is good to go, proceed
        // Call the onTemplateImport callback
        onTemplateImport(templateData);
        setUploadState('success');
      }
    } catch (error) {
      console.error('Paste error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to parse template');
      setUploadState('error');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center"
            onPaste={handlePaste}
            tabIndex={0}
          >
            <input 
              type="file" 
              accept=".html" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              className="hidden" 
            />
            
            <p className="text-sm text-gray-600 mb-4">
              Upload an HTML template or paste HTML content
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                onClick={triggerFileInput}
                disabled={uploadState === 'uploading'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
              >
                {uploadState === 'uploading' ? 'Uploading...' : 'Upload Template'}
              </Button>
              
              <Button 
                variant="outline"
                disabled={uploadState === 'uploading'}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition"
              >
                Paste HTML (Ctrl+V)
              </Button>
            </div>
            
            {uploadState === 'error' && (
              <p className="mt-3 text-sm text-red-600">
                {uploadError}
              </p>
            )}
            
            {uploadState === 'success' && (
              <p className="mt-3 text-sm text-green-600">
                Template uploaded successfully!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Manual Section Selector Dialog */}
      {showManualSelector && currentTemplateData && (
        <TemplateSectionSelector
          htmlContent={currentHtmlContent}
          templateData={currentTemplateData}
          onUpdate={handleManualSectionUpdate}
          onClose={handleManualSelectorClose}
        />
      )}
    </>
  );
}