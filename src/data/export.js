import PptxGenJS from 'pptxgenjs';
import { getMeasures, localized } from './grip.js';
import { t } from '../i18n/strings.js';

// ─── Colour palette (mirrors CSS variables) ──────────────────────────────────
const COLORS = {
  bg: 'F6F8FB',
  accent: '2F6DF6',
  a1: '64748B',
  a3: '2F6DF6',
  a5: '7C3AED',
  org: '0EA5A3',
  tech: 'F5871F',
  ink: '1A2233',
  inkSoft: '5A6478',
  surface: 'FFFFFF',
  line: 'E3E8F0',
};

// Tier colours
function tierColor(tier) {
  return COLORS[tier.toLowerCase()] ?? COLORS.a1;
}

// ─── PDF export ───────────────────────────────────────────────────────────────

/**
 * Triggers the browser print dialog so the user can save a PDF.
 * Print-specific CSS (defined in index.css under @media print) controls layout.
 */
export function exportPDF() {
  window.print();
}

// ─── PPTX export ─────────────────────────────────────────────────────────────

/**
 * Builds and downloads a PPTX file containing:
 *   - A title slide
 *   - One slide per GRIP measure (code, title, summary, Microsoft mappings)
 *
 * @param {string} lang  Active UI language ('nl' | 'en' | 'fr')
 */
export async function exportPPTX(lang) {
  const measures = getMeasures();
  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_WIDE'; // 13.33 × 7.5 in
  pptx.title = t(lang, 'appTitle');
  pptx.subject = t(lang, 'appSubtitle');

  // ── Title slide ─────────────────────────────────────────────────────────────
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: COLORS.bg };

  // Accent bar on left
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.18,
    h: '100%',
    fill: { color: COLORS.accent },
  });

  titleSlide.addText(t(lang, 'appTitle'), {
    x: 0.5,
    y: 2.6,
    w: 12.8,
    h: 0.9,
    fontSize: 36,
    bold: true,
    color: COLORS.ink,
    fontFace: 'Segoe UI',
  });

  titleSlide.addText(t(lang, 'appSubtitle'), {
    x: 0.5,
    y: 3.6,
    w: 12.8,
    h: 0.5,
    fontSize: 16,
    color: COLORS.inkSoft,
    fontFace: 'Segoe UI',
  });

  const today = new Date().toLocaleDateString(lang === 'fr' ? 'fr-BE' : lang === 'en' ? 'en-GB' : 'nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  titleSlide.addText(today, {
    x: 0.5,
    y: 6.6,
    w: 12.8,
    h: 0.3,
    fontSize: 11,
    color: COLORS.inkSoft,
    fontFace: 'Segoe UI',
  });

  // ── One slide per measure ────────────────────────────────────────────────────
  for (const measure of measures) {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.surface };

    const typeColor = measure.type === 'T' ? COLORS.tech : COLORS.org;

    // Top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: typeColor },
    });

    // Measure code pill
    slide.addText(measure.code, {
      x: 0.35,
      y: 0.2,
      w: 0.9,
      h: 0.38,
      fontSize: 14,
      bold: true,
      color: COLORS.surface,
      fill: { color: typeColor },
      align: 'center',
      valign: 'middle',
      shape: pptx.ShapeType.roundRect,
      rectRadius: 0.05,
    });

    // Basis badge
    slide.addText(`Basis ${measure.basis}`, {
      x: 1.35,
      y: 0.22,
      w: 1.1,
      h: 0.32,
      fontSize: 11,
      bold: true,
      color: COLORS.inkSoft,
      fontFace: 'Segoe UI',
    });

    // Tier badge
    const tier = measure.microsoft.reduce((best, ms) => {
      const rank = { A1: 1, A3: 2, A5: 3 };
      return rank[ms.tier] > rank[best] ? ms.tier : best;
    }, 'A1');

    slide.addText(tier, {
      x: 2.55,
      y: 0.22,
      w: 0.7,
      h: 0.32,
      fontSize: 11,
      bold: true,
      color: COLORS.surface,
      fill: { color: tierColor(tier) },
      align: 'center',
      fontFace: 'Segoe UI',
    });

    // Measure title
    const title = localized(measure, 'title', lang);
    slide.addText(title, {
      x: 0.35,
      y: 0.72,
      w: 12.6,
      h: 1.0,
      fontSize: 18,
      bold: true,
      color: COLORS.ink,
      fontFace: 'Segoe UI',
      wrap: true,
    });

    // Summary
    const summary = localized(measure, 'summary', lang);
    slide.addText(summary, {
      x: 0.35,
      y: 1.82,
      w: 12.6,
      h: 0.9,
      fontSize: 12,
      color: COLORS.inkSoft,
      fontFace: 'Segoe UI',
      wrap: true,
    });

    // Microsoft mapping header
    slide.addText(t(lang, 'microsoftMapping'), {
      x: 0.35,
      y: 2.85,
      w: 12.6,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: COLORS.inkSoft,
      fontFace: 'Segoe UI',
    });

    // Divider line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.35,
      y: 3.18,
      w: 12.6,
      h: 0,
      line: { color: COLORS.line, width: 0.5 },
    });

    // Microsoft tools (up to 6 per row, 2 rows)
    const tools = measure.microsoft.slice(0, 12);
    const colCount = Math.min(tools.length, 4);
    const colW = 12.6 / colCount;

    tools.forEach((ms, idx) => {
      const col = idx % colCount;
      const row = Math.floor(idx / colCount);
      const x = 0.35 + col * colW;
      const y = 3.28 + row * 1.05;

      // Card background
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: colW - 0.12,
        h: 0.9,
        fill: { color: ms.a5Adds ? 'F1E9FF' : 'F2F5FA' },
        line: { color: ms.a5Adds ? 'C4B5FD' : COLORS.line, width: 0.5 },
        rectRadius: 0.06,
      });

      // Tool name
      slide.addText(ms.name, {
        x: x + 0.1,
        y: y + 0.07,
        w: colW - 0.32,
        h: 0.5,
        fontSize: 10,
        bold: true,
        color: COLORS.ink,
        fontFace: 'Segoe UI',
        wrap: true,
      });

      // Tier label
      slide.addText(ms.tier, {
        x: x + colW - 0.32,
        y: y + 0.07,
        w: 0.28,
        h: 0.22,
        fontSize: 8,
        bold: true,
        color: COLORS.surface,
        fill: { color: tierColor(ms.tier) },
        align: 'center',
        fontFace: 'Segoe UI',
      });
    });

    // Slide number
    slide.addText(`${measure.code}`, {
      x: 12.5,
      y: 7.1,
      w: 0.8,
      h: 0.2,
      fontSize: 8,
      color: COLORS.inkSoft,
      align: 'right',
      fontFace: 'Segoe UI',
    });
  }

  await pptx.writeFile({ fileName: 'GRIP-Visualizer.pptx' });
}
