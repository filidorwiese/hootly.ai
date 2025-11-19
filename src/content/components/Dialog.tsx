import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { css } from '@emotion/css';
import { Storage } from '../../shared/storage';
import type { DialogPosition } from '../../shared/types';
import InputArea from './InputArea';
import Response from './Response';
import ContextToggle from './ContextToggle';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [inputValue, setInputValue] = useState('');
  const [contextEnabled, setContextEnabled] = useState(false);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved position on mount
  useEffect(() => {
    Storage.getDialogPosition().then((saved) => {
      if (saved) {
        setPosition({ x: saved.x, y: saved.y });
        setSize({ width: saved.width, height: saved.height });
      } else {
        // Center on screen
        setPosition({
          x: window.innerWidth / 2 - 400,
          y: window.innerHeight / 2 - 200,
        });
      }
    });
  }, []);

  // Save position when changed
  const handleDragStop = (_e: any, d: { x: number; y: number }) => {
    const newPos: DialogPosition = { x: d.x, y: d.y, width: size.width, height: size.height };
    setPosition({ x: d.x, y: d.y });
    Storage.saveDialogPosition(newPos);
  };

  const handleResizeStop = (_e: any, _direction: any, ref: HTMLElement, _delta: any, position: { x: number; y: number }) => {
    const newPos: DialogPosition = {
      x: position.x,
      y: position.y,
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height),
    };
    setPosition({ x: position.x, y: position.y });
    setSize({ width: newPos.width, height: newPos.height });
    Storage.saveDialogPosition(newPos);
  };

  const handleSubmit = () => {
    if (!inputValue.trim() || isLoading) return;

    // @TODO: Implement API call via background worker
    setIsLoading(true);
    setResponse('API integration coming in Phase 3...');

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={backdropStyles} onClick={onClose} />

      {/* Draggable/Resizable Dialog */}
      <Rnd
        position={position}
        size={size}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        minWidth={400}
        minHeight={200}
        maxWidth={1200}
        maxHeight={800}
        bounds="window"
        dragHandleClassName="drag-handle"
        className={dialogStyles}
      >
        {/* Header */}
        <div className={`${headerStyles} drag-handle`}>
          <h2>FireClaude</h2>
          <button onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={contentWrapperStyles}>
          {/* Response Area */}
          <Response content={response} isLoading={isLoading} />

          {/* Input Area */}
          <div className={inputSectionStyles}>
            <ContextToggle
              enabled={contextEnabled}
              onToggle={setContextEnabled}
            />
            <InputArea
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSubmit}
              disabled={isLoading}
            />
          </div>
        </div>
      </Rnd>
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 999999 !important;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const headerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: move;
  user-select: none;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  button {
    background: none;
    border: none;
    font-size: 20px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background: #f0f0f0;
      color: #333;
    }
  }
`;

const contentWrapperStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const inputSectionStyles = css`
  border-top: 1px solid #e0e0e0;
  padding: 12px;
  background: #f9f9f9;
`;

export default Dialog;
