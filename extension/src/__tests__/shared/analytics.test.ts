import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent, trackDialogOpen, trackMessageSent } from '../../shared/analytics';
import { resetChromeMock, setMockStorage } from '../__mocks__/chrome';

describe('Analytics', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetChromeMock();
    vi.stubGlobal('__APP_VERSION__', '1.0.0');
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackEvent', () => {
    it('sends event when shareAnalytics is enabled', async () => {
      setMockStorage({
        hootly_settings: { shareAnalytics: true },
      });

      await trackEvent('test_event', { customProp: 'value' });

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://plausible.oni.nl/api/event',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(body.name).toBe('test_event');
      expect(body.domain).toBe('hootly.ai');
      expect(body.props.customProp).toBe('value');
    });

    it('does not send event when shareAnalytics is disabled', async () => {
      setMockStorage({
        hootly_settings: { shareAnalytics: false },
      });

      await trackEvent('test_event');

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('includes browser metadata in event', async () => {
      setMockStorage({
        hootly_settings: { shareAnalytics: true },
      });

      await trackEvent('test_event');

      const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(body.props.browser).toBeDefined();
      expect(body.props.browserVersion).toBeDefined();
      expect(body.props.extensionVersion).toBe('1.0.0');
    });

    it('silently fails on fetch error', async () => {
      setMockStorage({
        hootly_settings: { shareAnalytics: true },
      });
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      await expect(trackEvent('test_event')).resolves.not.toThrow();
    });
  });

  describe('trackDialogOpen', () => {
    it('sends dialog_open event with provider and model', async () => {
      setMockStorage({
        hootly_settings: { shareAnalytics: true },
      });

      trackDialogOpen('claude', 'claude-3-opus');
      // Wait for async trackEvent to complete
      await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());

      const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(body.name).toBe('dialog_open');
      expect(body.props.provider).toBe('claude');
      expect(body.props.model).toBe('claude-3-opus');
    });
  });

  describe('trackMessageSent', () => {
    it('sends message_sent event with provider and model (no content)', async () => {
      setMockStorage({
        hootly_settings: { shareAnalytics: true },
      });

      trackMessageSent('openai', 'gpt-4');
      await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());

      const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
      expect(body.name).toBe('message_sent');
      expect(body.props.provider).toBe('openai');
      expect(body.props.model).toBe('gpt-4');
      // Verify no content is sent (privacy requirement)
      expect(body.props.content).toBeUndefined();
      expect(body.props.message).toBeUndefined();
    });
  });
});
