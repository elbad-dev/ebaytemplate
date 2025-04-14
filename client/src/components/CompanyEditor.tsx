import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EditorSectionProps } from '../types';
import { Edit, Upload, ChevronDown } from 'lucide-react';
import FileUploader from './FileUploader';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Collection of pre-defined SVG icons
const predefinedIcons = [
  {
    name: 'Clock',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>`
  },
  {
    name: 'Heart',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>`
  },
  {
    name: 'Shield',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>`
  },
  {
    name: 'Star',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>`
  },
  {
    name: 'Tool',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>`
  },
  {
    name: 'Truck',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>`
  },
  {
    name: 'Check',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`
  },
  {
    name: 'Medal',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>`
  }
];

interface CompanyEditorProps extends EditorSectionProps {
  onEditSvg: (svg: string, sectionId: string) => void;
}

const CompanyEditor: React.FC<CompanyEditorProps> = ({ data, onUpdate, onEditSvg }) => {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const updateCompanyTitle = (id: string, title: string) => {
    const updatedCompanyInfo = data.companyInfo.map(section => 
      section.id === id ? { ...section, title } : section
    );
    onUpdate({ companyInfo: updatedCompanyInfo });
  };

  const updateCompanyDescription = (id: string, description: string) => {
    const updatedCompanyInfo = data.companyInfo.map(section => 
      section.id === id ? { ...section, description } : section
    );
    onUpdate({ companyInfo: updatedCompanyInfo });
  };

  const handleSvgUpload = (id: string, url: string) => {
    // For simplicity, we'll use an image tag for uploaded images since we can't easily convert to SVG
    const svgWrapper = `<img src="${url}" width="32" height="32" alt="Icon" />`;
    const updatedCompanyInfo = data.companyInfo.map(section => 
      section.id === id ? { ...section, svg: svgWrapper } : section
    );
    onUpdate({ companyInfo: updatedCompanyInfo });
  };

  const updateSvgIcon = (id: string, svg: string) => {
    const updatedCompanyInfo = data.companyInfo.map(section => 
      section.id === id ? { ...section, svg } : section
    );
    onUpdate({ companyInfo: updatedCompanyInfo });
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Company Information</h3>
      
      {data.companyInfo.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No company information sections found in template.</p>
        </div>
      ) : (
        data.companyInfo.map((section, index) => (
          <div key={section.id} className="mb-5 border border-gray-200 rounded-md p-3 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Section #{index + 1}: {section.title || 'Untitled'}</span>
              <button 
                className="text-gray-400 hover:text-gray-600" 
                title="Edit Icon"
                onClick={() => onEditSvg(section.svg, section.id)}
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Icon (SVG)</label>
              <div className="p-2 border border-gray-300 rounded-md bg-white w-16 h-16 flex items-center justify-center">
                <div dangerouslySetInnerHTML={{ __html: section.svg }} />
              </div>
              <div className="mt-2 flex items-center flex-wrap gap-2">
                {/* SVG Icon Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                      Choose Icon <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[230px] p-2">
                    <div className="grid grid-cols-4 gap-2 p-1">
                      {predefinedIcons.map((icon) => (
                        <div 
                          key={icon.name}
                          onClick={() => updateSvgIcon(section.id, icon.svg)}
                          onMouseEnter={() => setHoveredIcon(icon.name)}
                          onMouseLeave={() => setHoveredIcon(null)}
                          className={`
                            flex flex-col items-center justify-center p-2 rounded-md cursor-pointer 
                            ${hoveredIcon === icon.name ? 'bg-gray-100' : ''}
                            hover:bg-gray-100 transition-colors
                          `}
                        >
                          <div className="w-8 h-8 text-primary flex items-center justify-center" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                          <span className="text-xs mt-1">{icon.name}</span>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Edit SVG button */}
                <button 
                  className="text-xs text-primary hover:text-blue-700 font-medium"
                  onClick={() => onEditSvg(section.svg, section.id)}
                >
                  Edit SVG
                </button>
                
                {/* Upload icon */}
                <FileUploader
                  onFileUploaded={(url) => handleSvgUpload(section.id, url)}
                  buttonLabel="Upload"
                  className="text-xs"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Title</label>
                <Input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                  value={section.title} 
                  onChange={(e) => updateCompanyTitle(section.id, e.target.value)}
                  placeholder="e.g. Premium Quality"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <Textarea 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm h-20" 
                  value={section.description} 
                  onChange={(e) => updateCompanyDescription(section.id, e.target.value)}
                  placeholder="Enter section description"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompanyEditor;
