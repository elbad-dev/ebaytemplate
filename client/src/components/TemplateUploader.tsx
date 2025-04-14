import React, { useState, useRef } from 'react';
import { UploadState, TemplateData } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { parseTemplate } from '../utils/templateParser';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TemplateUploaderProps {
  onTemplateImport: (data: TemplateData) => void;
}

export default function TemplateUploader({ onTemplateImport }: TemplateUploaderProps) {
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file
      const response = await fetch('/api/upload/html', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload template');
      }

      const data = await response.json();
      const htmlContent = data.content;

      // Parse the template HTML
      const templateData = parseTemplate(htmlContent);
      
      // Add the raw HTML to the template data
      templateData.rawHtml = htmlContent;

      // Call the onTemplateImport callback
      onTemplateImport(templateData);

      setUploadState('success');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload template');
      setUploadState('error');
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

      // Parse the template HTML
      const templateData = parseTemplate(htmlContent);
      
      // Add the raw HTML to the template data
      templateData.rawHtml = htmlContent;

      // Call the onTemplateImport callback
      onTemplateImport(templateData);

      setUploadState('success');
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
  );
}