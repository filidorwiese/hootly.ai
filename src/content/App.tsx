import React, { useState, useEffect } from 'react';
import { css } from '@emotion/css';

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for toggle message
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'fireclaude-toggle') {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={backdropStyles}
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className={dialogStyles}>
        <div className={headerStyles}>
          <h2>FireClaude</h2>
          <button onClick={() => setIsOpen(false)}>✕</button>
        </div>
        <div className={contentStyles}>
          <p>Dialog content will go here...</p>
          <p>Press Esc or click backdrop to close</p>
        </div>
      </div>
    </>
  );
};

const backdropStyles = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999998;
`;

const dialogStyles = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 999999;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const headerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  button {
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background: #f0f0f0;
    }
  }
`;

const contentStyles = css`
  flex: 1;
  padding: 20px;
  overflow: auto;
`;

export default App;
