import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TemplateStyle } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

// Helper function to get background gradient based on style
function getStyleBackground(style: string): string {
  switch (style) {
    case 'modern':
      return 'from-blue-500 to-indigo-600';
    case 'minimalist':
      return 'from-gray-700 to-gray-900';
    case 'bold':
      return 'from-red-500 to-purple-600';
    case 'elegant':
      return 'from-amber-700 to-rose-800';
    case 'classic':
      return 'from-green-700 to-teal-800';
    default:
      return 'from-blue-500 to-purple-600';
  }
}

interface TemplateStyleSelectorProps {
  onStyleSelect: (style: TemplateStyle) => void;
  selectedStyleId?: number;
}

export default function TemplateStyleSelector({ onStyleSelect, selectedStyleId }: TemplateStyleSelectorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch template styles from API
  const { data: styles, isLoading, error } = useQuery({
    queryKey: ['/api/template-styles'],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load template styles. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Group styles by type for the tabs
  const stylesByType: Record<string, TemplateStyle[]> = {};
  
  if (styles && Array.isArray(styles)) {
    styles.forEach((style: TemplateStyle) => {
      if (!stylesByType[style.type]) {
        stylesByType[style.type] = [];
      }
      stylesByType[style.type].push(style);
    });
  }

  // Create tabs for each style type
  const typeTabs = Object.keys(stylesByType).map(type => (
    <TabsTrigger key={type} value={type} className="capitalize">
      {type}
    </TabsTrigger>
  ));

  // Create style cards for the active tab
  const renderStyleCards = (stylesArray: any) => {
    // Ensure we have a valid array of styles
    if (!stylesArray || !Array.isArray(stylesArray) || stylesArray.length === 0) {
      return <div className="text-center py-6">No template styles found.</div>;
    }

    const filteredStyles = activeTab === 'all' 
      ? stylesArray 
      : stylesArray.filter((style: TemplateStyle) => style.type === activeTab);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStyles.map((style: TemplateStyle) => (
          <Card 
            key={style.id} 
            className={`overflow-hidden cursor-pointer transition-all ${selectedStyleId === style.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            onClick={() => onStyleSelect(style)}
          >
            <div className="h-40 overflow-hidden bg-muted">
              {/* We'll always show a styled preview */}
              <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getStyleBackground(style.style)}`}>
                <div className="text-white font-medium mb-2">{style.name}</div>
                <div className="text-xs text-white/80 px-3 py-1 rounded-full bg-black/20">{style.style} style</div>
              </div>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">{style.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              <p>{style.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-sm capitalize">
                  {style.style}
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-sm capitalize">
                  {style.colorScheme}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                variant={selectedStyleId === style.id ? "default" : "outline"} 
                size="sm" 
                className="w-full"
              >
                {selectedStyleId === style.id ? "Selected" : "Use this style"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Choose a Template Style</h2>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Styles</TabsTrigger>
          {typeTabs}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-2">
          {renderStyleCards(styles)}
        </TabsContent>
      </Tabs>
    </div>
  );
}