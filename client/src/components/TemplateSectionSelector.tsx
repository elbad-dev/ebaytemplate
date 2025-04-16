import React, { useState } from 'react';
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
      // Specific selector based on our template analysis
      '.product-info .card div:not(.tags):not(.button-container)',
      // Using standard CSS selectors
      'h2 + div',
      '.product-info .card:nth-child(2) div',
      '.card h2 + div'
    ],
    image: [
      '.main-image img',
      '.product-gallery img',
      '.thumbnail img',
      '.gallery-item img',
      // Specific selectors from our template
      '.gallery-container img',
      '.gallery img',
      // First image
      '#main1'
    ]
  };

  const handleSelectorClick = (selector: string) => {
    setSelectedSelector(selector);
    try {
      // Create a DOM from the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Try to find the element using the selector
      const element = doc.querySelector(selector);
      
      if (element) {
        // Extract the HTML content
        const content = element.outerHTML;
        setHighlightedSection(content);
        
        // Check if multiple elements match (to show a hint)
        const allElements = doc.querySelectorAll(selector);
        if (allElements.length > 1) {
          toast({
            title: 'Multiple matches found',
            description: `Found ${allElements.length} elements matching this selector. Showing the first one.`,
            variant: 'default'
          });
        }
      } else {
        setHighlightedSection(null);
        
        // Try an alternative approach for specific cases
        if (selector.includes('h2') && selector.includes('div')) {
          // Try to find any heading with Produktbeschreibung
          const headings = Array.from(doc.querySelectorAll('h2'));
          const descriptionHeading = headings.find(h => 
            h.textContent?.includes('Produktbeschreibung') || 
            h.textContent?.includes('Product Description'));
          
          if (descriptionHeading && descriptionHeading.nextElementSibling) {
            const content = descriptionHeading.nextElementSibling.outerHTML;
            setHighlightedSection(content);
            toast({
              title: 'Found alternative match',
              description: 'Found content after a heading with "Produktbeschreibung"',
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
    if (!selectedSelector || !highlightedSection) {
      toast({
        title: 'No section selected',
        description: 'Please select a section first',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create a DOM from the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Get the element using the selector
      const element = doc.querySelector(selectedSelector);
      
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
          // Handle direct img tag selection
          if (element.tagName.toLowerCase() === 'img') {
            const imgSrc = element.getAttribute('src');
            if (imgSrc) {
              const newImages = [...templateData.images];
              const newImgId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              newImages.push({ id: newImgId, url: imgSrc });
              onUpdate({ images: newImages });
            }
          } 
          // Handle container with multiple images (gallery)
          else {
            const images = element.querySelectorAll('img');
            if (images.length > 0) {
              const newImages = [...templateData.images];
              let added = 0;
              
              Array.from(images).forEach((img, idx) => {
                const imgSrc = img.getAttribute('src');
                if (imgSrc && 
                    imgSrc.indexOf('placeholder') === -1 && 
                    imgSrc.indexOf('icon') === -1 && 
                    imgSrc.indexOf('logo') === -1) {
                  const newImgId = `img-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
                  newImages.push({ id: newImgId, url: imgSrc });
                  added++;
                }
              });
              
              if (added > 0) {
                onUpdate({ images: newImages });
                toast({
                  title: 'Images added',
                  description: `Added ${added} images from the gallery`,
                });
                return;
              }
            }
            
            toast({
              title: 'No images found',
              description: 'Could not find suitable images in the selected element',
              variant: 'destructive'
            });
          }
          break;
      }

      toast({
        title: 'Section assigned',
        description: `The ${activeTab} section has been updated with the selected content`,
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
            Use this tool to manually select HTML sections when automatic detection doesn't work
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
            <Label className="mb-2 block">Preview of Selected Section</Label>
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
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={assignSelectedSection}>Assign Selected Section</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}