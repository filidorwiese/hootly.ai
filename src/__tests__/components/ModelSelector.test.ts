/**
 * UI-7: Add model selector dropdown to dialog
 * Tests for ModelSelector component and model selection functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('UI-7: Model selector dropdown', () => {
  let modelSelectorSource: string;
  let inputAreaSource: string;
  let dialogSource: string;
  let typesSource: string;

  beforeEach(() => {
    modelSelectorSource = fs.readFileSync(
      path.resolve(__dirname, '../../content/components/ModelSelector.tsx'),
      'utf-8'
    );
    inputAreaSource = fs.readFileSync(
      path.resolve(__dirname, '../../content/components/InputArea.tsx'),
      'utf-8'
    );
    dialogSource = fs.readFileSync(
      path.resolve(__dirname, '../../content/components/Dialog.tsx'),
      'utf-8'
    );
    typesSource = fs.readFileSync(
      path.resolve(__dirname, '../../shared/types.ts'),
      'utf-8'
    );
  });

  describe('ModelSelector component', () => {
    it('should exist and export default', () => {
      expect(modelSelectorSource).toContain('export default ModelSelector');
    });

    it('should accept models, selectedModelId, provider, onSelectModel props', () => {
      expect(modelSelectorSource).toContain('interface ModelSelectorProps');
      expect(modelSelectorSource).toContain('models: ModelConfig[]');
      expect(modelSelectorSource).toContain('selectedModelId: string');
      expect(modelSelectorSource).toContain('provider: LLMProvider');
      expect(modelSelectorSource).toContain('onSelectModel: (modelId: string) => void');
    });

    it('should accept isLoading prop', () => {
      expect(modelSelectorSource).toContain('isLoading?: boolean');
    });

    it('should render dropdown trigger button', () => {
      expect(modelSelectorSource).toContain('triggerStyles');
      expect(modelSelectorSource).toContain('onClick={() => setIsOpen(!isOpen)');
    });

    it('should render dropdown with model options', () => {
      expect(modelSelectorSource).toContain('dropdownStyles');
      expect(modelSelectorSource).toContain('models.map((model)');
    });

    it('should handle model selection', () => {
      expect(modelSelectorSource).toContain('handleSelect');
      expect(modelSelectorSource).toContain('onSelectModel(modelId)');
      expect(modelSelectorSource).toContain('setIsOpen(false)');
    });

    it('should close dropdown on click outside', () => {
      expect(modelSelectorSource).toContain('handleClickOutside');
      expect(modelSelectorSource).toContain("addEventListener('mousedown', handleClickOutside)");
    });

    it('should format model names for display', () => {
      expect(modelSelectorSource).toContain('formatModelName');
      // Test Claude format
      expect(modelSelectorSource).toContain('Claude');
      // Test OpenAI format
      expect(modelSelectorSource).toContain('GPT-');
      // Test Gemini format
      expect(modelSelectorSource).toContain('Gemini');
    });

    it('should show loading state', () => {
      expect(modelSelectorSource).toContain("t('model.loading')");
    });

    it('should disable when loading', () => {
      expect(modelSelectorSource).toContain('disabled={isLoading || models.length === 0}');
    });

    it('should use flat design styling', () => {
      expect(modelSelectorSource).toContain('colors.');
      expect(modelSelectorSource).toContain('radii.');
      expect(modelSelectorSource).toContain('transitions.');
    });

    it('should highlight selected model', () => {
      expect(modelSelectorSource).toContain('selectedOptionStyles');
      expect(modelSelectorSource).toContain('model.id === selectedModelId');
    });
  });

  describe('InputArea integration', () => {
    it('should import ModelSelector', () => {
      expect(inputAreaSource).toContain("import ModelSelector from './ModelSelector'");
    });

    it('should accept models and onSelectModel props', () => {
      expect(inputAreaSource).toContain('models?: ModelConfig[]');
      expect(inputAreaSource).toContain('onSelectModel?: (modelId: string) => void');
    });

    it('should accept isLoadingModels prop', () => {
      expect(inputAreaSource).toContain('isLoadingModels?: boolean');
    });

    it('should render ModelSelector in footer', () => {
      expect(inputAreaSource).toContain('<ModelSelector');
      expect(inputAreaSource).toContain('models={models}');
      expect(inputAreaSource).toContain('selectedModelId={modelId}');
      expect(inputAreaSource).toContain('provider={provider}');
      expect(inputAreaSource).toContain('onSelectModel={onSelectModel}');
    });

    it('should pass isLoading to ModelSelector', () => {
      expect(inputAreaSource).toContain('isLoading={isLoadingModels}');
    });
  });

  describe('Dialog integration', () => {
    it('should import ModelConfig type', () => {
      expect(dialogSource).toContain("import type { ModelConfig } from '../../shared/models'");
    });

    it('should have models state', () => {
      expect(dialogSource).toContain('const [models, setModels] = useState<ModelConfig[]>([])');
    });

    it('should have isLoadingModels state', () => {
      expect(dialogSource).toContain('const [isLoadingModels, setIsLoadingModels] = useState(false)');
    });

    it('should have fetchModels function', () => {
      expect(dialogSource).toContain('const fetchModels = async ()');
      expect(dialogSource).toContain("{ type: 'fetchModels' }");
    });

    it('should have handleModelSelect function', () => {
      expect(dialogSource).toContain('const handleModelSelect = async (modelId: string)');
      expect(dialogSource).toContain('setCurrentModel(modelId)');
    });

    it('should save model selection to settings', () => {
      expect(dialogSource).toContain("await Storage.saveSettings({ model: modelId })");
    });

    it('should pass models props to InputArea', () => {
      expect(dialogSource).toContain('models={models}');
      expect(dialogSource).toContain('onSelectModel={handleModelSelect}');
      expect(dialogSource).toContain('isLoadingModels={isLoadingModels}');
    });

    it('should fetch models when dialog opens', () => {
      expect(dialogSource).toContain('fetchModels()');
      expect(dialogSource).toContain('if (apiKey) {');
    });

    it('should clear models when provider changes', () => {
      expect(dialogSource).toContain("setModels([])");
    });

    it('should use currentModel in submit', () => {
      expect(dialogSource).toContain('model: currentModel');
    });
  });

  describe('Conversation persistence', () => {
    it('should have modelId in Conversation interface', () => {
      expect(typesSource).toContain('modelId?: string');
      expect(typesSource).toContain('interface Conversation');
    });

    it('should save modelId when saving conversation', () => {
      expect(dialogSource).toContain('saveConversationToStorage(newHistory, convId, currentPersonaId, currentModel)');
    });

    it('should include modelId in conversation object', () => {
      expect(dialogSource).toContain('modelId,');
      expect(dialogSource).toContain('const saveConversationToStorage = async (messages: Message[], convId: string, personaId: string, modelId: string)');
    });
  });

  describe('i18n translations', () => {
    const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'zh', 'ja', 'ko'];

    languages.forEach((lang) => {
      it(`should have model translations in ${lang}`, () => {
        const i18nSource = fs.readFileSync(
          path.resolve(__dirname, `../../shared/i18n/${lang}.json`),
          'utf-8'
        );
        const i18n = JSON.parse(i18nSource);
        expect(i18n.model).toBeDefined();
        expect(i18n.model.selectModel).toBeDefined();
        expect(i18n.model.loading).toBeDefined();
      });
    });
  });
});
