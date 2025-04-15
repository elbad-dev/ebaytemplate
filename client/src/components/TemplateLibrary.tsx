import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Template } from '@shared/schema';
import { Edit, Trash2, Copy, ArrowLeft, Search, Filter } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onBackToWelcome: () => void;
}

export default function TemplateLibrary({ 
  onSelectTemplate, 
  onBackToWelcome 
}: TemplateLibraryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  
  // Fetch all templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/templates'],
  });
  
  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      await apiRequest(`/api/templates/${templateId}`, {
        method: 'DELETE'
      });
      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Template Deleted',
        description: 'The template has been successfully deleted.'
      });
      setTemplateToDelete(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete the template. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Filter templates based on search query
  const filteredTemplates = Array.isArray(templates) 
    ? templates.filter((template: Template) => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle template deletion
  const handleDelete = (template: Template) => {
    setTemplateToDelete(template);
  };
  
  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id);
    }
  };
  
  // Duplicate a template
  const duplicateMutation = useMutation({
    mutationFn: async (template: Template) => {
      const newTemplate = {
        name: `${template.name} (Copy)`,
        html: template.html,
        user_id: template.user_id,
        style_id: template.style_id
      };
      
      const response = await apiRequest('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Template Duplicated',
        description: 'A copy of the template has been created.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to duplicate the template. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const handleDuplicate = (template: Template) => {
    duplicateMutation.mutate(template);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackToWelcome}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Template Library</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !templates || !Array.isArray(templates) || templates.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
          <h2 className="text-xl font-semibold mb-2">No templates found</h2>
          <p className="text-muted-foreground mb-6">
            You haven't created or imported any templates yet.
          </p>
          <Button onClick={onBackToWelcome}>
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: Template) => (
            <Card key={template.id} className="overflow-hidden flex flex-col">
              <div 
                className="h-44 bg-muted cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: template.html.substring(0, 500) }} 
                  className="w-full h-full overflow-hidden shadow-inner scale-[0.65] origin-top"
                />
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                <CardDescription>
                  Created: {formatDate(template.created_at)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow text-sm text-muted-foreground">
                {template.style_id && (
                  <div className="flex items-center gap-1 text-xs mt-1">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
                      Style ID: {template.style_id}
                    </span>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleDelete(template)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog 
        open={!!templateToDelete} 
        onOpenChange={() => setTemplateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              &quot;{templateToDelete?.name}&quot; from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}