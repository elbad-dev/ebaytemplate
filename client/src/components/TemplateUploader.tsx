import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UploadState, TemplateData, FileUploadResponse } from '../types';
import { parseTemplate } from '../utils/templateParser';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud } from 'lucide-react';

interface TemplateUploaderProps {
  onTemplateImport: (data: TemplateData) => void;
}

const TemplateUploader: React.FC<TemplateUploaderProps> = ({ onTemplateImport }) => {
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadStatus, setUploadStatus] = useState('No file selected');
  const [htmlContent, setHtmlContent] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an HTML file',
        variant: 'destructive',
      });
      return;
    }

    setUploadState('uploading');
    setUploadStatus(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/html', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: FileUploadResponse = await response.json();
      setUploadState('success');
      setUploadStatus(`${file.name} uploaded successfully`);
      
      // Parse the HTML content
      const parsedTemplate = parseTemplate(data.content);
      onTemplateImport(parsedTemplate);
    } catch (error: any) {
      setUploadState('error');
      setUploadStatus(`Error: ${error.message}`);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleHtmlInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(event.target.value);
  };

  const handlePastedHtml = () => {
    if (!htmlContent.trim()) {
      toast({
        title: 'No HTML content',
        description: 'Please paste some HTML content',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Parse the HTML content
      const parsedTemplate = parseTemplate(htmlContent);
      onTemplateImport(parsedTemplate);
      
      toast({
        title: 'HTML imported',
        description: 'Template data has been extracted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-3">Import Template</h2>
        
        <Tabs defaultValue="file">
          <TabsList className="mb-4">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="paste">Paste HTML</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <div className="mb-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      HTML files only
                    </p>
                  </div>
                  <Input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".html,.htm" 
                    onChange={handleFileUpload} 
                  />
                </label>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {uploadStatus}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="paste">
            <div className="mb-4">
              <Textarea 
                className="w-full h-40 p-3 border border-gray-300 rounded-md text-sm" 
                placeholder="Paste your HTML template here..." 
                onChange={handleHtmlInput}
                value={htmlContent}
              />
              <Button 
                className="mt-2 w-full"
                onClick={handlePastedHtml}
              >
                Import HTML
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TemplateUploader;
