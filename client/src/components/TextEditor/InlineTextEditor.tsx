import React, { useState, useCallback, useRef, useEffect } from 'react';
import { InlineEditorToolbar } from './InlineEditorToolbar';
import './TextEditor.css';
import './editor-global.css';

interface TextStyle {
  fontSize: string;
  fontFamily: string;
  color: string;
}

interface InlineTextEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function InlineTextEditor({
  content,
  onSave,
  onCancel,
  isEditing
}: InlineTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([content]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateHistory = useCallback((newContent: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, newContent];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const handleUndo = useCallback(() => {
    if (currentIndex > 0 && editorRef.current) {
      setCurrentIndex(prev => prev - 1);
      editorRef.current.innerHTML = history[currentIndex - 1];
    }
  }, [currentIndex, history]);

  const handleRedo = useCallback(() => {
    if (currentIndex < history.length - 1 && editorRef.current) {
      setCurrentIndex(prev => prev + 1);
      editorRef.current.innerHTML = history[currentIndex + 1];
    }
  }, [currentIndex, history]);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      updateHistory(editorRef.current.innerHTML);
    }
  }, [updateHistory]);

  const handleFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      updateHistory(editorRef.current.innerHTML);
    }
  }, [updateHistory]);

  const handleSave = useCallback(() => {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML);
    }
  }, [onSave]);  return (
    <div 
      className={`template-editor-container ${isEditing ? 'editing' : ''}`}
      onClick={() => !isEditing && editorRef.current?.focus()}
    >
      {isEditing && (
        <div className="editor-toolbar">
          <InlineEditorToolbar
            isVisible={true}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSave={handleSave}
            onCancel={onCancel}
            canUndo={currentIndex > 0}
            canRedo={currentIndex < history.length - 1}
            onFormatText={handleFormat}
          />
        </div>
      )}
      
      <div
        ref={editorRef}
        contentEditable={isEditing}
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: content }}
        className={`editor-content ${isEditing ? 'editing' : ''}`}
        style={{ minHeight: '100px' }}
      />
    </div>
  );
}
