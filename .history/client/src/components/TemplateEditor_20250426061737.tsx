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
import { getCurrencySymbol } from '@/lib/currencyHelpers';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface TemplateEditorProps {
  template?: Template;
  onBack?: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onBack }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EditorTab>('images');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [showSvgEditor, setShowSvgEditor] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
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
  const [currentSvgData, setCurrentSvgData] = useState({ svg: '', sectionId: '' });

  // Ensure preview updates when templateData changes
  useEffect(() => {
    if (template?.html) {
      generatePreview(templateData);
    }
  }, [templateData, template?.html]);

  // Parse template on mount or when template prop changes
  useEffect(() => {
    if (template) {
      try {
        const extractedData = parseTemplate(template.html);
        setTemplateData(extractedData);
        setGeneratedHtml(template.html);
      } catch (error) {
        console.error('Error parsing template:', error);
        toast({
          title: 'Error',
          description: 'Failed to parse the template.',
          variant: 'destructive'
        });
      }
    }
  }, [template, toast]);

  // Generate preview with updated content
  const generatePreview = (templateData: TemplateData) => {
    if (!template?.html) {
      setGeneratedHtml(generateTemplate(templateData));
      return;
    }

    try {
      const parser = new DOMParser();
      let doc = parser.parseFromString(template.html, 'text/html');

      // Helper function to update content that might be HTML or text
      const updateContent = (selectors: string[], content: string | undefined, type: 'text' | 'html' = 'text') => {
        if (!content) return;
        selectors.forEach(selector => {
          const elements = doc.querySelectorAll(selector);
          elements.forEach(element => {
            if (type === 'html') {
              element.innerHTML = content;
            } else {
              element.textContent = content;
            }
          });
        });
      };

      // Update all text-based content
      updateContent(
        ['.product-title', '.product-name', '.title', 'h1.title', '.product-info h1'],
        templateData.title
      );

      updateContent(
        ['.company-name', '.brand-name', '.merchant-name'],
        templateData.company_name
      );

      updateContent(
        ['.company-slogan', '.brand-slogan', '.subtitle', '.merchant-slogan'],
        templateData.subtitle
      );

      // Price formatting with currency
      if (templateData.price) {
        const currencySymbol = getCurrencySymbol(templateData.currency);
        updateContent(
          ['.product-price', '.price'],
          `${currencySymbol}${templateData.price}`
        );
      }

      // Update description (allowing HTML)
      if (templateData.description) {
        updateContent(
          ['.product-description', '.description-text', '.description'],
          templateData.description,
          'html'
        );
      }

      // Update technical specifications
      const specsContainer = doc.querySelector('.specs-container, .specifications');
      if (specsContainer && templateData.specs.length > 0) {
        const specsHtml = templateData.specs.map(spec => `
          <div class="spec-item">
            <span class="spec-label">${spec.label}:</span>
            <span class="spec-value">${spec.value}</span>
          </div>
        `).join('');
        specsContainer.innerHTML = specsHtml;
      }

      // Update company sections
      const companySections = doc.querySelectorAll('.company-section');
      if (companySections.length > 0 && templateData.companyInfo.length > 0) {
        companySections.forEach((section, index) => {
          if (index < templateData.companyInfo.length) {
            const data = templateData.companyInfo[index];
            
            // Update SVG/icon
            const iconContainer = section.querySelector('.icon-container');
            if (iconContainer) {
              iconContainer.innerHTML = data.svg || '';
            }
            
            // Update title and description
            const title = section.querySelector('h3, .company-title');
            if (title) {
              title.textContent = data.title;
            }
            
            const desc = section.querySelector('p, .company-description');
            if (desc) {
              desc.textContent = data.description;
            }
          }
        });
      }

      // Update gallery section if it exists
      const galleryContainer = doc.querySelector('.gallery, .product-gallery');
      if (galleryContainer && templateData.images.length > 0) {
        const newGalleryHtml = generateGallerySection(templateData.images);
        const tempDoc = parser.parseFromString(newGalleryHtml, 'text/html');
        const newGallery = tempDoc.querySelector('.gallery, .product-gallery');
        if (newGallery) {
          // Preserve classes and attributes
          const originalClasses = galleryContainer.getAttribute('class')?.split(' ') || [];
          const newClasses = newGallery.getAttribute('class')?.split(' ') || [];
          const mergedClasses = Array.from(new Set([...originalClasses, ...newClasses]));
          newGallery.setAttribute('class', mergedClasses.join(' '));
          
          // Copy any data attributes
          Array.from(galleryContainer.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              newGallery.setAttribute(attr.name, attr.value);
            }
          });
          
          galleryContainer.replaceWith(newGallery);
        }
      }

      // Update the generated HTML with all changes
      setGeneratedHtml(doc.documentElement.outerHTML);
    } catch (error) {
      console.error('Error updating preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the preview.',
        variant: 'destructive'
      });
    }
  };

  // Handle template import
  const handleTemplateImport = (data: TemplateData) => {
    setTemplateData(data);
    generatePreview(data);
  };

  // Handle SVG editing
  const handleEditSvg = (svg: string, sectionId: string) => {
    setCurrentSvgData({ svg, sectionId });
    setShowSvgEditor(true);
  };

  const saveSvgChanges = (svg: string) => {
    const updatedCompanyInfo = templateData.companyInfo.map(section => {
      if (section.id === currentSvgData.sectionId) {
        return { ...section, svg };
      }
      return section;
    });
    
    handleSectionUpdate({ companyInfo: updatedCompanyInfo });
    setShowSvgEditor(false);
  };

  // Update template data
  const handleSectionUpdate = (updates: Partial<TemplateData>) => {
    setTemplateData(prev => {
      const updated = { ...prev, ...updates };
      generatePreview(updated);
      return updated;
    });
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
      description: 'The template has been downloaded.',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <h1 className="text-2xl font-bold">Template Editor</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportTemplate}>
            Export Template
          </Button>
          <Button onClick={() => setShowSectionSelector(true)}>
            <Zap className="w-4 h-4 mr-2" />
            AI Sections
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EditorTab)}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="title">Title</TabsTrigger>
                  <TabsTrigger value="description">Desc</TabsTrigger>
                  <TabsTrigger value="specs">Specs</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
              </Tabs>
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
                  onEditSvg={handleEditSvg}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <PreviewPanel 
            html={generatedHtml}
            previewMode={previewMode}
            onChangePreviewMode={setPreviewMode}
            onRefresh={() => generatePreview(templateData)}
            onUpdateHtml={(newHtml) => setGeneratedHtml(newHtml)}
          />
        </div>
      </div>

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

      {showSvgEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <SvgEditor
              svg={currentSvgData.svg}
              onSave={saveSvgChanges}
              onClose={() => setShowSvgEditor(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
