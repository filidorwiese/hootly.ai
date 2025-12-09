# Hootly Pricing & Plans

## Overview

Hootly offers three pricing tiers designed to meet different user needs: **Free**, **Premium**, and **BYOK** (Bring Your Own Key).

---

## 🆓 Free Tier

**Perfect for:** Casual users who want to try AI assistance without commitment

### Pricing
- **$0/month**
- No account required
- No credit card needed

### Usage Limits
- **10 requests per day**
- Automatic reset every 24 hours
- Shared across all AI models

### AI Models
Multi-provider rotation using our backend:
- GPT-3.5 Turbo (OpenAI)
- Claude Haiku 3.5 (Anthropic)
- Gemini Flash 1.5 (Google)

### Features
| Feature | Included |
|---------|----------|
| Webpage context injection | ✅ |
| Text selection context | ✅ |
| Alt+W keyboard shortcut | ✅ |
| Chat history (local) | ✅ |
| Custom personas (up to 5) | ✅ |
| Markdown formatting | ✅ |
| Copy to clipboard | ✅ |
| Conversation iterations | ✅ |
| Cloud sync | ❌ |
| Export conversations | ❌ |
| Premium AI models | ❌ |

### Storage
- All data stored locally in browser
- No cloud backup
- Data persists until browser storage is cleared

---

## 💎 Premium Tier

**Perfect for:** Power users who need more requests, better models, and cloud sync

### Pricing
- **$5/month**
- Billed monthly
- Cancel anytime

### Account Required
- Email + password registration
- Secure authentication
- Cloud data storage

### Usage Limits
- **500 requests per month**
- ~16 requests per day average
- Carries over unused requests (up to 100)

### AI Models
Premium models via our backend:
- GPT-4o (OpenAI)
- GPT-4o-mini (OpenAI)
- Claude Sonnet 4 (Anthropic)
- Claude Sonnet 4.5 (Anthropic)
- Gemini Pro 1.5 (Google)
- Gemini Pro 2.0 (Google)

### Features
| Feature | Included |
|---------|----------|
| All Free tier features | ✅ |
| **Cloud sync across devices** | ✅ |
| **Unlimited chat history** | ✅ |
| **Search chat history** | ✅ |
| **Unlimited custom personas** | ✅ |
| **Conversation branching** | ✅ |
| **Export conversations** (MD, JSON, PDF) | ✅ |
| **Priority model access** | ✅ |
| **Faster response times** | ✅ |
| **Priority support** | ✅ |
| **Custom keyboard shortcuts** | ✅ |
| **Theme customization** | ✅ |

### Storage
- Encrypted cloud storage
- Automatic sync across all devices
- 1 year retention (configurable)

---

## 🔑 BYOK Tier (Bring Your Own Key)

**Perfect for:** Privacy-conscious users, developers, and those with existing AI subscriptions

### Pricing
- **$0/month forever**
- No account required
- No hidden costs
- Pay AI providers directly

### Usage Limits
- **Unlimited requests**
- Limited only by your API key quotas
- No Hootly-imposed restrictions

### AI Models
Use your own API keys for:
- **OpenAI** (GPT-4, GPT-4o, GPT-3.5-turbo, etc.)
- **Anthropic** (Claude Opus, Sonnet, Haiku)
- **Google AI** (Gemini Pro, Flash)
- **OpenRouter** (aggregated access to 100+ models)

### Features
| Feature | Included |
|---------|----------|
| All core chat features | ✅ |
| Webpage context injection | ✅ |
| Text selection context | ✅ |
| Alt+W keyboard shortcut | ✅ |
| Chat history (local) | ✅ |
| Custom personas (up to 5) | ✅ |
| Markdown formatting | ✅ |
| Copy to clipboard | ✅ |
| Conversation iterations | ✅ |
| Model selection | ✅ |
| Custom API endpoints | ✅ |
| Cloud sync | ❌ |
| Export conversations | ❌ |

### Storage
- All data stored locally in browser
- API keys encrypted and stored locally
- Never sent to Hootly servers
- Complete privacy control

