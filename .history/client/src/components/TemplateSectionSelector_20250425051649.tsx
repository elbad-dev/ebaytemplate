import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateData } from '@/types';
import { useToast } from '@/hooks/use-toast';

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

  // Initialize preview document
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Add click handlers and styles to all elements
    doc.body.querySelectorAll('*').forEach(element => {
      element.style.cursor = 'pointer';
      element.setAttribute('data-selectable', 'true');
      // Add hover styles
      element.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        target.style.outline = '2px solid #3b82f6';
        target.style.outlineOffset = '2px';
      });
      element.addEventListener('mouseout', (e) => {
        const target = e.target as HTMLElement;
        target.style.outline = 'none';
      });
    });
    
    setPreviewDocument(doc);
  }, [htmlContent]);

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

    // Generate a unique selector for the clicked element
    const selector = generateUniqueSelector(element);
    setSelectedSelector(selector);
    setHighlightedSection(element.outerHTML);

    toast({
      title: 'Element selected',
      description: 'Click "Assign Selected Section" to use this element'
    });
  };

  // Function to generate a unique CSS selector for an element
  const generateUniqueSelector = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    
    let selector = element.tagName.toLowerCase();
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c);
      if (classes.length) {
        selector += `.${classes.join('.')}`;
      }
    }

    // Add parent context if needed
    const parent = element.parentElement;
    if (parent && parent.tagName !== 'BODY') {
      const parentSelector = generateUniqueSelector(parent);
      selector = `${parentSelector} > ${selector}`;
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
                url: imgSrc,
                alt: element.getAttribute('alt') || ''
              });
              onUpdate({ images: newImages });
              break;
            }
          }

          // Handle gallery container
          const images = element.querySelectorAll('img');
          if (images.length > 0) {
            const newImages = [...(templateData.images || [])];
            let added = 0;

            images.forEach(img => {
              const src = img.getAttribute('src');
              if (src) {
                const imgId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                newImages.push({
                  id: imgId,
                  url: src,
                  alt: img.getAttribute('alt') || ''
                });
                added++;
              }
            });

            if (added > 0) {
              onUpdate({ images: newImages });
              toast({
                title: 'Images added',
                description: `Added ${added} images from the gallery`
              });
              return;
            }
          }

          toast({
            title: 'No images found',
            description: 'Could not find suitable images in the selected element',
            variant: 'destructive'
          });
          break;
      }

      toast({
        title: 'Section assigned',
        description: `The ${activeTab} section has been updated with the selected content`
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
                >
                  Try
                </Button>
              </div>
            </div>

            <TabsContent value="company" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {commonSelectors.company.map((selector) => (
                  <Button 
                    key={selector}
                    variant={selectedSelector === selector ? "default" : "outline"}
                    onClick={() => handleSelectorClick(selector)}
                    className="w-full justify-start"
                  >
                    {selector}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="title" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {commonSelectors.title.map((selector) => (
                  <Button 
                    key={selector}
                    variant={selectedSelector === selector ? "default" : "outline"}
                    onClick={() => handleSelectorClick(selector)}
                    className="w-full justify-start"
                  >
                    {selector}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="description" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {commonSelectors.description.map((selector) => (
                  <Button 
                    key={selector}
                    variant={selectedSelector === selector ? "default" : "outline"}
                    onClick={() => handleSelectorClick(selector)}
                    className="w-full justify-start"
                  >
                    {selector}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {commonSelectors.image.map((selector) => (
                  <Button 
                    key={selector}
                    variant={selectedSelector === selector ? "default" : "outline"}
                    onClick={() => handleSelectorClick(selector)}
                    className="w-full justify-start"
                  >
                    {selector}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Label className="mb-2 block">Preview (click any element to select it)</Label>
            <div 
              className="bg-white border rounded-md h-[400px] overflow-auto relative"
              onClick={(e) => handleElementClick(e as unknown as MouseEvent)}
            >
              {previewDocument && (
                <div 
                  dangerouslySetInnerHTML={{ __html: previewDocument.body.innerHTML }}
                  className="preview-content p-4"
                  style={{ minHeight: '100%' }}
                />
              )}
            </div>
          </div>

          <div className="mt-6">
            <Label className="mb-2 block">Selected Section Preview</Label>
            <div className="bg-gray-50 border rounded-md p-4 h-56 overflow-auto">
              {highlightedSection ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: highlightedSection }}
                  className="preview-content selected-section"
                />
              ) : (
                <div className="text-gray-500 text-center italic py-8">
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
            >
              Assign Selected Section
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}