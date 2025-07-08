import React from 'react';
import { EditorSectionProps, CompanySection } from '../types';
import CompanySectionEditor from './CompanySectionEditor';
import SvgEditor from './SvgEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from './FileUploader';

interface CompanyEditorProps extends EditorSectionProps {
  onEditSvg: (svg: string, sectionId: string) => void;
}

const CompanyEditor: React.FC<CompanyEditorProps> = ({ data, onUpdate, onEditSvg }) => {
  const [showSvgEditor, setShowSvgEditor] = React.useState(false);
  const [currentSvg, setCurrentSvg] = React.useState<{ svg: string; sectionId: string } | null>(null);
  // Add state for logo
  const [logo, setLogo] = React.useState(data.logo || '');

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
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">About / Company Info</h3>
      {/* Logo Editor */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Company Logo</label>
        <div className="flex items-center space-x-2 mb-2">
          {logo ? (
            <div className="mb-2 flex items-center">
              <div className="border border-gray-200 rounded-md p-2 bg-white max-w-[180px] mr-2">
                {logo.includes('<svg') ? (
                  <div dangerouslySetInnerHTML={{ __html: logo }} />
                ) : (
                  <img src={logo} alt="Logo" className="h-10" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setLogo(''); onUpdate({ logo: '' }); }}
                className="text-xs"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <span className="text-sm">No logo set</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <FileUploader
            onFileUploaded={(url) => { setLogo(url); onUpdate({ logo: url }); }}
            buttonLabel="Upload Logo"
            className="text-xs"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Upload a new logo to replace the current one</p>
      </div>
      {/* Company Name */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Company Name</label>
        <Input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={data.company_name || ''}
          onChange={e => onUpdate({ company_name: e.target.value })}
          placeholder="Enter company name"
        />
        <p className="mt-1 text-xs text-gray-500">Your company or store name</p>
      </div>
      {/* Company Slogan */}
      <div className="mb-4">
        <label className="block text-xs text-gray-600 mb-1">Company Slogan</label>
        <Input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          value={data.subtitle || ''}
          onChange={e => onUpdate({ subtitle: e.target.value })}
          placeholder="Enter company slogan"
        />
        <p className="mt-1 text-xs text-gray-500">A brief slogan displayed under your company name</p>
      </div>
      {/* Company Sections */}
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