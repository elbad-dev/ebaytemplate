import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { TemplateVersion } from '@shared/schema';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, History, RotateCcw, Clock, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TemplateHistoryProps {
  templateId: number;
  onRestoreVersion: (html: string) => void;
}

export default function TemplateHistory({ templateId, onRestoreVersion }: TemplateHistoryProps) {
  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  const { toast } = useToast();

  // Fetch template versions
  const {
    data: versions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/templates', templateId, 'versions'],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${templateId}/versions`);
      if (!response.ok) {
        throw new Error('Failed to fetch template versions');
      }
      return await response.json() as TemplateVersion[];
    },
    enabled: open, // Only fetch when dialog is open
  });

  // Fetch specific version
  const {
    data: versionDetails,
    isLoading: isLoadingDetails,
  } = useQuery({
    queryKey: ['/api/template-versions', selectedVersion?.id],
    queryFn: async () => {
      if (!selectedVersion) return null;
      const response = await fetch(`/api/template-versions/${selectedVersion.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch version details');
      }
      return await response.json() as TemplateVersion;
    },
    enabled: !!selectedVersion,
  });

  // Mutation to restore a version
  const restoreMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const response = await fetch(`/api/templates/${templateId}/restore/${versionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore template version');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Version restored',
        description: 'Template has been restored to the selected version',
      });
      
      // Invalidate template versions and close the dialog
      queryClient.invalidateQueries({ queryKey: ['/api/templates', templateId, 'versions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/templates', templateId] });
      
      // Update the editor with the restored version
      if (versionDetails) {
        onRestoreVersion(versionDetails.html);
      }
      
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to restore version: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle restore button click
  const handleRestore = () => {
    if (selectedVersion) {
      restoreMutation.mutate(selectedVersion.id);
    }
  };

  // Format timestamp to human-readable time
  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Format version type for display
  const getVersionTypeLabel = (type: string) => {
    switch (type) {
      case 'create':
        return 'Created';
      case 'update':
        return 'Updated';
      case 'autosave':
        return 'Auto-saved';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          <span>History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Template Version History</DialogTitle>
          <DialogDescription>
            View previous versions of your template or restore to an earlier version.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Version list */}
          <Card className="md:col-span-1">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Versions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="p-4 text-sm text-center text-destructive">
                  Failed to load version history
                </div>
              ) : versions && versions.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="flex flex-col">
                    {versions.map((version) => (
                      <div key={version.id}>
                        <Button
                          variant={selectedVersion?.id === version.id ? "secondary" : "ghost"}
                          className="w-full justify-start rounded-none h-auto py-3 px-4"
                          onClick={() => setSelectedVersion(version)}
                        >
                          <div className="flex flex-col items-start gap-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">
                                {getVersionTypeLabel(version.version_type)}
                              </span>
                              <span className="text-xs text-muted-foreground">v{version.version_number}</span>
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(version.created_at)}
                            </span>
                          </div>
                        </Button>
                        <Separator />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-4 text-sm text-center text-muted-foreground">
                  No version history available
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Version details */}
          <Card className="md:col-span-2">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium">Version Details</CardTitle>
              {selectedVersion && (
                <CardDescription className="text-xs">
                  {getVersionTypeLabel(selectedVersion.version_type)} {formatTimestamp(selectedVersion.created_at)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-4">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : selectedVersion ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Name</h4>
                    <p className="text-sm text-muted-foreground">{versionDetails?.name}</p>
                  </div>
                  {versionDetails?.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{versionDetails.description}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium mb-1">HTML Preview</h4>
                    <div className="border rounded-md p-2 bg-muted/30 max-h-[180px] overflow-hidden">
                      <ScrollArea className="h-[180px]">
                        <pre className="text-xs font-mono">
                          {versionDetails?.html?.slice(0, 300)}
                          {versionDetails?.html && versionDetails.html.length > 300 ? '...' : ''}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Info className="h-10 w-10 mb-2" />
                  <p className="text-sm">Select a version to view details</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4">
              {selectedVersion && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        className="gap-2"
                        onClick={handleRestore}
                        disabled={restoreMutation.isPending || !versionDetails}
                      >
                        {restoreMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        <span>Restore this version</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Replace current template with this version</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}