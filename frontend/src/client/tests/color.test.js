import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hexToRgb, getReadableTextColor, deriveBrandTokens } from '../utils/color.js';

describe('color utilities and contrast rules', () => {
  it('correctly parses 6-digit and 3-digit hex values', () => {
    const rgb1 = hexToRgb('#17332c');
    assert.strictEqual(rgb1.r, 23);
    assert.strictEqual(rgb1.g, 51);
    assert.strictEqual(rgb1.b, 44);

    const rgb2 = hexToRgb('#fff');
    assert.strictEqual(rgb2.r, 255);
    assert.strictEqual(rgb2.g, 255);
    assert.strictEqual(rgb2.b, 255);
  });

  it('selects white text on dark brand colors for WCAG 4.5:1 compliance', () => {
    const textOnDark = getReadableTextColor('#17332c');
    assert.strictEqual(textOnDark, '#ffffff');

    const textOnBlack = getReadableTextColor('#000000');
    assert.strictEqual(textOnBlack, '#ffffff');
  });

  it('selects dark text on light brand colors for WCAG 4.5:1 compliance', () => {
    const textOnLight = getReadableTextColor('#fef08a');
    assert.strictEqual(textOnLight, '#17181a');

    const textOnWhite = getReadableTextColor('#ffffff');
    assert.strictEqual(textOnWhite, '#17181a');
  });

  it('derives brand tokens including contrast and tint', () => {
    const tokens = deriveBrandTokens('#17332c');
    assert.strictEqual(tokens.brand, '#17332c');
    assert.strictEqual(tokens.brandContrast, '#ffffff');
    assert(tokens.brandTint.includes('rgba('));
  });
});
