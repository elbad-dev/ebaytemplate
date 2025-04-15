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
  
  // Add a new empty section with appropriate naming based on position
  const addSection = () => {
    // Default section titles based on common Über Uns (About Us) section topics
    const defaultTitles = [
      'Kostenloser Versand',
      'Qualitätsgarantie',
      'Kundensupport',
      'Sichere Zahlung',
      'Schnelle Lieferung',
      'Einfache Rückgabe'
    ];
    
    // Get the next default title or use a generic one if we've used all defaults
    const nextTitle = defaultTitles[sections.length % defaultTitles.length];
    
    const newSection = {
      id: generateId(),
      title: nextTitle,
      description: 'Beschreibung hier hinzufügen.',
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
        <h3 className="text-lg font-semibold">Über Uns Sektionen</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          {showHelp ? "Tipps ausblenden" : "Tipps anzeigen"}
        </Button>
      </div>
      
      {showHelp && (
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Über die "Über Uns" Sektionen</AlertTitle>
          <AlertDescription className="text-sm mt-2 text-blue-700">
            <p>Diese Sektionen heben wichtige Informationen über Ihr Unternehmen hervor, wie Versandrichtlinien, Garantiedetails, Kundensupport oder Unternehmenswerte.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Verwenden Sie den <strong>Icon-Selector</strong>, um aus einer Bibliothek professioneller Icons auszuwählen</li>
              <li>Passen Sie die Icon-Farben an Ihre Markenidentität an</li>
              <li>Halten Sie die Sektions-Titel kurz und beschreibend</li>
              <li>Verwenden Sie prägnante Beschreibungen, die die wichtigsten Vorteile hervorheben</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Section Editor Grid Layout */}
      <div className="grid gap-6">
        {/* First row - top 3 sections in 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.slice(0, 3).map(section => (
            <Card key={section.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-gray-600"
                onClick={() => removeSection(section.id)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs font-medium flex items-center space-x-2">
                  <span>Über Uns Sektion</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3 px-3 pb-3">
                {/* Icon section */}
                <div className="flex justify-center mb-1">
                  <div
                    className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-md border p-2"
                    dangerouslySetInnerHTML={{ __html: section.svg }}
                  />
                </div>
                
                <div className="flex justify-center mt-1 mb-2">
                  <IconSelector
                    onIconSelect={(svg) => updateSection(section.id, 'svg', svg)}
                    onColorChange={(color) => {
                      // Extract the current SVG and update its color
                      const svgContent = section.svg;
                      const newSvg = svgContent.replace(/stroke="[^"]*"/, `stroke="${color}"`);
                      updateSection(section.id, 'svg', newSvg);
                    }}
                    currentIcon={section.svg}
                  />
                </div>
                
                {/* Title input */}
                <div>
                  <Label htmlFor={`title-${section.id}`} className="text-xs font-medium">Titel</Label>
                  <Input
                    id={`title-${section.id}`}
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    placeholder="Titel der Sektion"
                    className="mt-1 py-1 text-sm"
                  />
                </div>
                
                {/* Description textarea */}
                <div>
                  <Label htmlFor={`description-${section.id}`} className="text-xs font-medium">Beschreibung</Label>
                  <Textarea
                    id={`description-${section.id}`}
                    value={section.description}
                    onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                    placeholder="Beschreibung der Sektion"
                    className="mt-1 resize-none text-sm"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Second row - remaining sections in 3 columns */}
        {sections.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.slice(3).map(section => (
              <Card key={section.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-gray-600"
                  onClick={() => removeSection(section.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-xs font-medium flex items-center space-x-2">
                    <span>Über Uns Sektion</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3 px-3 pb-3">
                  {/* Icon section */}
                  <div className="flex justify-center mb-1">
                    <div
                      className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-md border p-2"
                      dangerouslySetInnerHTML={{ __html: section.svg }}
                    />
                  </div>
                  
                  <div className="flex justify-center mt-1 mb-2">
                    <IconSelector
                      onIconSelect={(svg) => updateSection(section.id, 'svg', svg)}
                      onColorChange={(color) => {
                        // Extract the current SVG and update its color
                        const svgContent = section.svg;
                        const newSvg = svgContent.replace(/stroke="[^"]*"/, `stroke="${color}"`);
                        updateSection(section.id, 'svg', newSvg);
                      }}
                      currentIcon={section.svg}
                    />
                  </div>
                  
                  {/* Title input */}
                  <div>
                    <Label htmlFor={`title-${section.id}`} className="text-xs font-medium">Titel</Label>
                    <Input
                      id={`title-${section.id}`}
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="Titel der Sektion"
                      className="mt-1 py-1 text-sm"
                    />
                  </div>
                  
                  {/* Description textarea */}
                  <div>
                    <Label htmlFor={`description-${section.id}`} className="text-xs font-medium">Beschreibung</Label>
                    <Textarea
                      id={`description-${section.id}`}
                      value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Beschreibung der Sektion"
                      className="mt-1 resize-none text-sm"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Button 
        variant="outline" 
        onClick={addSection}
        className="w-full py-6 border-dashed flex items-center justify-center gap-2"
      >
        <PlusCircle className="h-5 w-5" />
        Neue Sektion hinzufügen
      </Button>
    </div>
  );
}

// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}