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
    console.log('[Hootly] Dialog state changed to:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    console.log('[Hootly] App component mounted');

    // Listen for toggle message from parent (iframe) or same window
    const handleMessage = (event: MessageEvent) => {
      console.log('[Hootly] Window message received:', event.data);
      if (event.data.type === 'hootly-toggle') {
        console.log('[Hootly] Toggling dialog');
        setIsOpen((prev) => {
          console.log('[Hootly] State updating from', prev, 'to', !prev);
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
      if (changes.hootly_settings?.newValue?.language) {
        const newLang = changes.hootly_settings.newValue.language;
        const effectiveLang = newLang === 'auto' ? getBrowserLanguage() : newLang;
        if (effectiveLang !== getLanguage()) {
          setLanguage(effectiveLang);
          setLangKey(k => k + 1);
          console.log('[Hootly] Language changed to:', effectiveLang);
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
