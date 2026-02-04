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
  const [initialContextEnabled, setInitialContextEnabled] = useState(false);
  const [initialContextMode, setInitialContextMode] = useState<'none' | 'selection' | 'fullpage' | 'clipboard'>('none');
  const [initialClipboardText, setInitialClipboardText] = useState<string | null>(null);

  // Log state changes
  useEffect(() => {
    // console.log('[Hootly] Dialog state changed to:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    // Listen for toggle message from parent (iframe) or same window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'hootly-toggle') {
        // Receive stored context mode and clipboard from content script
        if (event.data.payload) {
          setInitialContextEnabled(event.data.payload.contextEnabled ?? false);
          setInitialContextMode(event.data.payload.contextMode ?? 'none');
          setInitialClipboardText(event.data.payload.clipboardText ?? null);
        }
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('message', handleMessage);

    // Signal to parent that app is ready to receive messages
    window.parent.postMessage({ type: 'hootly-ready' }, '*');

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
          // console.log('[Hootly] Language changed to:', effectiveLang);
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
      <SelectionTooltip key={`tooltip-${langKey}`} onOpenWithSelection={handleOpenWithSelection} isDialogOpen={isOpen} />
      <Dialog
        key={`dialog-${langKey}`}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialContextEnabled={initialContextEnabled}
        initialContextMode={initialContextMode}
        initialClipboardText={initialClipboardText}
      />
    </>
  );
};

export default App;
