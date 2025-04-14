import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EditorSectionProps } from '../types';
import { Edit, ChevronDown } from 'lucide-react';
import FileUploader from './FileUploader';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Array of predefined SVG icons with names
const predefinedIcons = [
  {
    name: 'Quality',
    svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>'
  },
  {
    name: 'Package',
    svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
  },
  {
    name: 'Security',
    svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
  },
  {
    name: 'Shipping',
    svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path><path d="M12 3v6"></path></svg>'
  },
  {
    name: 'Speed',
    svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
  },
  {
    name: 'Award',
    svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>'
  },
  {
    name: 'Satisfaction',
    svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10h10"></path><path d="M7 14h10"></path><circle cx="12" cy="12" r="10"></circle></svg>'
  },
  {
    name: 'Power',
    svg: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H11V12H13V2Z"></path><path d="M5.0929 4.929L3.6789 6.343L10.0389 12.703L11.4529 11.289L5.0929 4.929Z"></path><path d="M4.93 19.071L6.344 20.485L12.704 14.125L11.29 12.711L4.93 19.071Z"></path><path d="M19.1676 20.7088L17.7536 19.2948L11.2896 11.2898L12.7036 12.7038L19.1676 20.7088Z"></path><path d="M16.9039 7.7574L18.3179 6.3434L12.7179 12.6774L11.3039 11.2634L16.9039 7.7574Z"></path></svg>'
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