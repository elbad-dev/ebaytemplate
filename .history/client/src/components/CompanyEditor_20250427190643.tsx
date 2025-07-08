import React from 'react';
import { EditorSectionProps, CompanySection } from '../types';
import CompanySectionEditor from './CompanySectionEditor';
import SvgEditor from './SvgEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CompanyEditorProps extends EditorSectionProps {
  onEditSvg: (svg: string, sectionId: string) => void;
}

const CompanyEditor: React.FC<CompanyEditorProps> = ({ data, onUpdate, onEditSvg }) => {
  const [showSvgEditor, setShowSvgEditor] = React.useState(false);
  const [currentSvg, setCurrentSvg] = React.useState<{ svg: string; sectionId: string } | null>(null);

  // Update company sections and trigger immediate preview update
  const handleCompanySectionsChange = (updatedSections: CompanySection[]) => {
    onUpdate({ 
      ...data,
      companyInfo: updatedSections.map(section => ({
        ...section,
        // Ensure SVG has valid structure and styling
        svg: section.svg?.includes('svg') ? section.svg : 
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${section.svg || ''}</svg>`
      }))
    });
  };

  // Handle SVG editing with proper structure preservation
  const handleEditSvg = (svg: string, sectionId: string) => {
    setCurrentSvg({ svg, sectionId });
    setShowSvgEditor(true);
  };

  // Save SVG changes and update template
  const handleSaveSvg = (svg: string, sectionId: string) => {
    const updatedCompanyInfo = data.companyInfo.map(section => 
      section.id === sectionId ? { ...section, svg } : section
    );
    
    onUpdate({ 
      ...data,
      companyInfo: updatedCompanyInfo
    });
    setShowSvgEditor(false);
    setCurrentSvg(null);
  };

  return (
    <div className="p-4">
      <CompanySectionEditor 
        sections={data.companyInfo} 
        onChange={handleCompanySectionsChange} 
      />
      
      {showSvgEditor && currentSvg && (
        <Dialog open={showSvgEditor} onOpenChange={setShowSvgEditor}>
          <DialogContent className="sm:max-w-[725px]">
            <DialogHeader>
              <DialogTitle>Edit SVG Icon</DialogTitle>
            </DialogHeader>
            <SvgEditor 
              svg={currentSvg.svg} 
              sectionId={currentSvg.sectionId} 
              onSave={handleSaveSvg}
              onClose={() => setShowSvgEditor(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default CompanyEditor;