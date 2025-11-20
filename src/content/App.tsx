import React, { useState, useEffect } from 'react';
import Dialog from './components/Dialog';
import SelectionTooltip from './components/SelectionTooltip';

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Log state changes
  useEffect(() => {
    console.log('[FireClaude] Dialog state changed to:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    console.log('[FireClaude] App component mounted');

    // Listen for toggle message
    const handleMessage = (event: MessageEvent) => {
      console.log('[FireClaude] Window message received:', event.data);
      if (event.data.type === 'fireclaude-toggle') {
        console.log('[FireClaude] Toggling dialog');
        setIsOpen((prev) => {
          console.log('[FireClaude] State updating from', prev, 'to', !prev);
          return !prev;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle Esc key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpenWithSelection = () => {
    setIsOpen(true);
  };

  return (
    <>
      <SelectionTooltip onOpenWithSelection={handleOpenWithSelection} />
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default App;
