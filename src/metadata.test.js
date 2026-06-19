import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const indexHtml = readFileSync('index.html', 'utf8');

describe('link preview metadata', () => {
  it('uses a square icon for Teams-compatible unfurl previews', () => {
    expect(indexHtml).toContain(
      '<meta property="og:image" content="https://grip.ravensberg.org/icon-512.png" />'
    );
    expect(indexHtml).toContain('<meta property="og:image:width" content="512" />');
    expect(indexHtml).toContain('<meta property="og:image:height" content="512" />');
    expect(indexHtml).toContain('<meta name="twitter:card" content="summary" />');
  });
});
