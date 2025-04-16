import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  X 
} from 'lucide-react';
import { PreviewMode } from '@shared/schema';

interface PreviewPanelProps {
  html: string;
  previewMode: PreviewMode;
  onChangePreviewMode: (mode: PreviewMode) => void;
  onRefresh: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  html, 
  previewMode, 
  onChangePreviewMode,
  onRefresh
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const fullPreviewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    updateIframeContent();
    if (showFullPreview) {
      updateFullPreviewContent();
    }
  }, [html, showFullPreview]);

  const updateIframeContent = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html || getEmptyPreview());
        iframeDoc.close();
      }
    }
  };
  
  const updateFullPreviewContent = () => {
    if (fullPreviewRef.current) {
      const iframe = fullPreviewRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html || getEmptyPreview());
        iframeDoc.close();
      }
    }
  };

  const getEmptyPreview = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            color: #666;
            text-align: center;
          }
          .empty-state {
            max-width: 400px;
            padding: 2rem;
          }
          h3 {
            margin-bottom: 1rem;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="empty-state">
          <h3>No template to preview</h3>
          <p>Import an existing template or create one by adding content in the editor.</p>
        </div>
      </body>
      </html>
    `;
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'desktop':
        return '100%';
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
    }
  };

  return (
    <>
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="flex items-center space-x-3">
              <div className="flex border border-gray-300 rounded-md p-1">
                <button 
                  className={`device-button ${previewMode === 'desktop' ? 'device-button-active' : 'device-button-inactive'}`}
                  onClick={() => onChangePreviewMode('desktop')}
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button 
                  className={`device-button ${previewMode === 'tablet' ? 'device-button-active' : 'device-button-inactive'}`}
                  onClick={() => onChangePreviewMode('tablet')}
                >
                  <Tablet className="w-5 h-5" />
                </button>
                <button 
                  className={`device-button ${previewMode === 'mobile' ? 'device-button-active' : 'device-button-inactive'}`}
                  onClick={() => onChangePreviewMode('mobile')}
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>
              <Button
                variant="secondary"
                onClick={onRefresh}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-md flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFullPreview(true)}
                className="px-3 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-md flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Expand
              </Button>
            </div>
          </div>
          
          <CardContent className="flex-1 overflow-auto p-4 bg-gray-100">
            <div 
              className="bg-white mx-auto transition-all duration-300 h-full overflow-hidden" 
              style={{ width: '100%', maxWidth: getPreviewWidth() }}
            >
              <iframe 
                ref={iframeRef}
                className="w-full h-full border-0" 
                title="Template Preview"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full-screen preview overlay */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">
          <div className="flex items-center justify-between bg-white p-4 shadow-md">
            <h2 className="text-xl font-semibold">Full Preview</h2>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowFullPreview(false)}
                className="p-2 hover:bg-gray-100 text-gray-700 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            <div className="bg-white h-full mx-auto max-w-5xl">
              <iframe
                ref={fullPreviewRef}
                className="w-full h-full border-0"
                title="Full Template Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewPanel;
