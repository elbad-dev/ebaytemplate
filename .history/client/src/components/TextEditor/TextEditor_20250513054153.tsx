import React, { useState, useRef, useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { useTextEditor } from './useTextEditor';
import './TextEditor.css';

interface TextEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const {
    content,
    isEditing,
    history,
    setContent,
    toggleEdit,
    undo,
    redo,
    canUndo,
    canRedo,
    saveChanges,
  } = useTextEditor(initialContent);

  const handleSave = () => {
    saveChanges();
    onSave(content);
  };

  return (
    <div className="text-editor-container">
      <EditorToolbar 
        isEditing={isEditing}
        onToggleEdit={toggleEdit}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onCancel={onCancel}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      <div 
        ref={editorRef}
        className={`editor-content ${isEditing ? 'editing' : ''}`}
        contentEditable={isEditing}
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
