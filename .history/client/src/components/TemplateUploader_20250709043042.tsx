import React, { useState, useRef } from 'react';
import { UploadState, TemplateData }         });

      setCurrentHtmlContent(htmlContent);

      // Parse the template HTML with error handling
      let templateData: TemplateData;
      try {
        templateData = parseTemplate(htmlContent);
        console.log('Template parsed successfully:', templateData);
      } catch (parseError) {
        console.error('Failed to parse template:', parseError);
        // Create a basic template data structure if parsing fails
        templateData = {
          title: 'Imported Template',
          company_name: '',
          subtitle: '',
          price: '',
          currency: 'EUR',
          description: '',
          images: [],
          specs: [],
          companyInfo: [],
          rawHtml: htmlContent
        };
      }
      
      // Add the raw HTML to the template data
      templateData.rawHtml = htmlContent;
      
      // Store the template data for possible manual editing
      setCurrentTemplateData(templateData);es';
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

    // Enhanced file validation - Security measures
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 5MB');
      setUploadState('error');
      return;
    }

    // Only accept HTML files - be more lenient with MIME types
    const isHtmlFile = file.type === 'text/html' || 
                       file.type === '' || // Some browsers don't set MIME type
                       file.name.toLowerCase().endsWith('.html') ||
                       file.name.toLowerCase().endsWith('.htm');
    
    if (!isHtmlFile) {
      setUploadError('Please upload an HTML file (.html or .htm)');
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
            console.log('FileReader onload triggered');
            if (e.target?.result && typeof e.target.result === 'string') {
              console.log('File content length:', e.target.result.length);
              resolve(e.target.result);
            } else {
              console.error('FileReader result is not a string:', e.target?.result);
              reject(new Error('Failed to read file content'));
            }
          };
          reader.onerror = (e) => {
            console.error('FileReader error:', e);
            reject(new Error('Failed to read file'));
          };
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
      console.error('File details:', {
        name: file?.name,
        type: file?.type,
        size: file?.size,
        isDemoMode: isDemoMode()
      });
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

      // Parse the template HTML with error handling
      let templateData: TemplateData;
      try {
        templateData = parseTemplate(htmlContent);
        console.log('Template parsed successfully:', templateData);
      } catch (parseError) {
        console.error('Failed to parse template:', parseError);
        // Create a basic template data structure if parsing fails
        templateData = {
          title: 'Pasted Template',
          company_name: '',
          subtitle: '',
          price: '',
          currency: 'EUR',
          description: '',
          images: [],
          specs: [],
          companyInfo: [],
          rawHtml: htmlContent
        };
      }
      
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
          {/* Demo mode banner */}
          {isDemoMode() && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> Template files are processed entirely in your browser - no server upload required!
              </p>
            </div>
          )}
          
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