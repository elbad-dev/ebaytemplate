import React, { useState } from 'react';
import { CompanySection } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import IconSelector from './IconSelector';
import { PlusCircle, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CompanySectionEditorProps {
  sections: CompanySection[];
  onChange: (sections: CompanySection[]) => void;
}

export default function CompanySectionEditor({ sections, onChange }: CompanySectionEditorProps) {
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  // Add a new empty section
  const addSection = () => {
    const newSection = {
      id: generateId(),
      title: 'New Section',
      description: 'Describe this section here.',
      cssSelector: '',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
    };
    onChange([...sections, newSection]);
  };
  
  // Remove a section by ID
  const removeSection = (id: string) => {
    onChange(sections.filter(section => section.id !== id));
  };
  
  // Update a section property
  const updateSection = (id: string, key: keyof CompanySection, value: string) => {
    onChange(sections.map(section => 
      section.id === id ? { ...section, [key]: value } : section
    ));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Company Sections</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          {showHelp ? "Hide Tips" : "Show Tips"}
        </Button>
      </div>
      
      {showHelp && (
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>About the Company Sections</AlertTitle>
          <AlertDescription className="text-sm mt-2 text-blue-700">
            <p>Company sections highlight key information about your business like shipping policies, warranty details, customer support or company values.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the <strong>Icon Selector</strong> to pick from a library of professional icons</li>
              <li>Customize icon colors to match your brand identity</li>
              <li>Keep section titles short and descriptive</li>
              <li>Use concise descriptions that highlight key benefits</li>
              <li>Add custom CSS selectors to target specific elements in your template</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {sections.map(section => (
          <Card key={section.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-gray-600"
              onClick={() => removeSection(section.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Section</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-shrink-0 w-full sm:w-24 mb-3 sm:mb-0">
                  <div
                    className="w-20 h-20 mx-auto flex items-center justify-center bg-gray-50 rounded-md border p-2"
                    dangerouslySetInnerHTML={{ __html: section.svg }}
                  />
                  <div className="mt-3 text-center">
                    <IconSelector
                      onIconSelect={(svg) => updateSection(section.id, 'svg', svg)}
                      onColorChange={(color) => {
                        const svgContent = section.svg;
                        const newSvg = svgContent.replace(/stroke="[^"]*"/, `stroke="${color}"`);
                        updateSection(section.id, 'svg', newSvg);
                      }}
                      currentIcon={section.svg}
                    />
                  </div>
                </div>
                
                <div className="flex-1 w-full space-y-3">
                  <div>
                    <Label htmlFor={`title-${section.id}`} className="block text-xs font-medium mb-1">Title</Label>
                    <Input
                      id={`title-${section.id}`}
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="Section Title"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${section.id}`} className="block text-xs font-medium mb-1">Description</Label>
                    <Textarea
                      id={`description-${section.id}`}
                      value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Section description"
                      className="w-full resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`selector-${section.id}`} className="block text-xs font-medium mb-1">CSS Selector</Label>
                    <Input
                      id={`selector-${section.id}`}
                      value={section.cssSelector || ''}
                      onChange={(e) => updateSection(section.id, 'cssSelector', e.target.value)}
                      placeholder=".company-section, #section-id, etc."
                      className="w-full font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        onClick={addSection}
        className="w-full py-6 border-dashed flex items-center justify-center gap-2"
      >
        <PlusCircle className="h-5 w-5" />
        Add New Section
      </Button>
    </div>
  );
}

// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}