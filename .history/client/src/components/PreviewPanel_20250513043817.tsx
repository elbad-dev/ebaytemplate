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
  Code,
  Edit,
  Check,
  Undo
} from 'lucide-react';
import { PreviewMode } from '@shared/schema';
import { RichTextEditor } from './RichTextEditor';

interface PreviewPanelProps {
  html: string;
  previewMode: PreviewMode;
  onChangePreviewMode: (mode: PreviewMode) => void;
  onRefresh?: () => void;
  onSectionEdit?: (sectionId: string, newContent: string) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  html, 
  previewMode, 
  onChangePreviewMode,
  onRefresh,
  onSectionEdit
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
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

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

  // Handle section double click for editing
  const handleSectionDoubleClick = (e: React.MouseEvent) => {
    if (showHtmlView || !onSectionEdit) return;
    
    const clickedElement = e.target as HTMLElement;
    const editableSection = clickedElement.closest('[data-editable="true"]');

    if (editableSection && editableSection instanceof HTMLElement) {
      const sectionId = editableSection.id;
      if (sectionId) {
        setEditingSection(sectionId);
        setEditingContent(editableSection.innerHTML);
      }
    }
  };

  const handleSave = () => {
    if (editingSection && onSectionEdit) {
      onSectionEdit(editingSection, editingContent);
      setEditingSection(null);
      setEditingContent('');
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditingContent('');
  };

  // Wrap sections in editable containers
  const wrapSectionsInEditable = (htmlContent: string) => {
    if (showHtmlView) return htmlContent;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Add data-editable attribute to editable sections
    const editableSections = doc.querySelectorAll('[id^="product-"]');
    editableSections.forEach(section => {
      section.setAttribute('data-editable', 'true');
      section.setAttribute('style', section.getAttribute('style') + ';cursor:pointer;');
    });

    return doc.body.innerHTML;
  };

  return (
    <div className="relative h-full">
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <RichTextEditor
              initialContent={editingContent}
              onUpdate={setEditingContent}
              onSave={handleSave}
              onCancel={handleCancel}
              className="p-4"
            />
          </div>
        </div>
      )}

      <Card className="h-full flex flex-col overflow-hidden">
        <div className="border-b p-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangePreviewMode('desktop')}
            className={previewMode === 'desktop' ? 'bg-accent' : ''}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangePreviewMode('tablet')}
            className={previewMode === 'tablet' ? 'bg-accent' : ''}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangePreviewMode('mobile')}
            className={previewMode === 'mobile' ? 'bg-accent' : ''}
          >
            <Smartphone className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHtmlView(!showHtmlView)}
            className={showHtmlView ? 'bg-accent' : ''}
          >
            <Code className="h-4 w-4" />
          </Button>
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setShowFullPreview(true)}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <CardContent 
          className="flex-1 overflow-auto p-0 relative" 
          ref={previewContainerRef}
        >
          {showHtmlView ? (
            <textarea
              value={editableHtml}
              onChange={handleHtmlChange}
              className="w-full h-full font-mono p-4 resize-none"
              spellCheck={false}
            />
          ) : (
            <div
              className={`preview-content ${previewMode === 'mobile' ? 'max-w-md mx-auto' : previewMode === 'tablet' ? 'max-w-2xl mx-auto' : ''}`}
              onDoubleClick={handleSectionDoubleClick}
              dangerouslySetInnerHTML={{ __html: wrapSectionsInEditable(html) }}
            />
          )}
        </CardContent>
      </Card>

      {/* Full preview dialog */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          <div className="p-2 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Full Preview</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowFullPreview(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <iframe
              ref={fullPreviewRef}
              className="w-full h-full"
              srcDoc={html}
              title="Full Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;
