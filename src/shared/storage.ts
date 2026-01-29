import type { Settings, Conversation, DialogPosition, Persona } from './types';
import { DEFAULT_SETTINGS, DEFAULT_PERSONAS } from './types';

const STORAGE_KEYS = {
  SETTINGS: 'hootly_settings',
  CONVERSATIONS: 'hootly_conversations',
  CURRENT_CONVERSATION: 'hootly_current_conversation',
  DIALOG_POSITION: 'hootly_dialog_position',
} as const;

export class Storage {
  static async getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
  }

  static async saveSettings(settings: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
  }

  static async getConversations(): Promise<Conversation[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CONVERSATIONS);
    return result[STORAGE_KEYS.CONVERSATIONS] || [];
  }

  static async saveConversation(conversation: Conversation): Promise<void> {
    const conversations = await this.getConversations();
    const index = conversations.findIndex((c) => c.id === conversation.id);

    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.CONVERSATIONS]: conversations });
  }

  static async deleteConversation(id: string): Promise<void> {
    const conversations = await this.getConversations();
    const filtered = conversations.filter((c) => c.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEYS.CONVERSATIONS]: filtered });
  }

  static async getCurrentConversation(): Promise<Conversation | null> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CURRENT_CONVERSATION);
    return result[STORAGE_KEYS.CURRENT_CONVERSATION] || null;
  }

  static async setCurrentConversation(conversation: Conversation | null): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_CONVERSATION]: conversation });
  }

  static async getDialogPosition(): Promise<DialogPosition | null> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.DIALOG_POSITION);
    return result[STORAGE_KEYS.DIALOG_POSITION] || null;
  }

  static async saveDialogPosition(position: DialogPosition): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.DIALOG_POSITION]: position });
  }

  static async clearOldConversations(retentionDays: number): Promise<void> {
    const conversations = await this.getConversations();
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const filtered = conversations.filter((c) => c.updatedAt > cutoff);
    await chrome.storage.local.set({ [STORAGE_KEYS.CONVERSATIONS]: filtered });
  }

  static async getPersonas(): Promise<Persona[]> {
    const settings = await this.getSettings();
    return [...DEFAULT_PERSONAS, ...(settings.customPersonas || [])];
  }

  static async getPersonaById(id: string): Promise<Persona | undefined> {
    const personas = await this.getPersonas();
    return personas.find((p) => p.id === id);
  }
}
