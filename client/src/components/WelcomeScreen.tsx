import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, FileUp, Wand2, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

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
    <div className="flex flex-col items-center min-h-[80vh] p-4">
      {/* Hero section with animated background */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 py-16 px-4 rounded-xl mb-12">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              }}
            />
          ))}
        </div>
        
        <div className="flex flex-col items-center relative z-10">
          <div className="flex items-center mb-6">
            <Logo size="large" className="mr-4" />
            <div>
              <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
                Template<span className="text-yellow-300">Editor</span>
              </h1>
              <div className="text-white/70 font-medium">
                Professional listing templates made easy
              </div>
            </div>
          </div>
          
          <p className="text-xl text-white max-w-2xl text-center font-light">
            Create stunning product listing templates with our intuitive editor.
            Import existing templates or build new ones from scratch.
          </p>
          
          <div className="flex space-x-4 mt-8">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-white/90"
              onClick={onCreateNewTemplate}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started
            </Button>
            <Button
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={onBrowseTemplates}
            >
              Browse Templates
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border-0">
          <div className="h-2 bg-blue-500" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-blue-500" />
              Import Template
            </CardTitle>
            <CardDescription>
              Import an existing HTML template
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Upload an existing HTML file to edit its images, text, specifications, and company information.
              Perfect for updating existing product listings.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost" 
              className="w-full hover:bg-blue-50 hover:text-blue-600" 
              onClick={onImportTemplate}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Upload Template
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border-0">
          <div className="h-2 bg-indigo-500" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-indigo-500" />
              Generate New
            </CardTitle>
            <CardDescription>
              Create a fresh template
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">
              Start from scratch and build a new template using our style library.
              Select layout styles, color schemes, and add your product information.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="ghost"
              className="w-full hover:bg-indigo-50 hover:text-indigo-600" 
              onClick={onCreateNewTemplate}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Create New Template
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border-0">
          <div className="h-2 bg-purple-500" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-purple-500" />
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
          <CardFooter className="pt-0">
            <Button 
              variant="ghost"
              className="w-full hover:bg-purple-50 hover:text-purple-600" 
              onClick={onBrowseTemplates}
            >
              <Edit className="mr-2 h-4 w-4" />
              Browse Library
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Features section */}
      <div className="mt-16 mb-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-8 relative">
          <span className="inline-block px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full">
            Why use TemplateEditor?
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4 p-2 rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">No-Code Editing</h3>
              <p className="text-gray-600">Edit images, text, and specifications without writing a single line of code</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4 p-2 rounded-full bg-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Professional Design</h3>
              <p className="text-gray-600">Choose from professionally designed template styles that engage customers</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4 p-2 rounded-full bg-purple-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>
                <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"/>
                <path d="M19 11h2m-1 -1v2"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Customization</h3>
              <p className="text-gray-600">Customize colors, fonts, and layouts to perfectly match your brand identity</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4 p-2 rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Responsive Design</h3>
              <p className="text-gray-600">Generate mobile-responsive templates that look fantastic on all devices</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Get started CTA */}
      <div className="mt-12 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl w-full max-w-4xl text-center">
        <h3 className="text-2xl font-bold mb-3">Ready to create stunning templates?</h3>
        <p className="mb-6 text-gray-600">Get started now and elevate your product listings</p>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={onCreateNewTemplate}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Create Your First Template
        </Button>
      </div>
    </div>
  );
}