import { describe, it, expect } from 'vitest';
import { API_ENDPOINTS, API_BASE_URL } from './api';

describe('API_ENDPOINTS', () => {
  it('builds every endpoint off the shared base URL', () => {
    // A hardcoded host slipping into one endpoint is invisible until that one
    // call fails in production.
    const urls = [
      API_ENDPOINTS.dailyChallenge('2026-01-01'),
      API_ENDPOINTS.validateSolution(),
      API_ENDPOINTS.getLevel('easy', 1),
      API_ENDPOINTS.getSpectrumLevel('hard', 42),
      API_ENDPOINTS.spectrumDaily('2026-01-01'),
    ];
    for (const url of urls) {
      expect(url.startsWith(API_BASE_URL), url).toBe(true);
    }
  });

  it('passes the date through to the daily endpoints', () => {
    expect(API_ENDPOINTS.dailyChallenge('2026-03-04')).toContain('date=2026-03-04');
    expect(API_ENDPOINTS.spectrumDaily('2026-03-04')).toContain('date=2026-03-04');
  });

  it('sends difficulty and level as separate params', () => {
    const url = API_ENDPOINTS.getLevel('insane', 7);
    expect(url).toContain('difficulty=insane');
    expect(url).toContain('level=7');
  });

  it('keeps RGB and spectrum level routes distinct', () => {
    // These two hit different generators; collapsing them serves the wrong
    // puzzle for an entire mode.
    expect(API_ENDPOINTS.getLevel('easy', 1)).not.toBe(
      API_ENDPOINTS.getSpectrumLevel('easy', 1),
    );
    expect(API_ENDPOINTS.getSpectrumLevel('easy', 1)).toContain('/spectrum-level');
  });

  it('keeps RGB and spectrum daily routes distinct', () => {
    expect(API_ENDPOINTS.dailyChallenge('2026-01-01')).not.toBe(
      API_ENDPOINTS.spectrumDaily('2026-01-01'),
    );
    expect(API_ENDPOINTS.spectrumDaily('2026-01-01')).toContain('/spectrum-daily');
  });

  it('never emits a doubled slash', () => {
    for (const url of [
      API_ENDPOINTS.dailyChallenge('2026-01-01'),
      API_ENDPOINTS.validateSolution(),
      API_ENDPOINTS.getLevel('easy', 1),
    ]) {
      expect(url.replace(/^https?:\/\//, ''), url).not.toContain('//');
    }
  });
});
