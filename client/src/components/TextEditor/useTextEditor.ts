import { useState, useCallback } from 'react';

interface EditorHistoryEntry {
  content: string;
  timestamp: number;
}

export const useTextEditor = (initialContent: string) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<EditorHistoryEntry[]>([
    { content: initialContent, timestamp: Date.now() },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, { content: newContent, timestamp: Date.now() }];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setContent(history[currentIndex - 1].content);
    }
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setContent(history[currentIndex + 1].content);
    }
  }, [currentIndex, history]);

  const toggleEdit = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const saveChanges = useCallback(() => {
    // Save operation can be extended based on requirements
    setIsEditing(false);
  }, []);

  return {
    content,
    isEditing,
    history,
    setContent: updateContent,
    toggleEdit,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    saveChanges,
  };
};
