import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditorTab, PreviewMode, TemplateData } from '../types';
import { Template } from '@shared/schema';
import PreviewPanel from './PreviewPanel';
import ImageEditor from './ImageEditor';
import TitleEditor from './TitleEditor';
import ProductDescriptionEditor from './ProductDescriptionEditor';
import TechSpecsEditor from './TechSpecsEditor';
import CompanyEditor from './CompanyEditor';
import SvgEditor from './SvgEditor';
import TemplateSectionSelector from './TemplateSectionSelector';
import { generateTemplate, generateGallerySection } from '../utils/templateGenerator';
import { parseTemplate } from '../utils/templateParser';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface TemplateEditorProps {
  template?: Template;
  onBack?: () => void;
}

// Helper: Replace only the <div class="gallery">...</div> section in the template with a new gallery
function replaceGallerySection(html: string, images: { url: string; alt?: string }[]): string {
  if (!html || !images) return html;
  
  // Pattern to match both simple gallery and advanced gallery structures
  const galleryPatterns = [
    /<div\s+class="gallery"[^>]*>[\s\S]*?<\/div>/i,
    /<div\s+class="product-gallery"[^>]*>[\s\S]*?<\/div>/i,
    /<div\s+class="gallery-container"[^>]*>[\s\S]*?<\/div>/i
  ];

  for (const pattern of galleryPatterns) {
    if (pattern.test(html)) {
      return html.replace(pattern, generateGallerySection(images));
    }
  }
  return html;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onBack }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EditorTab>('images');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [templateData, setTemplateData] = useState<TemplateData>({
    title: '',
    company_name: '',
    subtitle: '',
    price: '',
    currency: 'USD',
    description: '',
    images: [],
    specs: [],
    companyInfo: []
  });
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [showSectionSelector, setShowSectionSelector] = useState(false);

  // Parse template on mount or when template prop changes
  useEffect(() => {
    if (template) {
      try {
        const extractedData = parseTemplate(template.html);
        setTemplateData(extractedData);
        setGeneratedHtml(template.html);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to parse the template.',
          variant: 'destructive'
        });
      }
    }
  }, [template, toast]);

  // Carefully update template sections while preserving structure
  useEffect(() => {
    if (template?.html) {
      try {
        // Create a DOM parser to work with the HTML structure
        const parser = new DOMParser();
        let updatedHtml = template.html;
        
        // First handle gallery section as it's the most complex
        if (templateData.images.length > 0) {
          updatedHtml = replaceGallerySection(updatedHtml, templateData.images);
        }
        
        // Parse the HTML to work with the DOM
        const doc = parser.parseFromString(updatedHtml, 'text/html');
        
        // Update text content while preserving structure
        const updateTextContent = (selector: string, content: string) => {
          const element = doc.querySelector(selector);
          if (element) element.textContent = content;
        };

        // Update all text-based sections
        if (templateData.title) {
          updateTextContent('.product-title, .product-name', templateData.title);
        }
        if (templateData.price) {
          updateTextContent('.product-price', templateData.price);
        }
        if (templateData.description) {
          updateTextContent('.product-description, .description-text', templateData.description);
        }

        // Update specs if they exist
        const specsContainer = doc.querySelector('.specs-container, .specifications');
        if (specsContainer && templateData.specs.length > 0) {
          specsContainer.innerHTML = templateData.specs.map(spec => `
            <div class="spec-item">
              <span class="spec-label">${spec.label}:</span>
              <span class="spec-value">${spec.value}</span>
            </div>
          `).join('');
        }

        // Update company sections if they exist
        const companySections = doc.querySelectorAll('.company-section');
        if (companySections.length > 0 && templateData.companyInfo.length > 0) {
          companySections.forEach((section, index) => {
            if (index < templateData.companyInfo.length) {
              const data = templateData.companyInfo[index];
              const iconContainer = section.querySelector('.icon-container');
              if (iconContainer) iconContainer.innerHTML = data.svg || '';
              
              const title = section.querySelector('h3');
              if (title) title.textContent = data.title;
              
              const desc = section.querySelector('p');
              if (desc) desc.textContent = data.description;
            }
          });
        }

        // Get the updated HTML while preserving structure
        setGeneratedHtml(doc.documentElement.outerHTML);
      } catch (error) {
        console.error('Error updating template:', error);
        toast({
          title: 'Error',
          description: 'Failed to update the template preview.',
          variant: 'destructive'
        });
      }
    }
  }, [templateData, template?.html, toast]);

  // Handle template import (upload or paste)
  const handleTemplateImport = (newTemplateData: TemplateData) => {
    setTemplateData(newTemplateData);
    toast({
      title: 'Template imported',
      description: 'You can now edit the template content',
    });
  };

  // Handle updates from section editors
  const handleSectionUpdate = (updates: Partial<TemplateData>) => {
    setTemplateData(prev => ({ ...prev, ...updates }));
  };

  // Export/download template
  const handleExportTemplate = () => {
    if (!generatedHtml) {
      toast({
        title: 'No template to export',
        description: 'Please import or create a template first',
        variant: 'destructive',
      });
      return;
    }
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateData.title.replace(/\s+/g, '-').toLowerCase()}_ebay-template.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Template exported',
      description: 'Your template has been downloaded',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
        <div className="flex gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>Back</Button>
          )}
          <Button onClick={handleExportTemplate}>Export Template</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-1 space-y-5">
          {/* Manual Section Selection Button */}
          {generatedHtml && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                onClick={() => setShowSectionSelector(true)}
              >
                <Zap size={16} />
                <span>Manually Select Sections</span>
              </Button>
            </div>
          )}

          {/* Template Upload Section (if not editing an existing template) */}
          {!template && <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-sm text-center text-gray-600 mb-3">
              Import an HTML template to edit
            </p>
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.html';
                  input.onchange = async (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      const file = target.files[0];
                      const text = await file.text();
                      try {
                        const templateData = parseTemplate(text);
                        handleTemplateImport(templateData);
                      } catch (error) {
                        toast({
                          title: 'Error importing template',
                          description: 'There was a problem processing your template',
                          variant: 'destructive'
                        });
                      }
                    }
                  };
                  input.click();
                }}
              >
                Upload HTML File
              </Button>
              <textarea 
                className="w-full p-2 border rounded-md text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Paste your HTML code here..."
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    try {
                      const templateData = parseTemplate(e.target.value);
                      handleTemplateImport(templateData);
                    } catch (error) {
                      toast({
                        title: 'Error parsing template',
                        description: 'There was a problem with the HTML code provided',
                        variant: 'destructive'
                      });
                    }
                  }
                }}
              ></textarea>
            </div>
          </div>}

          {/* Editor Tabs */}
          <Card>
            <div className="border-b border-gray-200">
              <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as EditorTab)}>
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="images" className="text-xs sm:text-sm">Images</TabsTrigger>
                  <TabsTrigger value="title" className="text-xs sm:text-sm">Info</TabsTrigger>
                  <TabsTrigger value="description" className="text-xs sm:text-sm">Desc</TabsTrigger>
                  <TabsTrigger value="specs" className="text-xs sm:text-sm">Specs</TabsTrigger>
                  <TabsTrigger value="company" className="text-xs sm:text-sm">About</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardContent className="p-0">
              {activeTab === 'images' && (
                <ImageEditor 
                  data={templateData}
                  onUpdate={handleSectionUpdate}
                />
              )}
              {activeTab === 'title' && (
                <TitleEditor 
                  data={templateData}
                  onUpdate={handleSectionUpdate}
                />
              )}
              {activeTab === 'description' && (
                <ProductDescriptionEditor 
                  data={templateData}
                  onUpdate={handleSectionUpdate}
                />
              )}
              {activeTab === 'specs' && (
                <TechSpecsEditor 
                  data={templateData}
                  onUpdate={handleSectionUpdate}
                />
              )}
              {activeTab === 'company' && (
                <CompanyEditor 
                  data={templateData}
                  onUpdate={handleSectionUpdate}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <PreviewPanel 
            html={generatedHtml}
            previewMode={previewMode}
            onChangePreviewMode={setPreviewMode}
            onRefresh={() => setGeneratedHtml(generateTemplate(templateData))}
          />
        </div>
      </div>

      {/* Manual Section Selector Modal */}
      {showSectionSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl">
            <TemplateSectionSelector
              htmlContent={generatedHtml}
              templateData={templateData}
              onUpdate={handleSectionUpdate}
              onClose={() => setShowSectionSelector(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
