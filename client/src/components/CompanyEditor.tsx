import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EditorSectionProps } from '../types';
import { Edit, Upload } from 'lucide-react';
import FileUploader from './FileUploader';

interface CompanyEditorProps extends EditorSectionProps {
  onEditSvg: (svg: string, sectionId: string) => void;
}

const CompanyEditor: React.FC<CompanyEditorProps> = ({ data, onUpdate, onEditSvg }) => {
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
              <div className="mt-1 flex items-center space-x-2">
                <button 
                  className="text-xs text-primary hover:text-blue-700 font-medium"
                  onClick={() => onEditSvg(section.svg, section.id)}
                >
                  Edit SVG
                </button>
                <FileUploader
                  onFileUploaded={(url) => handleSvgUpload(section.id, url)}
                  buttonLabel="Upload"
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
