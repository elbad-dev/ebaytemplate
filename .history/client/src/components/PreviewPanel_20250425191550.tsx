import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  X,
  GripVertical 
} from 'lucide-react';
import { PreviewMode } from '@shared/schema';
import TextEditor from './TextEditor';

interface PreviewPanelProps {
  html: string;
  previewMode: PreviewMode;
  onChangePreviewMode: (mode: PreviewMode) => void;
  onRefresh?: () => void;
  onUpdateHtml?: (newHtml: string) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  html, 
  previewMode, 
  onChangePreviewMode,
  onRefresh,
  onUpdateHtml
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fullPreviewRef = useRef<HTMLIFrameElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{
    element: HTMLElement;
    text: string;
    style: any;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (container) {
      setPreviewWidth(container.offsetWidth);
    }
  }, []);

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
    const initialWidth = previewWidth;
    const initialX = e.clientX;

    const handleResizeMove = (e: MouseEvent) => {
      if (isResizing && previewContainerRef.current) {
        const delta = e.clientX - initialX;
        const newWidth = Math.max(375, Math.min(initialWidth + delta, 1600));
        setPreviewWidth(newWidth);
      }
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const sanitizeHtml = (html: string) => {
    // Remove script tags and their content
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove onclick and other event handlers
    html = html.replace(/ on\w+="[^"]*"/g, '');
    
    // Remove javascript: URLs
    html = html.replace(/javascript:[^\s"'`]*/g, '');
    
    return html;
  };

  const setupTextEditing = (iframe: HTMLIFrameElement) => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Add click handler to text elements
    const textElements = iframeDoc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    textElements.forEach((element) => {
      if (element.textContent?.trim()) {
        (element as HTMLElement).style.cursor = 'pointer';
        element.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const rect = element.getBoundingClientRect();
          const iframeRect = iframe.getBoundingClientRect();
          
          setSelectedElement({
            element: element as HTMLElement,
            text: element.textContent || '',
            style: {
              color: getComputedStyle(element).color,
              fontSize: getComputedStyle(element).fontSize,
              fontFamily: getComputedStyle(element).fontFamily,
            },
            position: {
              x: iframeRect.left + rect.left + window.scrollX,
              y: iframeRect.top + rect.top + window.scrollY,
            },
          });
        });
      }
    });
  };

  const handleTextUpdate = (newText: string, newStyle: any) => {
    if (!selectedElement?.element) return;

    const element = selectedElement.element;
    element.textContent = newText;
    Object.assign(element.style, newStyle);

    // Update the parent HTML if callback provided
    if (onUpdateHtml && iframeRef.current?.contentDocument) {
      onUpdateHtml(iframeRef.current.contentDocument.documentElement.outerHTML);
    }

    setSelectedElement(null);
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const updateIframeContent = () => {
      if (!iframe.contentWindow || !iframe.contentDocument) return;
      
      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();
      
      setupTextEditing(iframe);
    };

    iframe.addEventListener('load', updateIframeContent);
    updateIframeContent();

    return () => {
      iframe.removeEventListener('load', updateIframeContent);
    };
  }, [html]);

  const getEmptyPreview = () => {
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background-color: #f5f5f5;
        color: #666;
        text-align: center;
      ">
        <div style="max-width: 400px; padding: 2rem;">
          <h3 style="margin-bottom: 1rem; color: #333;">No template to preview</h3>
          <p>Import an existing template or create one by adding content in the editor.</p>
        </div>
      </div>
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
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col border rounded-lg overflow-hidden">
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
              
              {onRefresh && (
                <Button
                  variant="outline"
                  onClick={onRefresh}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-md"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}

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
          
          <CardContent 
            ref={previewContainerRef}
            className="flex-1 overflow-auto p-4 bg-gray-100 relative"
          >
            <div 
              className="bg-white mx-auto transition-all duration-300 h-full shadow-sm rounded-lg overflow-hidden relative"
              style={{ 
                width: previewMode === 'desktop' ? '100%' : previewWidth || getPreviewWidth(),
                minHeight: '1000px',
                maxWidth: previewMode === 'desktop' ? '1800px' : getPreviewWidth(),
                margin: previewMode === 'desktop' ? '0 auto' : undefined
              }}
            >
              <iframe 
                ref={iframeRef}
                className="w-full h-full border-0" 
                style={{ 
                  height: '100%', 
                  minHeight: '1000px',
                  display: 'block'
                }}
                title="Template Preview"
                sandbox="allow-same-origin"
              />

              {previewMode !== 'desktop' && (
                <div
                  ref={resizeHandleRef}
                  className="absolute top-0 right-0 w-4 h-full cursor-ew-resize hover:bg-gray-100 flex items-center justify-center"
                  onMouseDown={handleResizeStart}
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Text Editor */}
      {selectedElement && (
        <TextEditor
          text={selectedElement.text}
          style={selectedElement.style}
          position={selectedElement.position}
          onSave={handleTextUpdate}
          onClose={() => setSelectedElement(null)}
        />
      )}

      {/* Full-screen preview overlay */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">
          <div className="flex items-center justify-between bg-white p-4 shadow-md">
            <h2 className="text-xl font-semibold">Full Preview</h2>
            <Button
              variant="ghost"
              onClick={() => setShowFullPreview(false)}
              className="p-2 hover:bg-gray-100 text-gray-700 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            <div className="bg-white h-full mx-auto shadow-lg rounded-lg" style={{ maxWidth: '1800px' }}>
              <iframe
                ref={fullPreviewRef}
                className="w-full h-full border-0 rounded-lg"
                style={{ minHeight: '1000px' }}
                title="Full Template Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      {isResizing && (
        <div className="fixed inset-0 bg-transparent cursor-ew-resize z-50" />
      )}
    </>
  );
};

export default PreviewPanel;
