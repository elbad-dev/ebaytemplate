import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TemplateSectionSelectorProps {
  htmlContent: string;
  templateData: TemplateData;
  onUpdate: (updatedData: Partial<TemplateData>) => void;
  onClose: () => void;
}

export default function TemplateSectionSelector({ 
  htmlContent, 
  templateData, 
  onUpdate, 
  onClose 
}: TemplateSectionSelectorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('company');
  const [selectedSelector, setSelectedSelector] = useState('');
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [customSelector, setCustomSelector] = useState('');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);

  // Initialize preview document with enhanced hover effects
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Add hover and click handlers to all elements
    doc.body.querySelectorAll('*').forEach(element => {
      element.setAttribute('data-selectable', 'true');
      
      // Add hover event listeners
      element.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        if (hoveredElement) {
          hoveredElement.classList.remove('hover-highlight');
        }
        target.classList.add('hover-highlight');
        setHoveredElement(target);
      });

      element.addEventListener('mouseout', (e) => {
        const target = e.target as HTMLElement;
        target.classList.remove('hover-highlight');
      });
    });
    
    setPreviewDocument(doc);
  }, [htmlContent, hoveredElement]);

  // Common CSS selectors that might be used in templates
  const commonSelectors = {
    company: [
      '.brand-text h1', 
      '.company-name', 
      'header .logo-text',
      '.header-section .brand h1',
      '.header-content .brand-text h1'
    ],
    title: [
      '.product-title', 
      '.product-info h2', 
      '.card h2',
      '.product-card h2',
      '.product-info .card h2'
    ],
    description: [
      '.description-text',
      '.product-description',
      '.desc-container',
      'div.product-desc',
      '.product-info .card div:not(.tags):not(.button-container)',
      'h2 + div',
      '.product-info .card:nth-child(2) div',
      '.card h2 + div'
    ],
    image: [
      '.main-image img',
      '.product-gallery img',
      '.thumbnail img',
      '.gallery-item img',
      '.gallery-container img',
      '.gallery img',
      '#main1'
    ]
  };

  const handleElementClick = (event: MouseEvent) => {
    const element = event.target as HTMLElement;
    if (!element.hasAttribute('data-selectable')) return;

    event.preventDefault();
    event.stopPropagation();

    // Remove hover highlight from previously selected element
    if (hoveredElement) {
      hoveredElement.classList.remove('hover-highlight');
    }

    // Add selected highlight
    element.classList.add('selected-highlight');

    // Generate a unique selector for the clicked element
    const selector = generateUniqueSelector(element);
    setSelectedSelector(selector);
    setHighlightedSection(element.outerHTML);

    toast({
      title: 'Element selected',
      description: 'Click "Assign Selected Section" to use this element'
    });
  };

  const generateUniqueSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    
    let selector = element.tagName.toLowerCase();
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c);
      if (classes.length) {
        selector += `.${classes.join('.')}`;
      }
    }

    const parent = element.parentElement;
    if (parent && parent.tagName !== 'BODY') {
      if (parent.id) {
        return `#${parent.id} > ${selector}`;
      } else if (parent.className) {
        const classes = parent.className.split(' ').filter(c => c);
        if (classes.length) {
          return `.${classes.join('.')} > ${selector}`;
        }
      }
    }

    return selector;
  };

  const handleSelectorClick = (selector: string) => {
    setSelectedSelector(selector);
    if (!previewDocument) return;

    try {
      const element = previewDocument.querySelector(selector);
      
      if (element) {
        const content = element.outerHTML;
        setHighlightedSection(content);
        
        const allElements = previewDocument.querySelectorAll(selector);
        if (allElements.length > 1) {
          toast({
            title: 'Multiple matches found',
            description: `Found ${allElements.length} elements matching this selector. Showing the first one.`,
            variant: 'default'
          });
        }
      } else {
        setHighlightedSection(null);
        
        if (selector.includes('h2') && selector.includes('div')) {
          const headings = Array.from(previewDocument.querySelectorAll('h2'));
          const descriptionHeading = headings.find(h => 
            h.textContent?.includes('Produktbeschreibung') || 
            h.textContent?.includes('Product Description'));
          
          if (descriptionHeading && descriptionHeading.nextElementSibling) {
            const content = descriptionHeading.nextElementSibling.outerHTML;
            setHighlightedSection(content);
            toast({
              title: 'Found alternative match',
              description: 'Found content after a heading with "Produktbeschreibung"'
            });
            return;
          }
        }
        
        toast({
          title: 'No element found',
          description: `Couldn't find any element using selector: ${selector}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error parsing HTML:', error);
      toast({
        title: 'Error',
        description: 'Failed to parse the HTML content',
        variant: 'destructive'
      });
    }
  };

  const handleCustomSelectorSubmit = () => {
    if (!customSelector) return;
    handleSelectorClick(customSelector);
  };

  const assignSelectedSection = () => {
    if (!selectedSelector || !highlightedSection || !previewDocument) {
      toast({
        title: 'No section selected',
        description: 'Please select a section first',
        variant: 'destructive'
      });
      return;
    }

    try {
      const element = previewDocument.querySelector(selectedSelector);
      
      if (!element) {
        toast({
          title: 'Element not found',
          description: 'Could not find the element to assign',
          variant: 'destructive'
        });
        return;
      }

      // Depending on the active tab, update different parts of the template data
      switch (activeTab) {
        case 'company':
          onUpdate({ 
            company_name: element.textContent?.trim() || '' 
          });
          break;
        case 'title':
          onUpdate({ 
            title: element.textContent?.trim() || '' 
          });
          break;
        case 'description':
          onUpdate({ 
            description: element.innerHTML || '' 
          });
          break;
        case 'image':
          if (element.tagName.toLowerCase() === 'img') {
            const imgSrc = element.getAttribute('src');
            if (imgSrc) {
              const newImages = [...(templateData.images || [])];
              const newImgId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              newImages.push({
                id: newImgId,
                url: imgSrc
              });
              onUpdate({ images: newImages });
              break;
            }
          }

          // Handle gallery container
          const images = element.querySelectorAll('img');
          if (images.length > 0) {
            const newImages = [...(templateData.images || [])];
            images.forEach(img => {
              const src = img.getAttribute('src');
              if (src) {
                const newImgId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                newImages.push({
                  id: newImgId,
                  url: src
                });
              }
            });
            onUpdate({ images: newImages });
          }
          break;
      }

      toast({
        title: 'Success',
        description: `The ${activeTab} section has been updated`
      });
    } catch (error) {
      console.error('Error assigning section:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign the selected section',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg max-h-[90vh] overflow-auto">
      <Card className="max-w-5xl mx-auto shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="text-xl font-bold">Manual Section Selector</CardTitle>
          <p className="text-sm text-gray-600">
            Choose a section type, then click elements in the preview or use predefined selectors
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full mb-4">
              <TabsTrigger value="company">Company Name</TabsTrigger>
              <TabsTrigger value="title">Product Title</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
            </TabsList>

            <div className="mb-6">
              <Label htmlFor="customSelector" className="mb-2 block">Custom CSS Selector</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="customSelector" 
                  value={customSelector} 
                  onChange={(e) => setCustomSelector(e.target.value)}
                  placeholder="Enter a CSS selector (e.g. .product-title)"
                  className="flex-grow"
                />
                <Button 
                  onClick={handleCustomSelectorSubmit}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Try Selector
                </Button>
              </div>
            </div>

            {['company', 'title', 'description', 'image'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {commonSelectors[tab as keyof typeof commonSelectors].map((selector) => (
                    <Button 
                      key={selector}
                      variant={selectedSelector === selector ? "default" : "outline"}
                      onClick={() => handleSelectorClick(selector)}
                      className={cn(
                        "w-full justify-start text-left font-mono text-sm",
                        selectedSelector === selector && "bg-primary/10 border-primary"
                      )}
                    >
                      {selector}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6">
            <Label className="mb-2 block">Preview (click any element to select it)</Label>
            <div className="section-preview">
              {previewDocument && (
                <div 
                  onClick={(e) => handleElementClick(e as unknown as MouseEvent)}
                  className="section-preview-content bg-white border rounded-md p-4"
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: previewDocument.body.innerHTML }}
                    className="preview-content"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Label className="mb-2 block">Selected Section Preview</Label>
            <div className="section-preview">
              {highlightedSection ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: highlightedSection }}
                  className="section-preview-content selected-section bg-gray-50 border rounded-md p-4"
                />
              ) : (
                <div className="section-preview-placeholder bg-gray-50 border rounded-md p-4 text-gray-500 text-center">
                  Click an element in the preview above to select it
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={assignSelectedSection}
              disabled={!selectedSelector || !highlightedSection}
              className={cn(
                "transition-all",
                (!selectedSelector || !highlightedSection) && "opacity-50"
              )}
            >
              Assign Selected Section
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .hover-highlight {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
        }
        
        .selected-highlight {
          outline: 3px solid #2563eb !important;
          outline-offset: 3px !important;
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        .section-preview-content {
          min-height: 200px;
          max-height: 400px;
          overflow: auto;
        }

        .section-preview-content img {
          max-width: 100%;
          height: auto;
        }

        .selector-button {
          transition: all 0.2s;
        }

        .selector-button:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }

        .selector-button-selected {
          background-color: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}