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

const TemplateSectionSelector = ({ 
  htmlContent, 
  templateData, 
  onUpdate, 
  onClose 
}: TemplateSectionSelectorProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('company');
  const [selectedSelector, setSelectedSelector] = useState<string | undefined>(undefined);
  const [initialSelector, setInitialSelector] = useState<string | undefined>(undefined);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [customSelector, setCustomSelector] = useState('');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Initialize preview document - only for selector testing
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
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

  // Set initial selector based on active section
  useEffect(() => {
    switch (activeTab) {
      case 'company':
        setInitialSelector(commonSelectors.company[0]);
        break;
      case 'title':
        setInitialSelector(commonSelectors.title[0]);
        break;
      case 'description':
        setInitialSelector(commonSelectors.description[0]);
        break;
      case 'image':
        setInitialSelector(commonSelectors.image[0]);
        break;
      default:
        setInitialSelector(undefined);
    }
  }, [activeTab]);

  useEffect(() => {
    setSelectedSelector(initialSelector);
  }, [initialSelector]);

  // Update highlighted section when selectedSelector changes
  useEffect(() => {
    if (!selectedSelector || !previewDocument) return;

    try {
      const element = previewDocument.querySelector(selectedSelector);
      
      if (element) {
        const content = element.outerHTML;
        setHighlightedSection(content);
        
        const allElements = previewDocument.querySelectorAll(selectedSelector);
        if (allElements.length > 1) {
          toast({
            title: 'Multiple matches found',
            description: `Found ${allElements.length} elements matching this selector. Showing the first one.`,
            variant: 'default'
          });
        }
      } else {
        setHighlightedSection(null);
        toast({
          title: 'No element found',
          description: `Couldn't find any element using selector: ${selectedSelector}`,
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
  }, [selectedSelector, previewDocument]);

  const handleCustomSelectorSubmit = () => {
    if (!customSelector) return;
    setSelectedSelector(customSelector);
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
          } else {
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
              if (newImages.length > 0) {
                onUpdate({ images: newImages });
              }
            }
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

  const handleSave = () => {
    assignSelectedSection();
    onClose();
  };

  const handleCancel = () => {
    // Revert selector to initial value and close
    setSelectedSelector(initialSelector);
    onClose();
  };

  return (
    <div className="p-6">
      <Card className="max-w-5xl mx-auto shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="text-xl font-bold">Manual Section Selector</CardTitle>
          <p className="text-sm text-gray-600">
            Choose a section type, then use predefined selectors or enter a custom selector
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
                    onClick={() => setSelectedSelector(selector)}
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
                    onClick={() => setSelectedSelector(selector)}
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
                    onClick={() => setSelectedSelector(selector)}
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
                    onClick={() => setSelectedSelector(selector)}
                    className="w-full justify-start"
                  >
                    {selector}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Label className="mb-2 block">Selected Section Preview</Label>
            <div className="bg-gray-100 p-4 rounded-md h-56 overflow-auto">
              {highlightedSection ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: highlightedSection }}
                  className="preview-content"
                />
              ) : (
                <div className="text-gray-500 text-center italic">
                  No section selected or found
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white">Save</Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .preview-content {
          min-height: 200px;
          max-height: 400px;
          overflow: auto;
        }

        .preview-content img {
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
};

export default TemplateSectionSelector;