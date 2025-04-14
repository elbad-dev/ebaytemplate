import React, { useState } from 'react';
import { Template, TemplateData } from '@shared/schema';
import WelcomeScreen from '@/components/WelcomeScreen';
import TemplateEditor from '@/components/TemplateEditor';
import TemplateLibrary from '@/components/TemplateLibrary';
import TemplateGenerator from '@/components/TemplateGenerator';
import TemplateUploader from '@/components/TemplateUploader';

type AppView = 'welcome' | 'editor' | 'library' | 'generator' | 'uploader';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Handle welcome screen actions
  const handleImportTemplate = () => {
    setCurrentView('uploader');
  };
  
  const handleCreateNewTemplate = () => {
    setCurrentView('generator');
  };
  
  const handleBrowseTemplates = () => {
    setCurrentView('library');
  };
  
  // Handle template selection from library
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentView('editor');
  };
  
  // Handle template import
  const handleTemplateImport = (data: TemplateData) => {
    // In a real implementation, we would save this to the server first
    // For now, we'll simulate a template object
    const newTemplate: Template = {
      id: 0, // Will be assigned by the server
      name: data.title || 'Imported Template',
      html: data.rawHtml || '',
      userId: null,
      createdAt: new Date().toISOString(),
      styleId: null
    };
    
    setSelectedTemplate(newTemplate);
    setCurrentView('editor');
  };
  
  // Handle new template generation
  const handleTemplateGenerated = (templateData: TemplateData, html: string) => {
    // In a real implementation, this would be handled by the server
    // For now, we'll simulate a template object
    const newTemplate: Template = {
      id: 0, // Will be assigned by the server
      name: templateData.title || 'Generated Template',
      html: html,
      userId: null,
      createdAt: new Date().toISOString(),
      styleId: templateData.templateStyleId || null
    };
    
    setSelectedTemplate(newTemplate);
    setCurrentView('editor');
  };
  
  // Return to welcome screen
  const handleBackToWelcome = () => {
    setCurrentView('welcome');
    setSelectedTemplate(null);
  };
  
  // Render the current view
  const renderCurrentView = (): React.ReactNode => {
    switch (currentView) {
      case 'welcome':
        return (
          <WelcomeScreen 
            onImportTemplate={handleImportTemplate}
            onCreateNewTemplate={handleCreateNewTemplate}
            onBrowseTemplates={handleBrowseTemplates}
          />
        );
      case 'editor':
        if (!selectedTemplate) {
          handleBackToWelcome();
          return null;
        }
        return <TemplateEditor template={selectedTemplate} onBack={handleBackToWelcome} />;
      case 'library':
        return (
          <TemplateLibrary 
            onSelectTemplate={handleSelectTemplate}
            onBackToWelcome={handleBackToWelcome}
          />
        );
      case 'generator':
        return (
          <TemplateGenerator 
            onTemplateGenerated={handleTemplateGenerated}
          />
        );
      case 'uploader':
        return (
          <div className="container mx-auto py-6">
            <button 
              className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleBackToWelcome}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Back to Welcome
            </button>
            <div className="max-w-xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">Import Template</h1>
              <TemplateUploader onTemplateImport={handleTemplateImport} />
            </div>
          </div>
        );
      default:
        handleBackToWelcome();
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentView()}
    </div>
  );
}