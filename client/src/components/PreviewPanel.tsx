import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Monitor, Tablet, Smartphone, Maximize2, Minimize2 } from 'lucide-react';
import { PreviewMode } from '../types';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    updateIframeContent();
    if (isFullscreen) {
      updateFullscreenIframeContent();
    }
  }, [html, isFullscreen]);

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
  
  const updateFullscreenIframeContent = () => {
    if (fullscreenIframeRef.current) {
      const iframe = fullscreenIframeRef.current;
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
              onClick={() => setIsFullscreen(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-md flex items-center"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Expand
            </Button>
            <Button
              variant="secondary"
              onClick={onRefresh}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-md flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
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

      {/* Fullscreen Preview Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Fullscreen Preview</h2>
              <div className="flex items-center gap-4">
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
                  onClick={() => setIsFullscreen(false)}
                  className="flex items-center"
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Exit Fullscreen
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 p-4 overflow-auto">
              <div 
                className="bg-white mx-auto transition-all duration-300 h-full overflow-hidden" 
                style={{ width: '100%', maxWidth: getPreviewWidth() }}
              >
                <iframe 
                  ref={fullscreenIframeRef}
                  className="w-full h-full border-0" 
                  title="Fullscreen Template Preview"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviewPanel;
