import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateStyleSelector from './TemplateStyleSelector';
import ColorCustomizer from './ColorCustomizer';
import TitleEditor from './TitleEditor';
import ProductDescriptionEditor from './ProductDescriptionEditor';
import TechSpecsEditor from './TechSpecsEditor';
import CompanyEditor from './CompanyEditor';
import PreviewPanel from './PreviewPanel';
import { TemplateData, TemplateStyle } from '@shared/schema';
import { PreviewMode } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { nanoid } from 'nanoid';

interface TemplateGeneratorProps {
  onTemplateGenerated: (templateData: TemplateData, html: string) => void;
}

export default function TemplateGenerator({ onTemplateGenerated }: TemplateGeneratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('style');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  
  // Initial template data
  const [templateData, setTemplateData] = useState<TemplateData>({
    title: "Product Title",
    subtitle: "Product Subtitle",
    price: "1999.99",
    currency: "USD",
    description: "This is a sample product description. Replace this with your actual product details and information.",
    images: [],
    specs: [
      { id: nanoid(), label: "Brand", value: "Your Brand" },
      { id: nanoid(), label: "Model", value: "Product Model" },
      { id: nanoid(), label: "Dimensions", value: "10 x 5 x 2 inches" }
    ],
    companyInfo: [
      { 
        id: nanoid(), 
        title: "Quality Guarantee", 
        description: "All our products come with a 1-year warranty.",
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>'
      },
      { 
        id: nanoid(), 
        title: "Fast Shipping", 
        description: "We offer expedited shipping to most locations.",
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14c1.9 0 3 1.247 3 2.8V15a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7c0-1.5 1-3 3-3Z"></path><path d="M20 4v4"></path><path d="M4 4v4"></path><path d="M12 7v10"></path><path d="M8 7v10"></path><path d="M16 7v10"></path></svg>'
      },
      { 
        id: nanoid(), 
        title: "24/7 Support", 
        description: "Our customer service team is available around the clock.",
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h16a2 2 0 0 1 1.2.4"></path><path d="M2 10h20"></path><path d="M7 15h.01"></path><path d="M11 15h2"></path><path d="M16 5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2"></path></svg>'
      }
    ],
    colorPrimary: "#3498db",
    colorSecondary: "#2c3e50",
    colorAccent: "#e74c3c",
    colorBackground: "#ffffff",
    colorText: "#333333"
  });
  
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle | null>(null);
  
  // Update template data
  const handleTemplateUpdate = (updates: Partial<TemplateData>) => {
    setTemplateData(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Handle style selection
  const handleStyleSelect = (style: TemplateStyle) => {
    setSelectedStyle(style);
    handleTemplateUpdate({ templateStyleId: style.id });
  };
  
  // Reset colors to defaults
  const handleResetColors = () => {
    handleTemplateUpdate({
      colorPrimary: "#3498db",
      colorSecondary: "#2c3e50",
      colorAccent: "#e74c3c",
      colorBackground: "#ffffff",
      colorText: "#333333"
    });
  };
  
  // Handle section changes
  const handleEditSvg = (svg: string, sectionId: string) => {
    const updatedCompanyInfo = templateData.companyInfo.map(section => {
      if (section.id === sectionId) {
        return { ...section, svg };
      }
      return section;
    });
    
    handleTemplateUpdate({ companyInfo: updatedCompanyInfo });
  };
  
  // Generate preview based on current data
  const generatePreview = async () => {
    try {
      setLoading(true);
      
      // Make API request to generate template
      const response = await apiRequest('/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });
      
      const data = await response.json();
      setPreviewHtml(data.html);
      
      toast({
        title: 'Preview Generated',
        description: 'Template preview has been updated with your changes.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate template preview. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Create and save template 
  const createTemplate = async () => {
    try {
      setLoading(true);
      
      if (!previewHtml) {
        // Generate preview first if not already done
        await generatePreview();
      }
      
      // Make API request to save the template
      const response = await apiRequest('/api/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });
      
      const data = await response.json();
      
      toast({
        title: 'Template Created',
        description: 'Your template has been created successfully!'
      });
      
      // Call the callback with the generated template
      onTemplateGenerated(templateData, data.html);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create template. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Generate New Template</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generatePreview} 
            disabled={loading}
          >
            Update Preview
          </Button>
          <Button 
            onClick={createTemplate} 
            disabled={loading}
          >
            Create Template
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="bg-card border rounded-lg shadow-sm overflow-auto">
          <Tabs defaultValue="style" value={activeTab} onValueChange={setActiveTab} className="p-4">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="title">Title</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Specs</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>
            
            <div className="mt-4 pb-4">
              <TabsContent value="style" className="mt-0">
                <TemplateStyleSelector 
                  onStyleSelect={handleStyleSelect} 
                  selectedStyleId={templateData.templateStyleId}
                />
              </TabsContent>
              
              <TabsContent value="colors" className="mt-0">
                <ColorCustomizer 
                  data={templateData} 
                  onUpdate={handleTemplateUpdate}
                  onResetColors={handleResetColors}
                />
              </TabsContent>
              
              <TabsContent value="title" className="mt-0">
                <TitleEditor 
                  data={templateData} 
                  onUpdate={handleTemplateUpdate}
                />
              </TabsContent>
              
              <TabsContent value="description" className="mt-0">
                <ProductDescriptionEditor 
                  data={templateData} 
                  onUpdate={handleTemplateUpdate}
                />
              </TabsContent>
              
              <TabsContent value="specs" className="mt-0">
                <TechSpecsEditor 
                  data={templateData} 
                  onUpdate={handleTemplateUpdate}
                />
              </TabsContent>
              
              <TabsContent value="company" className="mt-0">
                <CompanyEditor 
                  data={templateData} 
                  onUpdate={handleTemplateUpdate}
                  onEditSvg={handleEditSvg}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <div className="bg-card border rounded-lg shadow-sm h-full">
          <PreviewPanel 
            html={previewHtml}
            previewMode={previewMode}
            onChangePreviewMode={setPreviewMode}
            onRefresh={generatePreview}
          />
        </div>
      </div>
    </div>
  );
}