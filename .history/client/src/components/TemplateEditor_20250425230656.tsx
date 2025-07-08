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
  onSave?: (templateHtml: string) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onSave }) => {
  const [templateData, setTemplateData] = useState<TemplateData>({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    images: [],
    specs: [],
    companyInfo: [],
    company_name: '',
    subtitle: '',
    logo: ''
  });

  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [activeTab, setActiveTab] = useState<EditorTab>('images');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [showSvgEditor, setShowSvgEditor] = useState(false);
  const [currentSvgData, setCurrentSvgData] = useState<{ svg: string; sectionId: string }>({ svg: '', sectionId: '' });
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const { toast } = useToast();

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

  // Generate preview
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

      // Update content based on type
      updateContent(
        ['.product-title', '.product-name', '.title', 'h1.title', '.product-info h1', '.main-title'],
        templateData.title
      );

      updateContent(
        ['.company-name', '.brand-name', '.merchant-name', '.business-name'],
        templateData.company_name
      );

      updateContent(
        ['.company-slogan', '.brand-slogan', '.subtitle', '.merchant-slogan', '.business-subtitle'],
        templateData.subtitle
      );

      // Price formatting with currency
      if (templateData.price) {
        const currencySymbol = getCurrencySymbol(templateData.currency);
        updateContent(
          ['.price', '.product-price', '.item-price'],
          `${currencySymbol}${templateData.price}`
        );
      }

      // Update description (as HTML)
      updateContent(
        ['.product-description', '.description', '.description-text', '.item-description'],
        templateData.description,
        'html'
      );

      // Update specifications
      const specsContainer = doc.querySelector('.specs-container, .specifications, .tech-specs');
      if (specsContainer && templateData.specs.length > 0) {
        const specsHtml = templateData.specs.map(spec => `
          <div class="spec-item">
            <span class="spec-label">${spec.label}:</span>
            <span class="spec-value">${spec.value}</span>
          </div>
        `).join('');
        specsContainer.innerHTML = specsHtml;
      }

      // Update company info sections
      const companySections = doc.querySelectorAll('.company-section, .info-section, .feature-card');
      if (companySections.length > 0 && templateData.companyInfo.length > 0) {
        companySections.forEach((section, index) => {
          if (index < templateData.companyInfo.length) {
            const info = templateData.companyInfo[index];
            
            // Update SVG/icon
            const iconContainer = section.querySelector('.icon-container, .section-icon, .info-icon');
            if (iconContainer && info.svg) {
              iconContainer.innerHTML = info.svg;
            }
            
            // Update title
            const title = section.querySelector('h3, h4, .section-title, .info-title');
            if (title) {
              title.textContent = info.title;
            }
            
            // Update description
            const desc = section.querySelector('p, .section-description, .info-description');
            if (desc) {
              desc.textContent = info.description;
            }
          }
        });
      }

      // Update images/gallery section
      if (templateData.images.length > 0) {
        const galleryContainer = doc.querySelector('.gallery, .product-gallery, .image-gallery');
        if (galleryContainer) {
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
      }

      // Update the generated HTML
      const updatedHtml = doc.documentElement.outerHTML;
      setGeneratedHtml(updatedHtml);

      // Call onSave if provided
      if (onSave) {
        onSave(updatedHtml);
      }
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
  const handleTemplateImport = (newTemplateData: TemplateData) => {
    setTemplateData(newTemplateData);
    generatePreview(newTemplateData);
    toast({
      title: 'Template imported',
      description: 'You can now edit the template content',
    });
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

  // Handle section updates
  const handleSectionUpdate = (updates: Partial<TemplateData>) => {
    const updatedData = { ...templateData, ...updates };
    setTemplateData(updatedData);
    generatePreview(updatedData);
  };

  // Export template
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
    <div className="grid lg:grid-cols-3 gap-4 h-full">
      {/* Editor Panel */}
      <div>
        <Card className="h-full">
          <div className="p-4 border-b border-gray-200">
            <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as EditorTab)}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="title">Title</TabsTrigger>
                <TabsTrigger value="description">Desc</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="sections">
                  <Zap className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <CardContent className="p-4">
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

      {/* Preview Panel */}
      <PreviewPanel 
        html={generatedHtml}
        previewMode={previewMode}
        onChangePreviewMode={setPreviewMode}
        onRefresh={() => generatePreview(templateData)}
        onUpdateHtml={(newHtml) => {
          setGeneratedHtml(newHtml);
          if (onSave) onSave(newHtml);
        }}
      />

      {/* SVG Editor Dialog */}
      {showSvgEditor && (
        <SvgEditor
          svg={currentSvgData.svg}
          onSave={saveSvgChanges}
          onClose={() => setShowSvgEditor(false)}
        />
      )}

      {/* Section Selector Dialog */}
      {showSectionSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
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
