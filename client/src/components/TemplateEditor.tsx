import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import TemplateUploader from './TemplateUploader';
import { Image, TechSpec, CompanySection, EditorTab, PreviewMode, TemplateData } from '../types';
import PreviewPanel from './PreviewPanel';
import ImageEditor from './ImageEditor';
import TitleEditor from './TitleEditor';
import ProductDescriptionEditor from './ProductDescriptionEditor';
import TechSpecsEditor from './TechSpecsEditor';
import CompanyEditor from './CompanyEditor';
import SvgEditor from './SvgEditor';
import { generateTemplate } from '../utils/templateGenerator';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const TemplateEditor: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<EditorTab>('images');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [templateData, setTemplateData] = useState<TemplateData>({
    title: '',
    subtitle: '',
    price: '',
    currency: 'EUR',
    description: '',
    images: [],
    specs: [],
    companyInfo: []
  });
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [showSvgEditor, setShowSvgEditor] = useState(false);
  const [currentSvgData, setCurrentSvgData] = useState({ svg: '', sectionId: '' });

  // Handle template upload/import
  const handleTemplateImport = (newTemplateData: TemplateData) => {
    setTemplateData(newTemplateData);
    generatePreview(newTemplateData);
    toast({
      title: 'Template imported',
      description: 'You can now edit the template content',
    });
  };

  // Handle template data updates
  const updateTemplateData = (partialData: Partial<TemplateData>) => {
    const updatedData = { ...templateData, ...partialData };
    setTemplateData(updatedData);
    generatePreview(updatedData);
  };

  // Generate HTML preview
  const generatePreview = (data: TemplateData) => {
    const html = generateTemplate(data);
    setGeneratedHtml(html);
  };

  // Handle template export
  const handleExportTemplate = () => {
    if (!generatedHtml) {
      toast({
        title: 'No template to export',
        description: 'Please import or create a template first',
        variant: 'destructive',
      });
      return;
    }

    // Create a Blob with the HTML content
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateData.title.replace(/\s+/g, '-').toLowerCase()}_ebay-template.html`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Template exported',
      description: 'Your template has been downloaded',
    });
  };

  // Handle SVG editor
  const openSvgEditor = (svg: string, sectionId: string) => {
    setCurrentSvgData({ svg, sectionId });
    setShowSvgEditor(true);
  };

  const saveSvgChanges = (newSvg: string, sectionId: string) => {
    const updatedCompanyInfo = templateData.companyInfo.map(section => 
      section.id === sectionId ? { ...section, svg: newSvg } : section
    );
    updateTemplateData({ companyInfo: updatedCompanyInfo });
    setShowSvgEditor(false);
  };

  const handleNewTemplate = () => {
    setTemplateData({
      title: '',
      subtitle: '',
      price: '',
      currency: 'EUR',
      description: '',
      images: [],
      specs: [],
      companyInfo: []
    });
    setGeneratedHtml('');
    setActiveTab('images');
    toast({
      title: 'New template',
      description: 'Start by importing a template or adding content manually',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* App Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Template Editor</h1>
            <p className="text-sm text-gray-600">Edit your template without modifying HTML directly</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleNewTemplate}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              New Template
            </Button>
            <Button 
              variant="outline"
              disabled={!templateData.rawHtml}
              onClick={() => {
                if (templateData.rawHtml) {
                  updateTemplateData({});
                }
              }}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              Refresh Template
            </Button>
            <Button 
              onClick={handleExportTemplate}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
            >
              Save Template
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-1 space-y-5">
          {/* Template Upload Section */}
          <TemplateUploader onTemplateImport={handleTemplateImport} />
          
          {/* Editor Tabs */}
          <Card>
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button 
                  className={`tab-button ${activeTab === 'images' ? 'tab-button-active' : 'tab-button-inactive'}`}
                  onClick={() => setActiveTab('images')}
                >
                  Images
                </button>
                <button 
                  className={`tab-button ${activeTab === 'title' ? 'tab-button-active' : 'tab-button-inactive'}`}
                  onClick={() => setActiveTab('title')}
                >
                  Company name
                </button>
                <button 
                  className={`tab-button ${activeTab === 'description' ? 'tab-button-active' : 'tab-button-inactive'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`tab-button ${activeTab === 'specs' ? 'tab-button-active' : 'tab-button-inactive'}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Tech Specs
                </button>
                <button 
                  className={`tab-button ${activeTab === 'company' ? 'tab-button-active' : 'tab-button-inactive'}`}
                  onClick={() => setActiveTab('company')}
                >
                  About Us
                </button>
              </nav>
            </div>

            <CardContent className="p-0">
              {activeTab === 'images' && (
                <ImageEditor 
                  data={templateData}
                  onUpdate={updateTemplateData}
                />
              )}
              
              {activeTab === 'title' && (
                <TitleEditor 
                  data={templateData}
                  onUpdate={updateTemplateData}
                />
              )}
              
              {activeTab === 'description' && (
                <ProductDescriptionEditor 
                  data={templateData}
                  onUpdate={updateTemplateData}
                />
              )}
              
              {activeTab === 'specs' && (
                <TechSpecsEditor 
                  data={templateData}
                  onUpdate={updateTemplateData}
                />
              )}
              
              {activeTab === 'company' && (
                <CompanyEditor 
                  data={templateData}
                  onUpdate={updateTemplateData}
                  onEditSvg={openSvgEditor}
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
        />
      </div>

      {/* SVG Editor Modal */}
      {showSvgEditor && (
        <SvgEditor 
          svg={currentSvgData.svg}
          sectionId={currentSvgData.sectionId}
          onSave={saveSvgChanges}
          onClose={() => setShowSvgEditor(false)}
        />
      )}
    </div>
  );
};

export default TemplateEditor;
