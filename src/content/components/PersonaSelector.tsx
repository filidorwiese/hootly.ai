import React, { useState, useRef, useEffect } from 'react';
import { css } from '@emotion/css';
import type { Persona } from '../../shared/types';
import { t } from '../../shared/i18n';
import { colors, radii, fontSizes, fontWeights, transitions, spacing } from '../../shared/styles';

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
        title={selectedPersona.name}
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
              title={persona.name}
            >
              <span className={optionIconStyles}>{persona.icon}</span>
              <span className={optionNameStyles}>{persona.name}</span>
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
                    title={persona.name}
                  >
                    <span className={optionIconStyles}>{persona.icon}</span>
                    <span className={optionNameStyles}>{persona.name}</span>
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
  gap: ${spacing[1]};
  padding: ${spacing[1]} ${spacing[2]};
  background: transparent;
  border: 1px solid transparent;
  border-radius: ${radii.md};
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: ${fontSizes.sm};
  color: ${colors.primary[500]};
  transition: background ${transitions.default}, border-color ${transitions.default};

  &:hover {
    background: ${colors.surface.hover};
    border-color: ${colors.border.light};
  }

  &:active {
    background: ${colors.surface.active};
  }
`;

const iconStyles = css`
  font-size: ${fontSizes.md};
`;

const nameStyles = css`
  font-weight: ${fontWeights.medium};
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const chevronStyles = css`
  font-size: 7px;
  color: ${colors.text.tertiary};
  margin-left: 1px;
`;

const dropdownStyles = css`
  position: absolute;
  bottom: calc(100% + ${spacing[1]});
  left: 0;
  min-width: 220px;
  max-width: 260px;
  max-height: 300px;
  overflow-y: auto;
  background: ${colors.background.base};
  border: 1px solid ${colors.border.default};
  border-radius: ${radii.xl};
  z-index: 1000;
  padding: ${spacing[1]};
`;

const optionStyles = css`
  display: flex;
  align-items: center;
  gap: ${spacing[2]};
  width: 100%;
  padding: ${spacing[2]};
  background: transparent;
  border: none;
  border-radius: ${radii.md};
  cursor: pointer;
  text-align: left;
  transition: background ${transitions.fast};

  &:hover {
    background: ${colors.surface.hover};
  }

  &:active {
    background: ${colors.surface.active};
  }
`;

const selectedOptionStyles = css`
  background: ${colors.primary[50]};
  border: 1px solid ${colors.primary[100]};
`;

const optionIconStyles = css`
  font-size: ${fontSizes.xl};
  flex-shrink: 0;
`;

const optionNameStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: ${fontSizes.sm};
  font-weight: ${fontWeights.medium};
  color: ${colors.text.primary};
`;

const dividerStyles = css`
  height: 1px;
  background: ${colors.border.light};
  margin: ${spacing[1]} 0;
`;

const groupLabelStyles = css`
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: ${fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.text.tertiary};
  padding: ${spacing[1]} ${spacing[2]} 2px;
`;

const customGroupStyles = css`
  background: ${colors.background.muted};
  border-radius: ${radii.md};
  margin-top: 2px;
  padding: 2px;
`;

export default PersonaSelector;
