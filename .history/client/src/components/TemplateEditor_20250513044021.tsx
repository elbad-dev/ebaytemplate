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
      generatePreview(updated);
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
    generatePreview({ ...data, title: extractedTitle });
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

  // Generate preview with updated content
  const generatePreview = (templateData: TemplateData) => {
    // Always use the latest HTML if available, otherwise generate from scratch
    let baseHtml = generatedHtml || template?.html || '';
    if (!baseHtml) {
      setGeneratedHtml(generateTemplate(templateData));
      return;
    }
    try {
      const parser = new DOMParser();
      let doc = parser.parseFromString(baseHtml, 'text/html');

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

      // Update text content using custom selectors if provided
      updateContent(
        templateData.titleSelector ? [templateData.titleSelector] : ['.product-title', '.product-name', '.title', 'h1.title', '.product-info h1'],
        templateData.title
      );

      // Update company name (brand-text h1)
      updateContent(
        templateData.companyNameSelector
          ? [templateData.companyNameSelector]
          : ['.brand-text h1'],
        templateData.company_name
      );

      // Update company slogan (brand-text p)
      updateContent(
        templateData.subtitleSelector
          ? [templateData.subtitleSelector]
          : ['.brand-text p'],
        templateData.subtitle
      );

      // Price formatting with currency
      if (templateData.price) {
        const currencySymbol = getCurrencySymbol(templateData.currency);
        updateContent(
          templateData.priceSelector ? [templateData.priceSelector] : ['.price', '.product-price', '.item-price'],
          `${currencySymbol}${templateData.price}`
        );
      }

      // Update description with HTML
      updateContent(
        templateData.descriptionSelector ? [templateData.descriptionSelector] : ['.product-description', '.description', '.description-text', '.item-description'],
        templateData.description,
        'html'
      );

      // Update technical specifications (regenerate .tech-data .tech-list)
      const techList = doc.querySelector('.tech-data .tech-list');
      if (techList) {
        techList.innerHTML = (templateData.specs || []).map(spec => `
          <div class="tech-item">
            <span class="tech-label">${spec.label}</span>
            <span class="tech-value">${spec.value}</span>
          </div>
        `).join('');
      }
      // Update technical image in .tech-data .tech-image-container img
      const techImg = doc.querySelector('.tech-data .tech-image-container img');
      if (techImg && templateData.techImage) {
        techImg.setAttribute('src', templateData.techImage);
      }

      // Update product details (update only relevant elements in .product-info .card:first-child)
      const productInfoCard = doc.querySelector('.product-info .card:first-child');
      if (productInfoCard) {
        // Product Title
        const titleElem = productInfoCard.querySelector('h2');
        if (titleElem && templateData.title) {
          titleElem.textContent = templateData.title;
        }
        // Tags
        const tagsElem = productInfoCard.querySelector('.tags');
        if (tagsElem) {
          tagsElem.innerHTML = (templateData.tags || []).map(tag => `<span class="tag">${tag.label}</span>`).join('');
        }
        // Price
        const priceElem = productInfoCard.querySelector('.price');
        if (priceElem && templateData.price) {
          priceElem.textContent = getCurrencySymbol(templateData.currency) + templateData.price;
        }
        // Price Note
        const priceNoteElem = productInfoCard.querySelector('.price-note');
        if (priceNoteElem) {
          priceNoteElem.textContent = templateData.priceNote || '';
        }
        // Cart Button
        const cartBtn = productInfoCard.querySelector('.button-cart');
        if (cartBtn && templateData.cartButtonText) {
          cartBtn.textContent = templateData.cartButtonText;
        }
        // Buy Button
        const buyBtn = productInfoCard.querySelector('.button-primary');
        if (buyBtn && templateData.buyButtonText) {
          buyBtn.textContent = templateData.buyButtonText;
        }
      }

      // Update product description in the second .product-info .card (with heading 'Produktbeschreibung')
      const productInfoCards = doc.querySelectorAll('.product-info .card');
      if (productInfoCards.length > 1) {
        const descCard = productInfoCards[1];
        // Update the title of the description
        const descTitleElem = descCard.querySelector('h2');
        if (descTitleElem && templateData.descriptionTitle) {
          descTitleElem.textContent = templateData.descriptionTitle;
        }
        // Update the description content (first div inside the card)
        const descContentElem = descCard.querySelector('div');
        if (descContentElem) {
          descContentElem.innerHTML = templateData.description || '';
        }
      }

      // Update company sections (regenerate .info-cards for your template)
      const infoCards = doc.querySelector('.info-cards');
      if (infoCards) {
        infoCards.innerHTML = templateData.companyInfo.map(info => `
          <div class="card">
            <div class="info-icon">${info.svg || ''}</div>
            <h3 style="font-weight: 600; margin: 0.5rem 0;">${info.title}</h3>
            <p style="font-size: 0.875rem; color: var(--muted);">${info.description}</p>
          </div>
        `).join('');
      }

      // Update gallery section
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

      // Always set the src attribute of .brand-info img to the latest templateData.logo (even if it is the same as before)
      const logoImg = doc.querySelector('.brand-info img');
      if (logoImg) {
        if (typeof templateData.logo === 'string' && templateData.logo.trim()) {
          logoImg.setAttribute('src', templateData.logo);
        }
        // Set logo size from templateData.logoSize or fallback to 1.5rem
        const logoSize = templateData.logoSize || '1.5rem';
        logoImg.setAttribute('alt', 'Company Logo');
        logoImg.setAttribute('style', `height: ${logoSize}; width: auto; object-fit: contain;`);
      }

      // Add ids to main sections:
      // Product Title
      const titleElem = doc.querySelector('.product-info .card:first-child h2');
      if (titleElem) titleElem.id = 'product-title';
      // Product Description
      // Use the already declared productInfoCards above
      if (productInfoCards && productInfoCards.length > 1) {
        const descCard = productInfoCards[1];
        descCard.id = 'product-description';
      }
      // Tech Specs
      const techSpecsCard = doc.querySelector('.tech-data');
      if (techSpecsCard) techSpecsCard.id = 'tech-specs';
      // Company Info
      const companyInfoSection = doc.querySelector('.company-info');
      if (companyInfoSection) companyInfoSection.id = 'company-info';

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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
        <div className="flex gap-2 mt-4">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="py-4">Back</Button>
          )}
          <Button onClick={handleExportTemplate} className="py-4">Export Template</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-1 space-y-5">
          {/* Editable export file name input */}
          <div className="mb-2">
            <label htmlFor="export-filename" className="block text-xs font-semibold text-gray-600 mb-1">Export file name</label>
            <input
              id="export-filename"
              type="text"
              className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={exportFileName}
              onChange={e => setExportFileName(e.target.value)}
              placeholder="Enter export file name"
            />
            <span className="text-xs text-gray-400">.html will be added automatically</span>
          </div>

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
                        handleTemplateImport(templateData, file.name, text);
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
                <ProductDetailsEditor 
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
        <div className="lg:col-span-3 flex flex-col">
          <div style={{
            height: '80vh', // Expand height to 80% of viewport
            minHeight: '500px',
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'auto',
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            padding: '1.5rem',
            margin: '0 auto',
            width: '98%', // Slightly increase width
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}>
            <PreviewPanel 
              html={generatedHtml}
              previewMode={previewMode}
              onChangePreviewMode={setPreviewMode}
              onRefresh={() => generatePreview(templateData)}
            />
          </div>
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

      {/* SVG Editor Modal */}
      {showSvgEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <SvgEditor 
              svg={currentSvgData.svg}
              sectionId={currentSvgData.sectionId}
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
