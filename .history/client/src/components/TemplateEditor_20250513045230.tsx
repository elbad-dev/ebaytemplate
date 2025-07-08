import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditorTab, PreviewMode, TemplateData } from '../types';
import { Template } from '@shared/schema';
import PreviewPanel from './PreviewPanel';
import ImageEditor from './ImageEditor';
import ProductDetailsEditor from './ProductDetailsEditor';
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
  const [showSvgEditor, setShowSvgEditor] = useState(false);
  const [currentSvgData, setCurrentSvgData] = useState({ svg: '', sectionId: '' });
  // --- Scroll to last edited section logic ---
  const [lastEditedSection, setLastEditedSection] = useState<string | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const [exportFileName, setExportFileName] = useState<string>('');

  // Helper: Map editor tab to preview section id
  const getSectionId = (tab: EditorTab) => {
    switch (tab) {
      case 'title': return 'product-title';
      case 'description': return 'product-description';
      case 'specs': return 'tech-specs';
      case 'company': return 'company-info';
      default: return null;
    }
  };

  // After preview HTML is updated, scroll to last edited section
  useEffect(() => {
    if (lastEditedSection && generatedHtml) {
      // Try to scroll in the preview panel (assume it's rendered in a div, not iframe)
      setTimeout(() => {
        const previewDoc = document;
        const el = previewDoc.getElementById(lastEditedSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100); // Delay to ensure DOM is updated
    }
  }, [generatedHtml, lastEditedSection]);

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

  // Update template data and trigger preview update
  const handleSectionUpdate = (updates: Partial<TemplateData>, sectionId?: string) => {
    setTemplateData(prev => {
      const updated = { ...prev, ...updates };
      generatePreview(updated as Required<TemplateData>);
      return updated;
    });
    if (sectionId) setLastEditedSection(sectionId);
  };

  // In handleTemplateImport or wherever you process uploaded template data:
  // Only update tags and priceNote if the user has not already changed them in the editor
  const handleTemplateImport = (data: TemplateData, fileName?: string, fileContent?: string) => {
    let extractedTitle = data.title;
    if (fileContent) {
      // Try to extract <title>...</title> from the HTML file
      const match = fileContent.match(/<title>(.*?)<\/title>/i);
      if (match && match[1]) {
        extractedTitle = match[1].trim();
      }
    }
    setTemplateData(prev => {
      return {
        ...prev,
        tags: (prev.tags && prev.tags.length > 0) ? prev.tags : data.tags,
        priceNote: (prev.priceNote && prev.priceNote.trim() !== '') ? prev.priceNote : data.priceNote,
        ...data,
        title: extractedTitle,
      };
    });
    if (fileName) {
      const name = fileName.replace(/\.[^.]+$/, '');
      setExportFileName(name);
    }
    generatePreview({ ...data, title: extractedTitle } as Required<TemplateData>);
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

  // Handle section editing from preview
  const handleSectionEdit = (sectionId: string, newContent: string) => {
    const sectionUpdates: Partial<TemplateData> = {};
    const generateId = () => `${sectionId}-${Date.now()}`;
    
    switch (sectionId) {
      case 'product-title':
      case 'product-subtitle':
        const titleDiv = document.createElement('div');
        titleDiv.innerHTML = newContent;
        sectionUpdates.title = titleDiv.querySelector('h1')?.textContent || '';
        sectionUpdates.subtitle = titleDiv.querySelector('p')?.textContent || '';
        break;
      case 'product-description':
        sectionUpdates.description = newContent;
        break;
      case 'tech-specs':
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newContent;
        const specItems = tempDiv.querySelectorAll('.tech-item');
        sectionUpdates.specs = Array.from(specItems).map(item => ({
          id: generateId(),
          label: item.querySelector('.tech-label')?.textContent || '',
          value: item.querySelector('.tech-value')?.textContent || ''
        }));
        break;
      case 'company-info':
        const companyDiv = document.createElement('div');
        companyDiv.innerHTML = newContent;
        const companyItems = companyDiv.querySelectorAll('.company-section');
        sectionUpdates.companyInfo = Array.from(companyItems).map(item => ({
          id: generateId(),
          title: item.querySelector('h3')?.textContent || '',
          description: item.querySelector('p')?.textContent || '',
          svg: item.querySelector('.icon-container')?.innerHTML || ''
        }));
        break;
    }

    setTemplateData(prev => ({
      ...prev,
      ...sectionUpdates
    }));
    
    setLastEditedSection(sectionId);
  };

  // Generate HTML preview from templateData and base template
  const generatePreview = async (data: Required<TemplateData>) => {
    if (!template?.html) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(template.html, 'text/html');

      // Helper function to safely update text content
      const updateTextContent = (selector: string, content: string | undefined) => {
        if (!content) return;
        const element = doc.querySelector(selector);
        if (element) {
          element.textContent = content;
        }
      };

      // Update basic fields
      updateTextContent('.product-title', data.title);
      updateTextContent('.company-name', data.company_name);

      // Update price with currency
      if (data.price) {
        const currencySymbol = getCurrencySymbol(data.currency);
        updateTextContent('.price', `${currencySymbol}${data.price}`);
      }

      // Update product description
      const description = doc.querySelector('.product-description');
      if (description && data.description) {
        description.innerHTML = data.description;
      }

      // Update tech specs list
      const techList = doc.querySelector('.tech-list');
      if (techList) {
        techList.innerHTML = data.specs.map(spec => `
          <div class="tech-item">
            <span class="tech-label">${spec.label}</span>
            <span class="tech-value">${spec.value}</span>
          </div>
        `).join('');
      }

      // Update company sections
      const companySections = doc.querySelectorAll('.company-section');
      companySections.forEach((section, index) => {
        const info = data.companyInfo[index];
        if (info) {
          const iconContainer = section.querySelector('.icon-container');
          const title = section.querySelector('h3');
          const desc = section.querySelector('p');
          
          if (iconContainer && info.svg) {
            iconContainer.innerHTML = info.svg;
          }
          if (title) title.textContent = info.title;
          if (desc) desc.textContent = info.description;
        }
      });

      // Update images gallery
      let html = doc.documentElement.outerHTML;
      if (data.images.length > 0) {
        html = replaceGallerySection(html, data.images.map(img => ({
          url: img.url,
          alt: data.title
        })));
      }

      setGeneratedHtml(html);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the preview',
        variant: 'destructive'
      });
    }
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
    const fileName = exportFileName ? exportFileName : (templateData.title || 'template');
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\s+/g, '-').toLowerCase()}_ebay-template.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Template exported',
      description: 'Your template has been downloaded',
    });
  };

  useEffect(() => {
    const handleHtmlEdit = (e: any) => {
      if (e.detail && e.detail.html) {
        setGeneratedHtml(e.detail.html);
        // Optionally, update templateData.rawHtml or other fields if needed
      }
    };
    window.addEventListener('previewHtmlEdit', handleHtmlEdit);
    return () => window.removeEventListener('previewHtmlEdit', handleHtmlEdit);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mr-2">
            Back
          </Button>
        )}
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EditorTab)}>
          <TabsList>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="title">Title & Price</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Technical Data</TabsTrigger>
            <TabsTrigger value="company">Company Info</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        <Card className="overflow-y-auto">
          <CardContent className="p-6">
            {activeTab === 'images' && (
              <ImageEditor data={templateData} onUpdate={handleSectionUpdate} />
            )}
            {activeTab === 'title' && (
              <ProductDetailsEditor data={templateData} onUpdate={handleSectionUpdate} />
            )}
            {activeTab === 'description' && (
              <ProductDescriptionEditor data={templateData} onUpdate={handleSectionUpdate} />
            )}
            {activeTab === 'specs' && (
              <TechSpecsEditor data={templateData} onUpdate={handleSectionUpdate} />
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
        
        <PreviewPanel
          html={generatedHtml}
          previewMode={previewMode}
          onChangePreviewMode={setPreviewMode}
          onRefresh={() => generatePreview(templateData as Required<TemplateData>)}
          onSectionEdit={handleSectionEdit}
        />
      </div>

      {showSvgEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardContent className="p-6">
              <SvgEditor
                initialSvg={currentSvgData.svg}
                onSave={saveSvgChanges}
                onCancel={() => setShowSvgEditor(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
