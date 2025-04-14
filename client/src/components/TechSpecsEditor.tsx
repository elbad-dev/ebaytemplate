import React from 'react';
import { Input } from '@/components/ui/input';
import { nanoid } from 'nanoid';
import { X, Plus } from 'lucide-react';
import { EditorSectionProps } from '../types';

const TechSpecsEditor: React.FC<EditorSectionProps> = ({ data, onUpdate }) => {
  const addNewSpec = () => {
    const newSpecs = [
      ...data.specs,
      {
        id: nanoid(),
        label: '',
        value: ''
      }
    ];
    onUpdate({ specs: newSpecs });
  };

  const removeSpec = (id: string) => {
    const newSpecs = data.specs.filter(spec => spec.id !== id);
    onUpdate({ specs: newSpecs });
  };

  const updateSpecLabel = (id: string, label: string) => {
    const newSpecs = data.specs.map(spec => 
      spec.id === id ? { ...spec, label } : spec
    );
    onUpdate({ specs: newSpecs });
  };

  const updateSpecValue = (id: string, value: string) => {
    const newSpecs = data.specs.map(spec => 
      spec.id === id ? { ...spec, value } : spec
    );
    onUpdate({ specs: newSpecs });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Technical Specifications</h3>
        <button 
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded"
          onClick={addNewSpec}
        >
          + Add Spec
        </button>
      </div>
      
      {data.specs.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">No specifications yet. Add your first technical specification.</p>
          <button 
            onClick={addNewSpec}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add First Specification
          </button>
        </div>
      ) : (
        data.specs.map((spec, index) => (
          <div key={spec.id} className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Specification #{index + 1}</span>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => removeSpec(spec.id)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Label</label>
                <Input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                  value={spec.label} 
                  onChange={(e) => updateSpecLabel(spec.id, e.target.value)}
                  placeholder="e.g. Material"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Value</label>
                <Input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm" 
                  value={spec.value} 
                  onChange={(e) => updateSpecValue(spec.id, e.target.value)}
                  placeholder="e.g. High-grade steel"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TechSpecsEditor;
