import React, { useState, useRef, useEffect } from 'react';
import { css } from '@emotion/css';
import type { Persona } from '../../shared/types';
import { t } from '../../shared/i18n';

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersonaId: string;
  onSelectPersona: (persona: Persona) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personas,
  selectedPersonaId,
  onSelectPersona,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId) || personas[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (persona: Persona) => {
    onSelectPersona(persona);
    setIsOpen(false);
  };

  const builtInPersonas = personas.filter((p) => p.isBuiltIn);
  const customPersonas = personas.filter((p) => !p.isBuiltIn);

  return (
    <div className={containerStyles} ref={containerRef}>
      <button
        className={triggerStyles}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('persona.selectPersona')}
        title={selectedPersona.description}
      >
        <span className={iconStyles}>{selectedPersona.icon}</span>
        <span className={nameStyles}>{selectedPersona.name}</span>
        <span className={chevronStyles}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={dropdownStyles}>
          {builtInPersonas.map((persona) => (
            <button
              key={persona.id}
              className={`${optionStyles} ${persona.id === selectedPersonaId ? selectedOptionStyles : ''}`}
              onClick={() => handleSelect(persona)}
              title={persona.description}
            >
              <span className={optionIconStyles}>{persona.icon}</span>
              <div className={optionTextStyles}>
                <span className={optionNameStyles}>{persona.name}</span>
                <span className={optionDescStyles}>{persona.description}</span>
              </div>
            </button>
          ))}

          {customPersonas.length > 0 && (
            <>
              <div className={dividerStyles} />
              <div className={customGroupStyles}>
                <div className={groupLabelStyles}>{t('persona.custom')}</div>
                {customPersonas.map((persona) => (
                  <button
                    key={persona.id}
                    className={`${optionStyles} ${persona.id === selectedPersonaId ? selectedOptionStyles : ''}`}
                    onClick={() => handleSelect(persona)}
                    title={persona.description}
                  >
                    <span className={optionIconStyles}>{persona.icon}</span>
                    <div className={optionTextStyles}>
                      <span className={optionNameStyles}>{persona.name}</span>
                      <span className={optionDescStyles}>{persona.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const containerStyles = css`
  position: relative;
`;

const triggerStyles = css`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #3A5A40;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(58, 90, 64, 0.08);
    border-color: rgba(58, 90, 64, 0.15);
  }
`;

const iconStyles = css`
  font-size: 13px;
`;

const nameStyles = css`
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const chevronStyles = css`
  font-size: 7px;
  color: #8A9A8C;
  margin-left: 1px;
`;

const dropdownStyles = css`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 220px;
  max-width: 260px;
  max-height: 300px;
  overflow-y: auto;
  background: #FAFBF9;
  border: 1px solid #E4E8E2;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(45, 60, 48, 0.15);
  z-index: 1000;
  padding: 4px;
`;

const optionStyles = css`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s ease;

  &:hover {
    background: rgba(58, 90, 64, 0.08);
  }
`;

const selectedOptionStyles = css`
  background: rgba(58, 90, 64, 0.12);
`;

const optionIconStyles = css`
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const optionTextStyles = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const optionNameStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #2D3A30;
`;

const optionDescStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  color: #8A9A8C;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const dividerStyles = css`
  height: 1px;
  background: #E4E8E2;
  margin: 4px 0;
`;

const groupLabelStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8A9A8C;
  padding: 4px 8px 2px;
`;

const customGroupStyles = css`
  background: rgba(58, 90, 64, 0.03);
  border-radius: 6px;
  margin-top: 2px;
  padding: 2px;
`;

export default PersonaSelector;
