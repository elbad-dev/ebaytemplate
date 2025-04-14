import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateData, type TemplateStyle } from '@shared/schema';
import { Sparkles, Palette, ThumbsUp, Loader2, Send } from 'lucide-react';
import { nanoid } from 'nanoid';

interface AITemplateRecommenderProps {
  templateData: TemplateData;
  onStyleSelect: (style: TemplateStyle) => void;
  onSuggestionsApplied: (updates: Partial<TemplateData>) => void;
}

export default function AITemplateRecommender({ 
  templateData, 
  onStyleSelect,
  onSuggestionsApplied
}: AITemplateRecommenderProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('colors');

  // Request AI-powered template suggestions based on company name and logo
  const fetchSuggestions = async () => {
    if (!templateData.title) {
      toast({
        title: 'Company name required',
        description: 'Please enter a company name first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/suggest-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: templateData.title,
          description: templateData.description || '',
          logoUrl: templateData.logo || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Error getting suggestions: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSuggestions(data.suggestions);
      
      toast({
        title: 'AI suggestions generated',
        description: 'Template suggestions have been created based on your company information',
      });
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: 'Error generating suggestions',
        description: error.message || 'Failed to get AI suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply all AI suggestions to the template
  const applyAllSuggestions = () => {
    if (!suggestions) return;
    
    const companyInfoWithIds = suggestions.companyInfo.map((section: any) => ({
      ...section,
      id: section.id || nanoid(8)
    }));
    
    onSuggestionsApplied({
      colorPrimary: suggestions.colorPrimary,
      colorSecondary: suggestions.colorSecondary,
      colorAccent: suggestions.colorAccent,
      colorBackground: suggestions.colorBackground,
      colorText: suggestions.colorText,
      companyInfo: companyInfoWithIds,
      ...(suggestions.description ? { description: suggestions.description } : {}),
    });
    
    toast({
      title: 'Suggestions applied',
      description: 'AI suggestions have been applied to your template',
    });
  };

  // Apply just the color scheme
  const applyColors = () => {
    if (!suggestions) return;
    
    onSuggestionsApplied({
      colorPrimary: suggestions.colorPrimary,
      colorSecondary: suggestions.colorSecondary,
      colorAccent: suggestions.colorAccent,
      colorBackground: suggestions.colorBackground,
      colorText: suggestions.colorText,
    });
    
    toast({
      title: 'Color scheme applied',
      description: 'AI-suggested colors have been applied to your template',
    });
  };

  // Apply just the company sections
  const applySections = () => {
    if (!suggestions || !suggestions.companyInfo) return;
    
    const companyInfoWithIds = suggestions.companyInfo.map((section: any) => ({
      ...section,
      id: section.id || nanoid(8)
    }));
    
    onSuggestionsApplied({
      companyInfo: companyInfoWithIds,
    });
    
    toast({
      title: 'Company sections applied',
      description: 'AI-suggested company sections have been applied to your template',
    });
  };

  // Apply the description if available
  const applyDescription = () => {
    if (!suggestions || !suggestions.description) return;
    
    onSuggestionsApplied({
      description: suggestions.description,
    });
    
    toast({
      title: 'Description applied',
      description: 'AI-enhanced company description has been applied',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
          AI Template Suggestions
        </h3>
        
        <Button
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="mr-1 h-4 w-4" />
              Get Suggestions
            </>
          )}
        </Button>
      </div>

      {suggestions ? (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Template Suggestions</CardTitle>
            <CardDescription>
              Based on your company name{templateData.logo ? ', logo,' : ''} 
              {templateData.description ? ' and description' : ''}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="colors" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="sections">Company Sections</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
              </TabsList>
              
              <TabsContent value="colors" className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <div 
                      className="h-16 rounded-md border"
                      style={{ backgroundColor: suggestions.colorPrimary }}
                    ></div>
                    <p className="text-xs mt-1 text-center">Primary</p>
                  </div>
                  <div>
                    <div 
                      className="h-16 rounded-md border"
                      style={{ backgroundColor: suggestions.colorSecondary }}
                    ></div>
                    <p className="text-xs mt-1 text-center">Secondary</p>
                  </div>
                  <div>
                    <div 
                      className="h-16 rounded-md border"
                      style={{ backgroundColor: suggestions.colorAccent }}
                    ></div>
                    <p className="text-xs mt-1 text-center">Accent</p>
                  </div>
                  <div>
                    <div 
                      className="h-16 rounded-md border"
                      style={{ backgroundColor: suggestions.colorBackground }}
                    ></div>
                    <p className="text-xs mt-1 text-center">Background</p>
                  </div>
                  <div>
                    <div 
                      className="h-16 rounded-md border"
                      style={{ backgroundColor: suggestions.colorText }}
                    ></div>
                    <p className="text-xs mt-1 text-center">Text</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={applyColors} size="sm">
                    <Palette className="mr-2 h-4 w-4" />
                    Apply Colors
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="sections" className="space-y-4">
                {suggestions.companyInfo && suggestions.companyInfo.map((section: any, index: number) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="p-4 grid grid-cols-[auto_1fr] gap-4">
                      <div 
                        className="flex items-center justify-center p-3 rounded-md"
                        style={{ backgroundColor: suggestions.colorPrimary + '20' }}
                        dangerouslySetInnerHTML={{ __html: section.svg }}
                      ></div>
                      <div>
                        <h4 className="font-medium">{section.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                
                <div className="flex justify-end">
                  <Button onClick={applySections} size="sm">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Apply Sections
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="description" className="space-y-4">
                {suggestions.description ? (
                  <>
                    <div className="border rounded-md p-4 text-sm">
                      {suggestions.description}
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={applyDescription} size="sm">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Apply Description
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No description suggestions available.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSuggestions(null)}>Cancel</Button>
            <Button onClick={applyAllSuggestions}>Apply All Suggestions</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="h-10 w-10 text-yellow-500 mb-4" />
            <h3 className="font-medium text-lg mb-2">AI-Powered Template Suggestions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-generated color schemes, company sections, and content improvements
              based on your company name{templateData.logo ? ', logo' : ''}{templateData.description ? ', and description' : ''}.
            </p>
            <Button 
              onClick={fetchSuggestions} 
              disabled={isLoading}
              variant="outline"
              className="mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}