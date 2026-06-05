import { isResearchAnalysis } from '@/lib/researchAnalysis';

describe('isResearchAnalysis', () => {
  it('matches a canonical "RESEARCH ANALYSIS" heading', () => {
    expect(isResearchAnalysis('<p>✅ RESEARCH ANALYSIS ✅</p>')).toBe(true);
  });

  it('tolerates common misspellings', () => {
    expect(isResearchAnalysis('Reserch Analisis')).toBe(true);
    expect(isResearchAnalysis('reaserch_analysis')).toBe(true);
  });

  it('does not match ordinary trade text', () => {
    expect(isResearchAnalysis('<p>Buy NIFTY above 24000, target 24200</p>')).toBe(false);
    expect(isResearchAnalysis('Good morning team')).toBe(false);
  });
});
