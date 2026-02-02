# Privacy Policy

**Hootly.ai Browser Extension**
Last updated: February 2026

## Summary

Hootly.ai is designed with privacy as a core principle. Your conversations and API keys stay on your device. We only collect anonymous, aggregated usage analytics (which you can disable in settings).

## Data Collection

**We collect minimal, anonymous usage data** to improve the extension:

- ✅ Anonymous usage analytics via [Plausible](https://plausible.io) (privacy-focused, no cookies)
- ❌ No personal information
- ❌ No tracking cookies
- ❌ No third-party tracking scripts

### Analytics Details

We use Plausible Analytics, which:
- Does not use cookies
- Does not collect personal data
- Does not track across sites
- Is GDPR, CCPA, and PECR compliant
- Can be **disabled in extension settings**

Analytics help us understand which features are used and identify issues. No conversation content, API keys, or personal data is ever collected.

## Data Storage

All data is stored **locally in your browser** using the browser's built-in storage API:

- API keys
- Conversation history
- Settings and preferences
- Custom personas

This data never leaves your device except when making API calls to your chosen LLM provider.

## API Communications

When you send a message, Hootly.ai communicates **directly** with your selected AI provider:

| Provider | Endpoint |
|----------|----------|
| Claude (Anthropic) | api.anthropic.com |
| OpenAI | api.openai.com |
| Google Gemini | generativelanguage.googleapis.com |
| OpenRouter | openrouter.ai |

**Your API key and messages are sent directly to these providers.** We do not proxy, log, or intercept this traffic. Please review each provider's privacy policy for how they handle your data.

## Page Context

When you use the "include page context" feature, selected text or page content is:

1. Read from the current webpage
2. Sent directly to your chosen AI provider
3. Never stored or transmitted elsewhere

## Third-Party Services

The extension does not load any external resources.

## Open Source

Hootly.ai is open source under AGPL-3.0. You can audit the code at:
https://github.com/filidorwiese/hootly.ai

## Changes

If this policy changes, we will update the "Last updated" date. Significant changes will be noted in the changelog.

## Contact

Questions? Open an issue on GitHub or contact the maintainer at the repository.
