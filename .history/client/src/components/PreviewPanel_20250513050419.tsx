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
  GripVertical,
  Code
} from 'lucide-react';
import { PreviewMode } from '@shared/schema';

interface PreviewPanelProps {
  html: string;
  previewMode: PreviewMode;
  onChangePreviewMode: (mode: PreviewMode) => void;
  onRefresh?: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps & { style?: React.CSSProperties }> = ({ 
  html, 
  previewMode, 
  onChangePreviewMode,
  onRefresh,
  style
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fullPreviewRef = useRef<HTMLIFrameElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  const [showHtmlView, setShowHtmlView] = useState(false);
  const [initialX, setInitialX] = useState<number>(0);
  const [initialWidth, setInitialWidth] = useState<number>(0);
  const [editableHtml, setEditableHtml] = useState(html);

  // Sync editableHtml with html prop when not editing
  useEffect(() => {
    if (!showHtmlView) return;
    setEditableHtml(html);
  }, [html, showHtmlView]);

  // Handler for HTML edit
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableHtml(e.target.value);
  };

  // Handler for saving HTML edit
  const handleHtmlSave = () => {
    if (editableHtml !== html && typeof window !== 'undefined') {
      // Dispatch a custom event to notify parent (TemplateEditor) of HTML change
      const event = new CustomEvent('previewHtmlEdit', { detail: { html: editableHtml } });
      window.dispatchEvent(event);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    setInitialX(e.clientX);
    setInitialWidth(previewWidth);

    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const delta = e.clientX - initialX;
      const newWidth = Math.max(320, Math.min(1200, initialWidth + delta));
      setPreviewWidth(newWidth);
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

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || showHtmlView) return;

    // --- Scroll restoration logic ---
    let lastScroll = 0;
    if (iframe.contentDocument && iframe.contentDocument.body) {
      lastScroll = iframe.contentDocument.body.scrollTop;
    }

    const updateContent = () => {
      if (!iframe.contentWindow || !iframe.contentDocument) return;
      iframe.contentDocument.open();
      iframe.contentDocument.write(sanitizeHtml(html) || getEmptyPreview());
      iframe.contentDocument.close();
      // Restore scroll position after a short delay
      setTimeout(() => {
        if (iframe.contentDocument && iframe.contentDocument.body) {
          iframe.contentDocument.body.scrollTop = lastScroll;
        }
      }, 0);
    };

    updateContent();

    iframe.addEventListener('load', updateContent);
    return () => {
      iframe.removeEventListener('load', updateContent);
    };
  }, [html, showHtmlView]);

  const getEmptyPreview = () => {
    return `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
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
      <div className="h-full flex flex-col">
        <Card className="flex-1 flex flex-col h-full">
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
                variant="outline"
                onClick={onRefresh}
                className="px-3 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-md flex items-center"
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
          
          <CardContent 
            ref={previewContainerRef} 
            className="flex-1 relative p-4 bg-gray-100"
            style={{
              height: 'calc(100% - 80px)',
              ...style
            }}
          >
            {showHtmlView ? (
              <div className="bg-white mx-auto shadow-sm transition-all duration-200 h-full p-4 overflow-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {html}
                </pre>
              </div>
            ) : (
              <div 
                className="bg-white mx-auto shadow-sm transition-all duration-200 h-full overflow-hidden relative"
                style={{ 
                  width: previewMode === 'desktop' ? '100%' : previewWidth || getPreviewWidth(),
                  minHeight: '800px',
                  maxWidth: previewMode === 'desktop' ? 'none' : getPreviewWidth(),
                }}
              >
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                  title="Template Preview"
                />
                {previewMode === 'desktop' && (
                  <div
                    ref={resizeHandleRef}
                    className="absolute top-0 right-0 w-4 h-full cursor-ew-resize hover:bg-gray-100 flex items-center justify-center"
                    onMouseDown={handleResizeStart}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full-screen preview overlay */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">
          <div className="flex items-center justify-between bg-white p-4 shadow-md">
            <h2 className="text-xl font-semibold">Full Preview</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFullPreview(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            <div className="bg-white mx-auto h-full max-w-7xl">
              <iframe
                ref={fullPreviewRef}
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
                title="Template Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewPanel;
