import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SvgEditorProps } from '../types';

const SvgEditor: React.FC<SvgEditorProps> = ({ svg, sectionId, onSave, onClose }) => {
  const [svgCode, setSvgCode] = useState(svg);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Update preview when SVG code changes
  useEffect(() => {
    if (previewContainerRef.current) {
      previewContainerRef.current.innerHTML = svgCode;
    }
  }, [svgCode]);

  const handleSave = () => {
    onSave(svgCode, sectionId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Edit SVG Icon</h2>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <Textarea 
            className="w-full h-48 p-3 border border-gray-300 rounded-md text-sm font-mono" 
            value={svgCode}
            onChange={(e) => setSvgCode(e.target.value)}
            placeholder="<svg>...</svg>"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50 w-24 h-24 flex items-center justify-center overflow-hidden">
            <div ref={previewContainerRef} />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SvgEditor;
