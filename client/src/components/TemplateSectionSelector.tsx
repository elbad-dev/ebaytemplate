import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CardContent, Card } from '@/components/ui/card';
import { nanoid } from 'nanoid';
import * as cheerio from 'cheerio';
import { TemplateData } from '@shared/schema';

interface TemplateSectionSelectorProps {
  htmlContent: string;
  templateData: TemplateData;
  onUpdate: (updatedData: Partial<TemplateData>) => void;
  onClose: () => void;
}

export default function TemplateSectionSelector({ 
  htmlContent, 
  templateData, 
  onUpdate,
  onClose
}: TemplateSectionSelectorProps) {
  const [activeTab, setActiveTab] = useState('title');
  const [$ , set$] = useState<cheerio.CheerioAPI | null>(null);
  const [possibleTitles, setPossibleTitles] = useState<string[]>([]);
  const [possibleDescriptions, setPossibleDescriptions] = useState<{text: string, html: string}[]>([]);
  const [possibleSpecs, setPossibleSpecs] = useState<{element: string, specs: {label: string, value: string}[]}[]>([]);
  const [possibleImages, setPossibleImages] = useState<{src: string, alt: string}[]>([]);
  const [possibleCompanySections, setPossibleCompanySections] = useState<{title: string, description: string, html: string}[]>([]);

  // Parse the HTML to extract potential sections
  React.useEffect(() => {
    if (!htmlContent) return;
    
    const $ = cheerio.load(htmlContent);
    set$($);
    
    // Collect possible titles (headings and major text elements)
    const titles: string[] = [];
    $('h1, h2, h3, .title, .product-title, .heading, .header-title').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 5 && text.length < 200) {
        titles.push(text);
      }
    });
    setPossibleTitles(titles);
    
    // Collect possible descriptions (paragraphs, divs with substantial text)
    const descriptions: {text: string, html: string}[] = [];
    $('p, .description, .product-description, div:has(p)').each((_, el) => {
      const text = $(el).text().trim();
      // Only consider elements with substantial text
      if (text && text.length > 30) {
        descriptions.push({
          text: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
          html: $(el).html() || ''
        });
      }
    });
    setPossibleDescriptions(descriptions);
    
    // Collect possible tables or lists that could be specs
    const specs: {element: string, specs: {label: string, value: string}[]}[] = [];
    
    // Check tables
    $('table').each((i, table) => {
      const tableSpecs: {label: string, value: string}[] = [];
      
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td, th');
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          
          if (label && value) {
            tableSpecs.push({ label, value });
          }
        }
      });
      
      if (tableSpecs.length > 0) {
        specs.push({
          element: `Table ${i+1}`,
          specs: tableSpecs
        });
      }
    });
    
    // Check definition lists
    $('dl').each((i, list) => {
      const listSpecs: {label: string, value: string}[] = [];
      
      $(list).find('dt').each((j, term) => {
        const label = $(term).text().trim();
        const value = $(term).next('dd').text().trim();
        
        if (label && value) {
          listSpecs.push({ label, value });
        }
      });
      
      if (listSpecs.length > 0) {
        specs.push({
          element: `Definition List ${i+1}`,
          specs: listSpecs
        });
      }
    });
    
    // Check divs with common spec patterns
    $('.specs, .specifications, .tech-specs').each((i, container) => {
      const containerSpecs: {label: string, value: string}[] = [];
      
      // Check if it has pairs of elements that could be label-value pairs
      $(container).find('.spec-item, .spec-row, .specification-item').each((_, item) => {
        const label = $(item).find('.spec-label, .spec-name, .label').text().trim();
        const value = $(item).find('.spec-value, .spec-data, .value').text().trim();
        
        if (label && value) {
          containerSpecs.push({ label, value });
        }
      });
      
      if (containerSpecs.length > 0) {
        specs.push({
          element: `Specification Container ${i+1}`,
          specs: containerSpecs
        });
      }
    });
    
    setPossibleSpecs(specs);
    
    // Collect possible images
    const images: {src: string, alt: string}[] = [];
    $('img').each((_, img) => {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt') || '';
      
      // Filter out tiny images, icons, and UI elements
      if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('button')) {
        // Check if image has a reasonable size or a container suggesting it's important
        const parent = $(img).parent();
        const isInGallery = parent.hasClass('gallery') || 
                            parent.hasClass('product-image') ||
                            parent.hasClass('main-image');
        
        // You could also check image dimensions if available
        const width = $(img).attr('width');
        const height = $(img).attr('height');
        const isLargeEnough = (width && parseInt(width) > 100) || (height && parseInt(height) > 100);
        
        if (isInGallery || isLargeEnough || !width) {
          images.push({ src, alt });
        }
      }
    });
    setPossibleImages(images);
    
    // Collect possible company info sections
    const companySections: {title: string, description: string, html: string}[] = [];
    
    // Look for common company section containers
    $('.company-section, .info-section, .feature, .benefit, .usps, .usp, .service-card, .info-card').each((_, section) => {
      const title = $(section).find('h2, h3, h4, .title, .heading').first().text().trim();
      const description = $(section).find('p, .description, .content').first().text().trim();
      
      // If we found at least a title or description, consider it a candidate
      if (title || description) {
        companySections.push({
          title: title || 'Company Section',
          description: description || '',
          html: $(section).html() || ''
        });
      }
    });
    
    // If we didn't find dedicated sections, look for other containers with icons/SVGs
    if (companySections.length === 0) {
      $('div:has(svg), div:has(.icon)').each((_, section) => {
        const title = $(section).find('h2, h3, h4, .title, .heading').first().text().trim();
        const description = $(section).find('p, .description, .content').first().text().trim();
        
        // Only include if there's at least some text content
        if ((title || description) && (title.length > 3 || description.length > 15)) {
          companySections.push({
            title: title || 'Feature',
            description: description || '',
            html: $(section).html() || ''
          });
        }
      });
    }
    
    setPossibleCompanySections(companySections);
    
  }, [htmlContent]);

  // Handle section selection
  const handleSelectTitle = (title: string) => {
    onUpdate({ title });
  };

  const handleSelectDescription = (html: string) => {
    onUpdate({ description: html });
  };

  const handleSelectSpecs = (specs: {label: string, value: string}[]) => {
    onUpdate({ 
      specs: specs.map(spec => ({
        id: nanoid(),
        label: spec.label,
        value: spec.value
      }))
    });
  };

  const handleSelectImage = (src: string) => {
    const newImages = [...templateData.images, { id: nanoid(), url: src }];
    onUpdate({ images: newImages });
  };

  const handleSelectCompanySection = (section: {title: string, description: string, html: string}) => {
    const newSection = {
      id: nanoid(),
      title: section.title,
      description: section.description,
      svg: extractSvg(section.html) || '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
    };
    
    const updatedSections = [...templateData.companyInfo, newSection];
    onUpdate({ companyInfo: updatedSections });
  };

  // Helper function to extract SVG from HTML
  const extractSvg = (html: string): string | null => {
    if (!html) return null;
    
    try {
      const $ = cheerio.load(html);
      const svg = $('svg').first();
      return svg.length ? $.html(svg) : null;
    } catch {
      return null;
    }
  };

  return (
    <Dialog defaultOpen={true} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manual Section Selection</DialogTitle>
          <DialogDescription>
            Some template sections may not have been detected automatically. Use this tool to manually identify important content from your template.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="title">Title</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="title" className="space-y-4">
              <p className="text-sm text-muted-foreground">Select the main product title from the options below:</p>
              {possibleTitles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No potential titles detected. Try entering a title manually.</p>
              ) : (
                possibleTitles.map((title, i) => (
                  <Card key={i} className="cursor-pointer hover:bg-accent transition-colors p-2" onClick={() => handleSelectTitle(title)}>
                    <CardContent className="p-3">
                      <p>{title}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="description" className="space-y-4">
              <p className="text-sm text-muted-foreground">Select the product description from the options below:</p>
              {possibleDescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No potential descriptions detected. Try entering a description manually.</p>
              ) : (
                possibleDescriptions.map((desc, i) => (
                  <Card key={i} className="cursor-pointer hover:bg-accent transition-colors p-2" onClick={() => handleSelectDescription(desc.html)}>
                    <CardContent className="p-3">
                      <p>{desc.text}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="specs" className="space-y-4">
              <p className="text-sm text-muted-foreground">Select technical specifications from the options below:</p>
              {possibleSpecs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No potential specifications detected. Try entering specifications manually.</p>
              ) : (
                possibleSpecs.map((specGroup, i) => (
                  <Card key={i} className="cursor-pointer hover:bg-accent transition-colors p-2" onClick={() => handleSelectSpecs(specGroup.specs)}>
                    <CardContent className="p-3">
                      <p className="font-medium mb-2">{specGroup.element} ({specGroup.specs.length} items)</p>
                      <div className="space-y-1">
                        {specGroup.specs.slice(0, 3).map((spec, j) => (
                          <div key={j} className="flex">
                            <span className="font-medium mr-2">{spec.label}:</span>
                            <span>{spec.value}</span>
                          </div>
                        ))}
                        {specGroup.specs.length > 3 && <p className="text-sm text-muted-foreground">...and {specGroup.specs.length - 3} more</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              <p className="text-sm text-muted-foreground">Select product images to add to your template:</p>
              {possibleImages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No potential images detected. Try uploading images manually.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {possibleImages.map((img, i) => (
                    <Card key={i} className="cursor-pointer hover:bg-accent transition-colors p-2" onClick={() => handleSelectImage(img.src)}>
                      <CardContent className="p-3">
                        <div className="aspect-video flex items-center justify-center bg-muted overflow-hidden rounded-md">
                          <img src={img.src} alt={img.alt} className="object-contain max-h-full" />
                        </div>
                        <p className="text-sm mt-2 truncate">{img.alt || img.src.split('/').pop() || `Image ${i+1}`}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="company" className="space-y-4">
              <p className="text-sm text-muted-foreground">Select company/feature sections to add to your template:</p>
              {possibleCompanySections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No potential company sections detected. Try creating sections manually.</p>
              ) : (
                possibleCompanySections.map((section, i) => (
                  <Card key={i} className="cursor-pointer hover:bg-accent transition-colors p-2" onClick={() => handleSelectCompanySection(section)}>
                    <CardContent className="p-3">
                      <p className="font-medium">{section.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{section.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="mr-2">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}