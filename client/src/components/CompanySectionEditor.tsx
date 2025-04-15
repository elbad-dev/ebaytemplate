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
    // Default section titles based on common About Us section topics
    const defaultTitles = [
      'Free Shipping',
      'Quality Guarantee',
      'Customer Support',
      'Secure Payment',
      'Fast Delivery',
      'Easy Returns'
    ];
    
    // Default SVG icons that match the titles
    const defaultSvgs = [
      // Shipping icon
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15h14"/><path d="M5 8a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"/><circle cx="8" cy="18" r="2"/><path d="M10 18h4"/><circle cx="16" cy="18" r="2"/></svg>',
      
      // Quality shield icon
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>',
      
      // Support/headphones icon
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z"/><path d="M21 14h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z"/><path d="M8 14v1"/><path d="M16 14v1"/><path d="M3 16c0-2.8 0-4.7.9-6.1a6 6 0 0 1 1.5-1.9C7.2 6.2 9.6 6 12 6c2.4 0 4.8.2 6.6 2 .5.5 1 1.1 1.5 1.9.9 1.4.9 3.3.9 6.1"/></svg>',
      
      // Secure payment/lock icon
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      
      // Fast delivery icon
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3M18 16H9m-5 0H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2M18 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0m-9 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0m0 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0m-5 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0m9-14v4m0 0L9 7m4-1 3 1"/></svg>',
      
      // Returns icon
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>'
    ];
    
    // Get the next default title and matching SVG
    const index = sections.length % defaultTitles.length;
    const nextTitle = defaultTitles[index];
    const nextSvg = defaultSvgs[index];
    
    const newSection = {
      id: generateId(),
      title: nextTitle,
      description: 'Add description here.',
      svg: nextSvg
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
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Section Editor Grid Layout - One section per row */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-gray-600"
              onClick={() => removeSection(section.id)}
            >
              <X className="h-3 w-3" />
            </Button>
            
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <span>Company Section {index + 1}</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-4 pb-4">
              <div className="flex flex-row gap-6">
                {/* Left column with icon */}
                <div className="flex flex-col items-center space-y-2 w-24">
                  <div
                    className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-md border p-2"
                    dangerouslySetInnerHTML={{ __html: section.svg }}
                  />
                  
                  <div className="mt-1">
                    <IconSelector
                      onIconSelect={(svg) => updateSection(section.id, 'svg', svg)}
                      onColorChange={(color) => {
                        // Get a clean SVG from the IconSelector library with the new color
                        // Find what type of icon it is
                        const iconTypes = [
                          { id: 'truck', cat: 'business' },
                          { id: 'lock', cat: 'business' },
                          { id: 'headphones', cat: 'business' },
                          { id: 'shield', cat: 'business' },
                          { id: 'star', cat: 'product' },
                          { id: 'check', cat: 'product' },
                          { id: 'tool', cat: 'product' },
                          { id: 'chevron', cat: 'product' },
                          { id: 'globe', cat: 'company' },
                          { id: 'award', cat: 'company' },
                          { id: 'users', cat: 'company' },
                          { id: 'clock', cat: 'company' }
                        ];
                        
                        // Find which icon is being used 
                        let iconMatch = 'truck'; // Default
                        for(const icon of iconTypes) {
                          if(section.svg.includes(icon.id)) {
                            iconMatch = icon.id;
                            break;
                          }
                        }
                        
                        // Use regex to specifically target the stroke attribute
                        const newSvg = section.svg.replace(/stroke="[^"]*"/g, `stroke="${color}"`);
                        updateSection(section.id, 'svg', newSvg);
                      }}
                      currentIcon={section.svg}
                      currentColor={section.svg.match(/stroke="([^"]*)"/)?.[1] || "#3498db"}
                    />
                  </div>
                </div>
                
                {/* Right column with text fields */}
                <div className="flex-1 space-y-4">
                  {/* Title input */}
                  <div>
                    <Label htmlFor={`title-${section.id}`} className="text-sm font-medium">Title</Label>
                    <Input
                      id={`title-${section.id}`}
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="Section title"
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Description textarea */}
                  <div>
                    <Label htmlFor={`description-${section.id}`} className="text-sm font-medium">Description</Label>
                    <Textarea
                      id={`description-${section.id}`}
                      value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Section description"
                      className="mt-1 resize-none"
                      rows={3}
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