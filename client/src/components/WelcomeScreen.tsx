import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, FileUp, Wand2 } from 'lucide-react';

interface WelcomeScreenProps {
  onImportTemplate: () => void;
  onCreateNewTemplate: () => void;
  onBrowseTemplates: () => void;
}

export default function WelcomeScreen({ 
  onImportTemplate, 
  onCreateNewTemplate,
  onBrowseTemplates 
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Template Editor
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Create professional product listing templates with our easy-to-use editor. Import an existing template or start from scratch.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              Import Template
            </CardTitle>
            <CardDescription>
              Import an existing HTML template to customize
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Upload an existing HTML file to edit its images, text, specifications, and company information.
              Perfect for updating existing product listings.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onImportTemplate}
            >
              Upload Template
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Generate New
            </CardTitle>
            <CardDescription>
              Create a fresh template with your content
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Start from scratch and build a new template using our style library.
              Select layout styles, color schemes, and add your product information.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={onCreateNewTemplate}
            >
              Create New Template
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Browse Templates
            </CardTitle>
            <CardDescription>
              View and edit your saved templates
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Access your library of previously created or imported templates.
              Edit, duplicate, or create new versions of existing templates.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onBrowseTemplates}
            >
              Browse Library
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-10 text-center max-w-xl">
        <h2 className="text-xl font-semibold mb-2">Why use our template editor?</h2>
        <ul className="text-muted-foreground text-sm space-y-2">
          <li>✓ Seamlessly edit images, text, and specifications without writing code</li>
          <li>✓ Choose from professionally designed template styles</li>
          <li>✓ Customize colors, fonts, and layouts to match your brand</li>
          <li>✓ Generate mobile-responsive templates that look great everywhere</li>
          <li>✓ Save and reuse templates for consistent product listings</li>
        </ul>
      </div>
    </div>
  );
}