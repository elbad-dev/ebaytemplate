import React, { useEffect, useRef, useState } from 'react';
import StyleEditor from './TextEditor';
import { Card } from '@/components/ui/card';

interface PreviewPanelProps {
  template: string;
  onUpdate?: (html: string) => void;
}

interface SelectedElement {
  element: HTMLElement;
  text: string;
  style: {
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textAlign?: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export default function PreviewPanel({ template, onUpdate }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [showStyleEditor, setShowStyleEditor] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const makeElementsEditable = () => {
      const textElements = iframeDoc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
      textElements.forEach((element) => {
        if (element instanceof HTMLElement && element.textContent?.trim()) {
          element.contentEditable = 'true';
          element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const rect = element.getBoundingClientRect();
            const iframeRect = iframe.getBoundingClientRect();
            
            setSelectedElement({
              element: element,
              text: element.textContent || '',
              style: {
                color: getComputedStyle(element).color,
                fontSize: getComputedStyle(element).fontSize,
                fontFamily: getComputedStyle(element).fontFamily,
                lineHeight: getComputedStyle(element).lineHeight,
                letterSpacing: getComputedStyle(element).letterSpacing,
                textAlign: getComputedStyle(element).textAlign,
              },
              position: {
                x: iframeRect.left + rect.left + window.scrollX,
                y: iframeRect.top + rect.bottom + window.scrollY + 10,
              },
            });
            setShowStyleEditor(true);
          });

          element.addEventListener('input', (e) => {
            const target = e.target as HTMLElement;
            if (selectedElement && target === selectedElement.element) {
              setSelectedElement({
                ...selectedElement,
                text: target.textContent || '',
              });
            }
          });

          // Add blur handler to save changes
          element.addEventListener('blur', () => {
            if (onUpdate && iframeRef.current?.contentDocument) {
              onUpdate(iframeRef.current.contentDocument.documentElement.innerHTML);
            }
          });
        }
      });
    };

    iframeDoc.open();
    iframeDoc.write(template);
    iframeDoc.close();
    makeElementsEditable();
  }, [template, onUpdate]);

  const handleStyleChange = (newStyle: any) => {
    if (!selectedElement?.element) return;

    // Apply style only to the selected element
    Object.entries(newStyle).forEach(([property, value]) => {
      if (selectedElement.element instanceof HTMLElement) {
        selectedElement.element.style[property as any] = value;
      }
    });

    setSelectedElement({
      ...selectedElement,
      style: newStyle,
    });

    if (onUpdate && iframeRef.current?.contentDocument) {
      onUpdate(iframeRef.current.contentDocument.documentElement.innerHTML);
    }
  };

  const handleCloseStyleEditor = () => {
    setShowStyleEditor(false);
    setSelectedElement(null);
  };

  return (
    <Card className="relative w-full h-full">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Preview"
      />
      {selectedElement && showStyleEditor && (
        <StyleEditor
          style={selectedElement.style}
          position={selectedElement.position}
          onStyleChange={handleStyleChange}
          onClose={handleCloseStyleEditor}
        />
      )}
    </Card>
  );
}
