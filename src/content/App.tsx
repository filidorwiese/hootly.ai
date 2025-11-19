import React, { useState, useEffect } from 'react';
import Dialog from './components/Dialog';

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('[FireClaude] App component mounted');

    // Listen for toggle message
    const handleMessage = (event: MessageEvent) => {
      console.log('[FireClaude] Window message received:', event.data);
      if (event.data.type === 'fireclaude-toggle') {
        console.log('[FireClaude] Toggling dialog, current state:', isOpen);
        setIsOpen((prev) => !prev);
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

  return <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} />;
};

export default App;
