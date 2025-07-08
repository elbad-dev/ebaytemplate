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
    setPreviewDocument(doc);
  }, [htmlContent]);

  const handleSelectorClick = (selector: string) => {
    setSelectedSelector(selector);
    if (previewDocument) {
      try {
        const element = previewDocument.querySelector(selector);
        if (element) {
          setHighlightedSection(element.outerHTML);
        } else {
          setHighlightedSection(null);
        }
      } catch (error) {
        console.error('Invalid selector:', error);
        setHighlightedSection(null);
      }
    }
  };

  const handleElementClick = (e: MouseEvent) => {
    e.preventDefault();
    const element = e.target as Element;
    if (element) {
      // Generate a unique selector for the clicked element
      let selector = '';
      if (element.id) {
        selector = `#${element.id}`;
      } else if (element.classList.length > 0) {
        selector = `.${Array.from(element.classList).join('.')}`;
      } else {
        selector = element.tagName.toLowerCase();
      }
      setSelectedSelector(selector);
      setHighlightedSection(element.outerHTML);
      setCustomSelector(selector);
    }
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

      // Handle company sections with custom selectors
      if (activeTab === 'company') {
        const updatedCompanyInfo = [...(templateData.companyInfo || [])];
        const newSection: CompanySection = {
          id: generateId(),
          title: element.textContent?.trim() || '',
          description: '',
          svg: '',
          cssSelector: selectedSelector
        };
        updatedCompanyInfo.push(newSection);
        onUpdate({ companyInfo: updatedCompanyInfo });
      } else {
        // Handle other sections and save selector
        switch (activeTab) {
          case 'title':
            onUpdate({ title: element.textContent?.trim() || '', titleSelector: selectedSelector });
            break;
          case 'description':
            onUpdate({ description: element.innerHTML || '', descriptionSelector: selectedSelector });
            break;
          case 'image':
            // ...existing image logic if needed...
            break;
          // Add more cases as needed for other sections
        }
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
            Choose a section type, then use predefined selectors or click elements in the preview
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
                  onChange={(e) => {
                    setCustomSelector(e.target.value);
                    handleSelectorClick(e.target.value);
                  }}
                  placeholder="Enter a CSS selector"
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => handleSelectorClick(customSelector)}
                  disabled={!customSelector}
                >
                  Test
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <Label className="mb-2 block">Preview (click any element to select it)</Label>
              <div className="section-preview">
                {previewDocument && (
                  <div 
                    onClick={(e) => handleElementClick(e as unknown as MouseEvent)}
                    className="preview-content bg-white border rounded-md p-4"
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
              disabled={!selectedSelector || !highlightedSection}
            >
              Assign Selected Section
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