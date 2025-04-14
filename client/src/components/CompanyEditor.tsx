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

  // Update company sections
  const handleCompanySectionsChange = (updatedSections: CompanySection[]) => {
    onUpdate({ companyInfo: updatedSections });
  };

  // Handler for editing SVG
  const handleEditSvg = (svg: string, sectionId: string) => {
    setCurrentSvg({ svg, sectionId });
    setShowSvgEditor(true);
  };

  // Handler for saving edited SVG
  const handleSaveSvg = (svg: string, sectionId: string) => {
    const updatedCompanyInfo = data.companyInfo.map(section => 
      section.id === sectionId ? { ...section, svg } : section
    );
    onUpdate({ companyInfo: updatedCompanyInfo });
    setShowSvgEditor(false);
    setCurrentSvg(null);
  };

  return (
    <div className="p-4">
      <CompanySectionEditor 
        sections={data.companyInfo} 
        onChange={handleCompanySectionsChange} 
      />
      
      {/* SVG Editor Dialog */}
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
};

export default CompanyEditor;