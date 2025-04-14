import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { TemplateData, TemplateStyle } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
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
  const [loading, setLoading] = useState(false);
  const [productDescription, setProductDescription] = useState('');
  const [recommendedStyles, setRecommendedStyles] = useState<TemplateStyle[]>([]);
  const [suggestedData, setSuggestedData] = useState<Partial<TemplateData> | null>(null);
  
  // Load available template styles
  useEffect(() => {
    async function fetchStyles() {
      try {
        const response = await apiRequest('/api/template-styles');
        const styles = await response.json();
        if (styles && styles.length > 0) {
          // Keep for recommendations
          setRecommendedStyles(styles);
        }
      } catch (error) {
        console.error('Error fetching template styles:', error);
      }
    }
    
    fetchStyles();
  }, []);
  
  // Analyze product description to recommend template styles and suggest template data
  const analyzeDescription = async () => {
    if (!productDescription.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please enter a product description to get recommendations.',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Analyze the product type and characteristics
      const productType = determineProductType(productDescription);
      const productStyle = determineProductStyle(productDescription);
      const productCharacteristics = extractProductCharacteristics(productDescription);
      
      // Find matching styles from the available template styles
      const matchingStyles = findMatchingStyles(productType, productStyle);
      
      // Create suggested template data based on the description
      const suggestions = createTemplateSuggestions(productDescription, productCharacteristics);
      
      // Update state with recommendations
      setSuggestedData(suggestions);
      
      toast({
        title: 'Analysis Complete',
        description: 'Template recommendations are ready. Review and apply suggestions as needed.',
      });
    } catch (error) {
      console.error('Error analyzing description:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze product description. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Determine product type from description
  const determineProductType = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    // Check for common product types
    if (lowerDesc.includes('electronics') || lowerDesc.includes('computer') || 
        lowerDesc.includes('phone') || lowerDesc.includes('tablet') || 
        lowerDesc.includes('device') || lowerDesc.includes('gadget')) {
      return 'electronics';
    }
    
    if (lowerDesc.includes('clothing') || lowerDesc.includes('shirt') || 
        lowerDesc.includes('pants') || lowerDesc.includes('dress') || 
        lowerDesc.includes('apparel') || lowerDesc.includes('fashion')) {
      return 'clothing';
    }
    
    if (lowerDesc.includes('tool') || lowerDesc.includes('machinery') || 
        lowerDesc.includes('equipment') || lowerDesc.includes('hardware')) {
      return 'tools';
    }
    
    if (lowerDesc.includes('furniture') || lowerDesc.includes('chair') || 
        lowerDesc.includes('table') || lowerDesc.includes('sofa') || 
        lowerDesc.includes('desk')) {
      return 'furniture';
    }
    
    if (lowerDesc.includes('food') || lowerDesc.includes('beverage') || 
        lowerDesc.includes('drink') || lowerDesc.includes('snack') || 
        lowerDesc.includes('meal')) {
      return 'food';
    }
    
    // Default to generic product
    return 'product';
  };
  
  // Determine product style/aesthetic from description
  const determineProductStyle = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    
    // Check for style indicators
    if (lowerDesc.includes('modern') || lowerDesc.includes('contemporary') || 
        lowerDesc.includes('sleek') || lowerDesc.includes('innovative')) {
      return 'modern';
    }
    
    if (lowerDesc.includes('classic') || lowerDesc.includes('traditional') || 
        lowerDesc.includes('timeless') || lowerDesc.includes('vintage')) {
      return 'classic';
    }
    
    if (lowerDesc.includes('minimalist') || lowerDesc.includes('simple') || 
        lowerDesc.includes('clean') || lowerDesc.includes('elegant')) {
      return 'minimalist';
    }
    
    if (lowerDesc.includes('bold') || lowerDesc.includes('vibrant') || 
        lowerDesc.includes('colorful') || lowerDesc.includes('striking')) {
      return 'bold';
    }
    
    if (lowerDesc.includes('luxury') || lowerDesc.includes('premium') || 
        lowerDesc.includes('high-end') || lowerDesc.includes('sophisticated')) {
      return 'elegant';
    }
    
    // Default to modern
    return 'modern';
  };
  
  // Extract product characteristics
  const extractProductCharacteristics = (description: string) => {
    // Extract potential features
    const features = [];
    const sentences = description.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (sentence.trim().length < 3) continue;
      
      if (sentence.toLowerCase().includes('feature') || 
          sentence.toLowerCase().includes('include') ||
          sentence.toLowerCase().includes('offer') ||
          sentence.toLowerCase().includes('provide') ||
          sentence.toLowerCase().includes('comes with')) {
        features.push(sentence.trim());
      }
    }
    
    // Extract potential specifications using regex patterns
    const specs = [];
    
    // Look for dimensions
    const dimensionsMatch = description.match(/(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)\s*(cm|mm|in|inches|inch)/i);
    if (dimensionsMatch) {
      specs.push({ label: 'Dimensions', value: dimensionsMatch[0] });
    }
    
    // Look for weight
    const weightMatch = description.match(/(\d+(\.\d+)?)\s*(kg|g|lbs|pounds|oz|ounces)/i);
    if (weightMatch) {
      specs.push({ label: 'Weight', value: weightMatch[0] });
    }
    
    // Look for materials
    const materialsMatch = description.match(/made of\s+([^.,:;]+)/i) || 
                          description.match(/materials?:\s+([^.,:;]+)/i) ||
                          description.match(/constructed from\s+([^.,:;]+)/i);
    if (materialsMatch) {
      specs.push({ label: 'Material', value: materialsMatch[1].trim() });
    }
    
    // Look for color
    const colorMatch = description.match(/colou?r:\s+([^.,:;]+)/i) ||
                       description.match(/available in\s+([^.,:;]+)/i) ||
                       description.match(/comes in\s+([^.,:;]+)/i);
    if (colorMatch) {
      specs.push({ label: 'Color', value: colorMatch[1].trim() });
    }
    
    return { features, specs };
  };
  
  // Find matching styles from available templates
  const findMatchingStyles = (productType: string, productStyle: string): TemplateStyle[] => {
    if (!recommendedStyles.length) return [];
    
    // First try to match both product type and style
    let matches = recommendedStyles.filter(style => 
      style.type.toLowerCase() === productType.toLowerCase() && 
      style.style.toLowerCase() === productStyle.toLowerCase()
    );
    
    // If no exact matches, try matching just the style
    if (!matches.length) {
      matches = recommendedStyles.filter(style => 
        style.style.toLowerCase() === productStyle.toLowerCase()
      );
    }
    
    // If still no matches, try matching just the product type
    if (!matches.length) {
      matches = recommendedStyles.filter(style => 
        style.type.toLowerCase() === productType.toLowerCase()
      );
    }
    
    // If still no matches, return a default style
    if (!matches.length && recommendedStyles.length > 0) {
      // Return first modern style, or just the first style if no modern style exists
      const modernStyle = recommendedStyles.find(style => 
        style.style.toLowerCase() === 'modern'
      );
      
      if (modernStyle) {
        matches = [modernStyle];
      } else {
        matches = [recommendedStyles[0]];
      }
    }
    
    return matches;
  };
  
  // Create template data suggestions based on the description and extracted characteristics
  const createTemplateSuggestions = (description: string, characteristics: any): Partial<TemplateData> => {
    // Extract potential title
    const sentences = description.split(/[.!?]+/);
    let title = sentences[0].trim();
    
    // If first sentence is too long, try to find a shorter phrase that could be a title
    if (title.length > 50) {
      // Look for product name patterns
      const productNameMatch = description.match(/(?:the|our|new)\s+([A-Z][a-zA-Z0-9\s]{2,30})/);
      if (productNameMatch) {
        title = productNameMatch[1].trim();
      } else {
        // Just truncate to a reasonable length
        title = title.substring(0, 50);
      }
    }
    
    // Extract potential company info sections
    const companyInfo = [];
    
    // Quality section
    if (description.toLowerCase().includes('quality') || 
        description.toLowerCase().includes('warranty') ||
        description.toLowerCase().includes('guarantee')) {
      companyInfo.push({
        id: nanoid(),
        title: 'Quality Guarantee',
        description: 'We stand behind the quality of our products with a satisfaction guarantee.',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>'
      });
    }
    
    // Shipping section
    if (description.toLowerCase().includes('ship') || 
        description.toLowerCase().includes('delivery') ||
        description.toLowerCase().includes('fast')) {
      companyInfo.push({
        id: nanoid(),
        title: 'Fast Shipping',
        description: 'We offer quick and reliable shipping options to get your product to you without delay.',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>'
      });
    }
    
    // Support section
    if (description.toLowerCase().includes('support') || 
        description.toLowerCase().includes('service') ||
        description.toLowerCase().includes('help')) {
      companyInfo.push({
        id: nanoid(),
        title: 'Customer Support',
        description: 'Our dedicated support team is available to assist you with any questions or concerns.',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c-4.97 0-9-4.03-9-9m9 9a9 9 0 0 0 9-9m-9 0a9 9 0 0 0-9 9m0 0a9 9 0 0 1 9-9"></path><circle cx="12" cy="12" r="1"></circle></svg>'
      });
    }
    
    // Return the suggestions
    return {
      title,
      subtitle: title.length > 20 ? '' : 'Premium Quality Product',
      description: description,
      specs: characteristics.specs || [],
      companyInfo: companyInfo
    };
  };
  
  // Apply the suggested style
  const handleApplyStyle = (style: TemplateStyle) => {
    onStyleSelect(style);
    
    toast({
      title: 'Style Applied',
      description: `Applied the "${style.name}" template style.`,
    });
  };
  
  // Apply the suggested data updates
  const handleApplySuggestions = () => {
    if (!suggestedData) return;
    
    onSuggestionsApplied(suggestedData);
    
    toast({
      title: 'Suggestions Applied',
      description: 'Template data has been updated with the suggestions.',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="productDescription">Describe your product or service</Label>
          <Textarea 
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="Enter details about your product including features, specifications, materials, and any special selling points..."
            className="mt-1"
            rows={5}
          />
        </div>
        
        <Button 
          onClick={analyzeDescription} 
          disabled={loading || productDescription.trim().length < 10}
          className="w-full"
        >
          {loading ? 'Analyzing...' : 'Analyze & Suggest Templates'}
        </Button>
      </div>
      
      {suggestedData && (
        <>
          <Separator />
          
          <div className="space-y-4">
            <CardTitle className="text-lg">Suggested Information</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Title & Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label>Suggested Title</Label>
                      <div className="p-2 bg-muted rounded mt-1">{suggestedData.title}</div>
                    </div>
                    
                    {suggestedData.subtitle && (
                      <div>
                        <Label>Suggested Subtitle</Label>
                        <div className="p-2 bg-muted rounded mt-1">{suggestedData.subtitle}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {suggestedData.specs && suggestedData.specs.length > 0 ? (
                    <div className="space-y-2">
                      {suggestedData.specs.map((spec, index) => (
                        <div key={index} className="flex">
                          <div className="font-medium w-1/3">{spec.label}:</div>
                          <div>{spec.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <CardDescription>No specifications detected</CardDescription>
                  )}
                </CardContent>
              </Card>
              
              {suggestedData.companyInfo && suggestedData.companyInfo.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Company Sections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {suggestedData.companyInfo.map((section, index) => (
                        <div key={index} className="p-4 border rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 text-primary" dangerouslySetInnerHTML={{ __html: section.svg }} />
                            <div className="font-medium">{section.title}</div>
                          </div>
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Button 
              onClick={handleApplySuggestions}
              className="w-full"
            >
              Apply All Suggestions
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <CardTitle className="text-lg">Recommended Template Styles</CardTitle>
            
            {recommendedStyles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {findMatchingStyles(determineProductType(productDescription), determineProductStyle(productDescription))
                  .map((style) => (
                    <Card key={style.id} className="cursor-pointer hover:border-primary transition-colors">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{style.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{style.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="aspect-video bg-muted rounded overflow-hidden mb-4">
                          {style.thumbnail && (
                            <img 
                              src={style.thumbnail} 
                              alt={style.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <Button 
                          onClick={() => handleApplyStyle(style)}
                          variant="outline"
                          className="w-full"
                        >
                          Apply This Style
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No template styles are available. Please check your database connection or seed the database with template styles.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </>
      )}
    </div>
  );
}