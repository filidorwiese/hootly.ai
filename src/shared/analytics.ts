import { Storage } from './storage';

const PLAUSIBLE_ENDPOINT = 'https://plausible.oni.nl/api/event';
const PLAUSIBLE_DOMAIN = 'hootly.ai';

interface EventProperties {
  [key: string]: string | number | boolean;
}

interface PlausibleEvent {
  name: string;
  url: string;
  domain: string;
  props?: EventProperties;
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/')) return 'Safari';
  return 'Unknown';
}

function detectBrowserVersion(): string {
  const ua = navigator.userAgent;
  const match = ua.match(/(Firefox|Edg|Chrome|Safari)\/(\d+(\.\d+)?)/);
  return match ? match[2] : 'Unknown';
}

function getExtensionVersion(): string {
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'Unknown';
}

export async function trackEvent(
  eventName: string,
  properties?: EventProperties
): Promise<void> {
  try {
    const settings = await Storage.getSettings();

    if (!settings.shareAnalytics) {
      return;
    }

    const baseProps: EventProperties = {
      browser: detectBrowser(),
      browserVersion: detectBrowserVersion(),
      extensionVersion: getExtensionVersion(),
    };

    const event: PlausibleEvent = {
      name: eventName,
      url: `app://hootly.ai/${eventName}`,
      domain: PLAUSIBLE_DOMAIN,
      props: { ...baseProps, ...properties },
    };

    await fetch(PLAUSIBLE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch {
    // Silently fail - analytics should never break the app
  }
}

export function trackDialogOpen(provider: string, model: string): void {
  trackEvent('dialog_open', { provider, model });
}

export { detectBrowser, detectBrowserVersion, getExtensionVersion };
