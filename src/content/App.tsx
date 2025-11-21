import React, { useState, useEffect } from 'react';
import Dialog from './components/Dialog';
import SelectionTooltip from './components/SelectionTooltip';
import { setLanguage, getLanguage } from '../shared/i18n';

function getBrowserLanguage(): string {
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  return lang.split('-')[0].toLowerCase();
}

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [langKey, setLangKey] = useState(0);

  // Log state changes
  useEffect(() => {
    console.log('[FireOwl] Dialog state changed to:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    console.log('[FireOwl] App component mounted');

    // Listen for toggle message from parent (iframe) or same window
    const handleMessage = (event: MessageEvent) => {
      console.log('[FireOwl] Window message received:', event.data);
      if (event.data.type === 'fireowl-toggle' || event.data.type === 'fireclaude-toggle') {
        console.log('[FireOwl] Toggling dialog');
        setIsOpen((prev) => {
          console.log('[FireOwl] State updating from', prev, 'to', !prev);
          return !prev;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Listen for language changes in storage
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.fireclaude_settings?.newValue?.language) {
        const newLang = changes.fireclaude_settings.newValue.language;
        const effectiveLang = newLang === 'auto' ? getBrowserLanguage() : newLang;
        if (effectiveLang !== getLanguage()) {
          setLanguage(effectiveLang);
          setLangKey(k => k + 1);
          console.log('[FireOwl] Language changed to:', effectiveLang);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const handleOpenWithSelection = () => {
    setIsOpen(true);
  };

  return (
    <>
      <SelectionTooltip key={`tooltip-${langKey}`} onOpenWithSelection={handleOpenWithSelection} />
      <Dialog key={`dialog-${langKey}`} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default App;
