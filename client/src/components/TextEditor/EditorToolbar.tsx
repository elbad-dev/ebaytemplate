import React from 'react';
import './EditorToolbar.css';

interface EditorToolbarProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onCancel: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isEditing,
  onToggleEdit,
  onUndo,
  onRedo,
  onSave,
  onCancel,
  canUndo,
  canRedo,
}) => {
  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="editor-toolbar">
      <div className="edit-controls">
        <button 
          className={`edit-toggle ${isEditing ? 'active' : ''}`}
          onClick={onToggleEdit}
        >
          {isEditing ? 'Preview' : 'Edit'}
        </button>
        {isEditing && (
          <>
            <button onClick={onUndo} disabled={!canUndo}>
              Undo
            </button>
            <button onClick={onRedo} disabled={!canRedo}>
              Redo
            </button>
            <button onClick={onSave}>Save</button>
            <button onClick={onCancel}>Cancel</button>
          </>
        )}
      </div>
      
      {isEditing && (
        <div className="format-controls">
          <select 
            onChange={(e) => handleFormat('fontName', e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Font</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
          
          <select 
            onChange={(e) => handleFormat('fontSize', e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Size</option>
            {[1, 2, 3, 4, 5, 6, 7].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          
          <button onClick={() => handleFormat('bold')}>B</button>
          <button onClick={() => handleFormat('italic')}>I</button>
          <button onClick={() => handleFormat('underline')}>U</button>
          
          <input 
            type="color" 
            onChange={(e) => handleFormat('foreColor', e.target.value)}
            title="Text Color"
          />
        </div>
      )}
    </div>
  );
};
