import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateData, CompanySection } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TemplateSectionSelectorProps {
  htmlContent: string;
  templateData: TemplateData;
  onUpdate: (updatedData: Partial<TemplateData>) => void;
  onClose: () => void;
}

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
    '.product-card h2'
  ],
  description: [
    '.description-text',
    '.product-description',
    '.desc-container',
    'div.product-desc'
  ],
  image: [
    '.main-image img',
    '.product-gallery img',
    '.gallery img',
    'img.product-image'
  ]
} as const;

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
  const [isSaving, setIsSaving] = useState(false);

  // Initialize preview document
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    setPreviewDocument(doc);
  }, [htmlContent]);

  // Handle clicks on elements in the preview
  const handleElementClick = (e: MouseEvent) => {
    e.preventDefault();
    const element = e.target as Element;
    if (element) {
      const selector = generateUniqueSelector(element);
      setSelectedSelector(selector);
      setCustomSelector(selector);
      setHighlightedSection(element.outerHTML);
    }
  };

  // Generate a unique selector for an element
  const generateUniqueSelector = (element: Element): string => {
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
    setCustomSelector(selector);
    if (previewDocument) {
      try {
        const element = previewDocument.querySelector(selector);
        if (element) {
          setHighlightedSection(element.outerHTML);
        } else {
          setHighlightedSection(null);
          toast({
            title: 'No element found',
            description: `Couldn't find any element using selector: ${selector}`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error parsing selector:', error);
        toast({
          title: 'Invalid selector',
          description: 'The selector syntax is invalid',
          variant: 'destructive'
        });
      }
    }
  };

  const handleCustomSelectorSubmit = () => {
    if (customSelector) {
      handleSelectorClick(customSelector);
    }
  };

  const assignSelectedSection = async () => {
    if (!selectedSelector || !highlightedSection || !previewDocument) {
      toast({
        title: 'No section selected',
        description: 'Please select a section first',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
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

      // Handle company sections with custom selectors
      if (activeTab === 'company') {
        const updatedCompanyInfo = [...(templateData.companyInfo || [])];
        const existingSection = updatedCompanyInfo.find(section => section.cssSelector === selectedSelector);
        
        if (existingSection) {
          // Update existing section if it has the same selector
          const updatedSections = updatedCompanyInfo.map(section => 
            section.cssSelector === selectedSelector 
              ? {
                  ...section,
                  title: element.textContent?.trim() || section.title,
                  description: element.innerHTML || section.description
                }
              : section
          );
          onUpdate({ companyInfo: updatedSections });
        } else {
          // Add new section with the selected selector
          const newSection: CompanySection = {
            id: generateId(),
            title: element.textContent?.trim() || 'New Section',
            description: element.innerHTML || 'Describe this section here.',
            cssSelector: selectedSelector,
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
          };
          updatedCompanyInfo.push(newSection);
          onUpdate({ companyInfo: updatedCompanyInfo });
        }
      } else {
        // Handle other sections as before
        switch (activeTab) {
          case 'title':
            onUpdate({ title: element.textContent?.trim() || '' });
            break;
          case 'description':
            onUpdate({ description: element.innerHTML || '' });
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
              }
            }
            break;
        }
      }

      toast({
        title: 'Success',
        description: `The ${activeTab} section has been updated`
      });
      
      // Close the selector after successful assignment
      onClose();
    } catch (error) {
      console.error('Error assigning section:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign the selected section',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg max-h-[90vh] overflow-auto">
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomSelectorSubmit();
                    }
                  }}
                  placeholder="Enter a CSS selector (e.g. .product-title)"
                  className="flex-grow font-mono text-sm"
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
                    className="w-full justify-start font-mono text-sm"
                  >
                    {selector}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <div className="mt-6">
              <Label className="mb-2 block">Selected Section Preview</Label>
              <div className="bg-gray-50 p-4 rounded-md h-56 overflow-auto">
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
          </Tabs>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={assignSelectedSection}
              disabled={!selectedSelector || !highlightedSection || isSaving}
            >
              {isSaving ? 'Saving...' : 'Assign Selected Section'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .preview-content > * {
          cursor: pointer;
        }
        .preview-content > *:hover {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}