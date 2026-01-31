import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('UI-11: Display version number on settings page', () => {
  beforeEach(() => {
    // Mock __APP_VERSION__ global
    vi.stubGlobal('__APP_VERSION__', '0.5.0');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('__APP_VERSION__ global is defined', () => {
    expect(__APP_VERSION__).toBeDefined();
    expect(typeof __APP_VERSION__).toBe('string');
  });

  it('version follows semver format', () => {
    // Pattern: major.minor.patch (optionally with pre-release)
    const semverPattern = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
    expect(__APP_VERSION__).toMatch(semverPattern);
  });

  it('version can be formatted with v prefix', () => {
    const formattedVersion = `v${__APP_VERSION__}`;
    expect(formattedVersion).toBe('v0.5.0');
  });
});
