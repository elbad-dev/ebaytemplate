import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { generateTemplate } from '../utils/templateGenerator';
import { parseTemplate } from '../utils/templateParser';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, DownloadCloud, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import TemplateHistory from './TemplateHistory';

interface TemplateEditorProps {
  template?: Template;
  onBack?: () => void;
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
  const [showSvgEditor, setShowSvgEditor] = useState(false);
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [currentSvgData, setCurrentSvgData] = useState({ svg: '', sectionId: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  
  // Initialize with template if provided
  useEffect(() => {
    if (template) {
      try {
        // Parse the template HTML to extract editable data
        const extractedData = parseTemplate(template.html);
        setTemplateData(extractedData);
        setGeneratedHtml(template.html);
      } catch (error) {
        console.error('Error parsing template:', error);
        toast({
          title: 'Error',
          description: 'Failed to parse the template. It may be in an unsupported format.',
          variant: 'destructive'
        });
      }
    }
  }, [template, toast]);

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
    // Create a deep copy to ensure we don't lose nested data like images
    const updatedData = { 
      ...templateData, 
      ...partialData,
      // Special handling to ensure images are properly preserved
      images: partialData.images || [...templateData.images] 
    };
    setTemplateData(updatedData);
    generatePreview(updatedData);
    
    // Check if we should auto-save (only if we're editing an existing template)
    if (template?.id) {
      const now = new Date();
      // Auto-save every 2 minutes
      if (!lastAutoSaveTime || (now.getTime() - lastAutoSaveTime.getTime() > 2 * 60 * 1000)) {
        autoSaveTemplate(updatedData);
      }
    }
  };
  
  // Auto-save the template as a new version
  const autoSaveTemplate = async (data: TemplateData) => {
    if (!template?.id || !generatedHtml) return;
    
    try {
      const response = await apiRequest('POST', `/api/templates/${template.id}/versions`, {
        name: template.name,
        html: generatedHtml,
        description: template.description,
        version_type: 'autosave',
      });
      
      if (response.ok) {
        setLastAutoSaveTime(new Date());
        console.log('Template auto-saved');
        
        // Show a subtle toast notification
        toast({
          title: 'Auto-saved',
          description: `Changes saved automatically at ${new Date().toLocaleTimeString()}`,
          variant: 'default',
          duration: 2000, // shorter duration for auto-save notifications
        });
      }
    } catch (error) {
      console.error('Failed to auto-save template:', error);
    }
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
      company_name: '',
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
            {/* History button - only show for existing templates with ID */}
            {template && template.id && (
              <TemplateHistory
                templateId={template.id}
                onRestoreVersion={(html) => {
                  try {
                    const extractedData = parseTemplate(html);
                    setTemplateData(extractedData);
                    setGeneratedHtml(html);
                    toast({
                      title: 'Version restored',
                      description: 'The template has been restored to the selected version',
                    });
                  } catch (error) {
                    console.error('Error parsing template version:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to restore template version',
                      variant: 'destructive'
                    });
                  }
                }}
              />
            )}
            <Button 
              variant="outline" 
              onClick={handleNewTemplate}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              New Template
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                if (window.confirm("Are you sure you want to reset all changes? This will revert to the original template or clear all fields if you're creating a new template.")) {
                  if (template) {
                    // If we have an original template, revert to it
                    try {
                      const extractedData = parseTemplate(template.html);
                      setTemplateData(extractedData);
                      setGeneratedHtml(template.html);
                      toast({
                        title: 'Template reset',
                        description: 'Changes have been reverted to the original template',
                      });
                    } catch (error) {
                      console.error('Error parsing template:', error);
                      toast({
                        title: 'Error',
                        description: 'Failed to reset template',
                        variant: 'destructive'
                      });
                    }
                  } else {
                    // If we're creating a new template, clear everything
                    handleNewTemplate();
                    toast({
                      title: 'Template reset',
                      description: 'All fields have been cleared',
                    });
                  }
                }
              }}
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              Reset Changes
            </Button>
            {template?.id ? (
              <Button 
                onClick={async () => {
                  if (!template?.id || !generatedHtml) return;
                  
                  setIsSaving(true);
                  try {
                    const response = await apiRequest('POST', `/api/templates/${template.id}/versions`, {
                      name: template.name,
                      html: generatedHtml,
                      description: template.description,
                      version_type: 'update',
                    });
                    
                    if (response.ok) {
                      // Also update the template itself
                      await apiRequest('PUT', `/api/templates/${template.id}`, {
                        name: template.name,
                        html: generatedHtml,
                        description: template.description,
                      });
                      
                      setLastAutoSaveTime(new Date());
                      toast({
                        title: 'Template saved',
                        description: 'Your changes have been saved and a new version created'
                      });
                    } else {
                      throw new Error('Failed to save template');
                    }
                  } catch (error) {
                    toast({
                      title: 'Error saving template',
                      description: 'There was a problem saving your changes',
                      variant: 'destructive'
                    });
                    console.error('Failed to save template:', error);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
            ) : (
              <Button 
                onClick={handleExportTemplate}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
              >
                Export Template
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      try {
                        const response = await fetch('/api/upload/html', {
                          method: 'POST',
                          body: formData
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          const templateData = parseTemplate(data.content);
                          setTemplateData(templateData);
                          generatePreview(templateData);
                          toast({
                            title: 'Template imported',
                            description: 'You can now edit the template content',
                          });
                        } else {
                          throw new Error('Failed to upload file');
                        }
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
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-gray-50 px-2 text-gray-500">OR</span>
                </div>
              </div>
              
              <textarea 
                className="w-full p-2 border rounded-md text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Paste your HTML code here..."
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    try {
                      const templateData = parseTemplate(e.target.value);
                      setTemplateData(templateData);
                      generatePreview(templateData);
                      toast({
                        title: 'Template imported',
                        description: 'You can now edit the template content',
                      });
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
              <div className="flex flex-wrap">
                <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as EditorTab)}>
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="images" className="text-xs sm:text-sm">
                      Images
                    </TabsTrigger>
                    <TabsTrigger value="title" className="text-xs sm:text-sm">
                      Info
                    </TabsTrigger>
                    <TabsTrigger value="description" className="text-xs sm:text-sm">
                      Desc
                    </TabsTrigger>
                    <TabsTrigger value="specs" className="text-xs sm:text-sm">
                      Specs
                    </TabsTrigger>
                    <TabsTrigger value="company" className="text-xs sm:text-sm">
                      About
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
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

      {/* Manual Section Selector Modal */}
      {showSectionSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-6xl bg-white rounded-lg shadow-xl">
            <TemplateSectionSelector
              htmlContent={generatedHtml}
              templateData={templateData}
              onUpdate={updateTemplateData}
              onClose={() => setShowSectionSelector(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