### Setup
1. Obtain API keys from your chosen provider(s):
   - [OpenAI API Keys](https://platform.openai.com/api-keys)
   - [Anthropic API Keys](https://console.anthropic.com/)
   - [Google AI Studio](https://makersuite.google.com/app/apikey)
   - [OpenRouter Keys](https://openrouter.ai/keys)

2. Add keys in Hootly settings
3. Select your preferred model
4. Start chatting with unlimited requests

### Privacy
- ✅ API keys stored locally, encrypted
- ✅ No telemetry or tracking
- ✅ Requests go directly to AI provider
- ✅ Hootly never sees your data
- ✅ Open source (coming soon)

---

## Feature Comparison

| Feature | Free | Premium | BYOK |
|---------|------|---------|------|
| **Daily/Monthly Requests** | 10/day | 500/month | Unlimited |
| **AI Models** | Basic | Premium | Your choice |
| **Account Required** | ❌ | ✅ | ❌ |
| **Cost** | $0 | $5/month | $0 + API costs |
| **Webpage Context** | ✅ | ✅ | ✅ |
| **Text Selection** | ✅ | ✅ | ✅ |
| **Keyboard Shortcut** | ✅ | ✅ | ✅ |
| **Local History** | ✅ | ✅ | ✅ |
| **Cloud Sync** | ❌ | ✅ | ❌ |
| **Search History** | ❌ | ✅ | ❌ |
| **Custom Personas** | 5 max | Unlimited | 5 max |
| **Conversation Branching** | ❌ | ✅ | ❌ |
| **Export Conversations** | ❌ | ✅ | ❌ |
| **Priority Support** | ❌ | ✅ | Community |
| **Model Selection** | Auto | Auto | Manual |
| **Privacy Level** | High | Medium | Maximum |

---

## Technical Limits

### Free Tier Rate Limits
- **Per user:** 10 requests/24 hours
- **Per IP:** 50 requests/24 hours (shared network protection)
- **Output tokens:** 500 max per response
- **Context tokens:** 2,000 max (webpage + history)
- **Response delay:** 3 seconds artificial delay

### Premium Tier Limits
- **Per user:** 500 requests/month
- **Rollover:** Up to 100 unused requests to next month
- **Output tokens:** 4,000 max per response
- **Context tokens:** 32,000 max (depends on model)
- **Response delay:** None (instant)

### BYOK Tier Limits
- **Hootly limits:** None
- **Provider limits:** Based on your API key tier
- **Output tokens:** Based on model selection
- **Context tokens:** Based on model selection

---

## FAQ

### Can I upgrade from Free to Premium?
Yes! Your local history will be uploaded to cloud storage when you sign up for Premium.

### Can I downgrade from Premium to Free?
Yes, anytime. Your cloud history will remain accessible for 30 days, then be permanently deleted. Download your history before downgrading.

### Can I switch from BYOK to Premium?
Yes! Your local history can be imported when you create a Premium account.

### Can I use BYOK and Premium together?
Not simultaneously, but you can switch between them in settings. Premium gives you convenience; BYOK gives you control.

### What happens if I exceed my Premium monthly limit?
You'll receive a warning at 400 requests (80%). At 500, you can either:
- Wait until next month (free tier kicks in: 10/day)
- Upgrade to a higher tier (coming soon)
- Switch to BYOK temporarily

### How do I cancel Premium?
Go to Settings → Billing → Cancel Subscription. You'll retain Premium access until the end of your billing period.

### Is my payment information secure?
Yes. We use Stripe for payment processing. Hootly never stores your credit card information.

### What about refunds?
Premium is billed monthly. If you cancel within 7 days of your first charge, you'll receive a full refund. No refunds after 7 days.

### Can I use multiple API keys in BYOK?
Yes! You can add multiple providers and switch between them, or set up automatic rotation.

### Does BYOK support custom/local models?
Yes! If you run a local model with an OpenAI-compatible API (like Ollama, LM Studio), you can point Hootly to your localhost endpoint.

---

## Future Plans

We're considering adding:
- **Team/Enterprise tier** ($20/month per user, 5 user minimum)
  - Centralized billing
  - Shared persona library
  - Usage analytics dashboard
  - SSO/SAML support
  - Priority support with SLA

- **Lifetime Premium** (One-time $75)
  - All Premium features forever
  - Early adopter pricing
  - Limited availability

- **API Access** ($10/month)
  - Use Hootly's API in your own apps
  - 10,000 requests/month included
  - Programmatic access to all models

---

## Support

- **Free tier:** Community support via GitHub Discussions
- **Premium tier:** Email support with 24-hour response time
- **BYOK tier:** Community support + documentation

---

## Getting Started

1. **Install Hootly** from [Firefox Add-ons](https://addons.mozilla.org) or [Chrome Web Store](https://chrome.google.com)
2. **Choose your tier:**
   - Try Free (no signup)
   - Upgrade to Premium (better models + sync)
   - Add BYOK keys (unlimited + privacy)
3. **Press Alt+W** on any webpage
4. **Start chatting!** 🦉🔥

---

*Last updated: November 2024*  
*Pricing subject to change. Existing subscribers grandfathered at their current rate.*
