import PptxGenJS from 'pptxgenjs';
import {
  getMeasures,
  localized,
  highestTier,
  standardsFor,
  localizedStandardsWhy,
  localizedGuidance,
} from './grip.js';
import { t } from '../i18n/strings.js';

// ─── Colour palette (mirrors CSS variables) ──────────────────────────────────
const COLORS = {
  bg: 'F6F8FB',
  accent: '2F6DF6',
  accentInk: '1B4FD1',
  a1: '64748B',
  a3: '2F6DF6',
  a5: '7C3AED',
  addon: 'B45309',
  org: '0EA5A3',
  tech: 'F5871F',
  ink: '1A2233',
  inkSoft: '5A6478',
  inkFaint: '8A93A6',
  surface: 'FFFFFF',
  line: 'E3E8F0',
  do: '0EA5A3',
  dont: 'DC2626',
};

function tierColor(tier) {
  return COLORS[tier.toLowerCase()] ?? COLORS.a1;
}

// ─── PDF export ───────────────────────────────────────────────────────────────

/**
 * Triggers the browser print dialog so the user can save a PDF. The printed
 * output is produced by the always-rendered (screen-hidden) PrintDocument
 * component plus the `@media print` rules in index.css, giving one fully
 * detailed page per GRIP measure.
 */
export function exportPDF() {
  window.print();
}

// ─── Markdown export ──────────────────────────────────────────────────────────

// Returns the localized BCP-47 locale tag used for the document date.
function dateLocale(lang) {
  return { fr: 'fr-BE', en: 'en-GB', nl: 'nl-BE' }[lang] || 'nl-BE';
}

// Builds the Markdown body for a single measure, mirroring the detail shown in
// the app and the PDF/PPTX exports.
function measureMarkdown(measure, lang) {
  const lines = [];
  const title = localized(measure, 'title', lang);
  const typeLabel =
    measure.type === 'T' ? t(lang, 'technical') : t(lang, 'organisational');

  lines.push(`## ${measure.code} — ${title}`);
  lines.push('');
  lines.push(
    `**${typeLabel}** · ${t(lang, 'basis')} ${measure.basis} · ${highestTier(measure)}`
  );
  lines.push('');
  lines.push(localized(measure, 'summary', lang));
  lines.push('');

  // Practical guidance
  const guidance = localizedGuidance(measure, lang);
  if (guidance) {
    lines.push(`### ${t(lang, 'guidanceTitle')}`);
    lines.push('');
    if (guidance.rationale) {
      lines.push(`**${t(lang, 'guidanceWhy')}:** ${guidance.rationale}`);
      lines.push('');
    }
    if (guidance.do && guidance.do.length > 0) {
      lines.push(`**${t(lang, 'guidanceDo')}**`);
      lines.push('');
      guidance.do.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    }
    if (guidance.dont && guidance.dont.length > 0) {
      lines.push(`**${t(lang, 'guidanceDont')}**`);
      lines.push('');
      guidance.dont.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    }
  }

  // Microsoft mapping
  lines.push(`### ${t(lang, 'microsoftMapping')}`);
  lines.push('');
  if (measure.microsoft.length === 0) {
    lines.push(t(lang, 'noMapping'));
    lines.push('');
  } else {
    measure.microsoft.forEach((ms) => {
      const tierLabel = ms.addOn
        ? t(lang, 'addOnBadge')
        : `${ms.tier}${ms.a5Adds ? '+' : ''}`;
      const docs = ms.docsUrl ? ` — [${t(lang, 'openDocs')}](${ms.docsUrl})` : '';
      lines.push(`- **${ms.name}** (${tierLabel})${docs}`);
      const value = localized(ms, 'value', lang);
      if (value) {
        const src = ms.valueUrl ? ` ([${t(lang, 'valueSource')}](${ms.valueUrl}))` : '';
        lines.push(`  - _${t(lang, 'microsoftValue')}:_ ${value}${src}`);
      }
    });
    lines.push('');
  }

  // Standards mapping
  const standards = standardsFor(measure);
  if (standards.length > 0) {
    lines.push(`### ${t(lang, 'standardsTitle')}`);
    lines.push('');
    const standardsWhy = localizedStandardsWhy(measure, lang);
    if (standardsWhy) {
      lines.push(`**${t(lang, 'standardsWhy')}:** ${standardsWhy}`);
      lines.push('');
    }
    standards.forEach((std) => {
      const label = std.url ? `[${std.label}](${std.url})` : std.label;
      lines.push(`- **${label}**: ${std.controls.join(', ')}`);
    });
    lines.push('');
    lines.push(`> ${t(lang, 'standardsNote')}`);
    lines.push('');
  }

  // Further reading
  if (measure.references && measure.references.length > 0) {
    lines.push(`### ${t(lang, 'referencesTitle')}`);
    lines.push('');
    measure.references.forEach((ref) => {
      const label = localized(ref, 'label', lang);
      lines.push(`- ${ref.url ? `[${label}](${ref.url})` : label}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Builds a Markdown document containing the full GRIP → Microsoft mapping — one
 * section per measure with the same detail as the PDF/PPTX exports — and
 * triggers a client-side download. No data leaves the browser.
 *
 * @param {string} lang  Active UI language ('nl' | 'en' | 'fr')
 */
export function exportMarkdown(lang) {
  const measures = getMeasures();
  const today = new Date().toLocaleDateString(dateLocale(lang), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const parts = [
    `# ${t(lang, 'appTitle')}`,
    '',
    `_${t(lang, 'appSubtitle')}_`,
    '',
    today,
    '',
    ...measures.map((measure) => measureMarkdown(measure, lang)),
  ];

  const markdown = parts.join('\n');
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'GRIP-Visualizer.md';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── PPTX export ─────────────────────────────────────────────────────────────

// Builds the stacked text runs for the left "guidance" column.
function guidanceRuns(measure, lang) {
  const guidance = localizedGuidance(measure, lang);
  const runs = [
    {
      text: t(lang, 'guidanceTitle'),
      options: { bold: true, fontSize: 13, color: COLORS.accentInk, breakLine: true },
    },
  ];

  if (!guidance) {
    runs.push({
      text: '—',
      options: { fontSize: 11, color: COLORS.inkFaint, breakLine: true },
    });
    return runs;
  }

  if (guidance.rationale) {
    runs.push({
      text: `${t(lang, 'guidanceWhy')}: `,
      options: { bold: true, fontSize: 11, color: COLORS.ink },
    });
    runs.push({
      text: guidance.rationale,
      options: {
        fontSize: 11,
        color: COLORS.inkSoft,
        breakLine: true,
        paraSpaceAfter: 6,
      },
    });
  }

  if (guidance.do && guidance.do.length > 0) {
    runs.push({
      text: t(lang, 'guidanceDo'),
      options: { bold: true, fontSize: 11.5, color: COLORS.do, breakLine: true },
    });
    guidance.do.forEach((item) => {
      runs.push({
        text: item,
        options: { fontSize: 10.5, color: COLORS.ink, bullet: true, breakLine: true },
      });
    });
  }

  if (guidance.dont && guidance.dont.length > 0) {
    runs.push({
      text: t(lang, 'guidanceDont'),
      options: {
        bold: true,
        fontSize: 11.5,
        color: COLORS.dont,
        breakLine: true,
        paraSpaceBefore: 4,
      },
    });
    guidance.dont.forEach((item) => {
      runs.push({
        text: item,
        options: { fontSize: 10.5, color: COLORS.ink, bullet: true, breakLine: true },
      });
    });
  }

  return runs;
}

// Builds the stacked text runs for the right "mapping + standards" column.
function mappingRuns(measure, lang) {
  const runs = [
    {
      text: t(lang, 'microsoftMapping'),
      options: { bold: true, fontSize: 13, color: COLORS.accentInk, breakLine: true },
    },
  ];

  if (measure.microsoft.length === 0) {
    runs.push({
      text: t(lang, 'noMapping'),
      options: { fontSize: 11, color: COLORS.inkFaint, breakLine: true },
    });
  } else {
    measure.microsoft.forEach((ms) => {
      runs.push({
        text: ms.name,
        options: { bold: true, fontSize: 11, color: COLORS.ink },
      });
      runs.push({
        text: ms.addOn
          ? `  [${t(lang, 'addOnBadge')}]`
          : `  [${ms.tier}${ms.a5Adds ? '+' : ''}]`,
        options: {
          bold: true,
          fontSize: 10,
          color: ms.addOn ? COLORS.addon : tierColor(ms.tier),
          breakLine: true,
        },
      });
      if (ms.docsUrl) {
        runs.push({
          text: ms.docsUrl,
          options: {
            fontSize: 8.5,
            color: COLORS.inkSoft,
            breakLine: true,
            paraSpaceAfter: 4,
          },
        });
      }
    });
  }

  // Standards mapping
  const standards = standardsFor(measure);
  if (standards.length > 0) {
    runs.push({
      text: t(lang, 'standardsTitle'),
      options: {
        bold: true,
        fontSize: 13,
        color: COLORS.accentInk,
        breakLine: true,
        paraSpaceBefore: 8,
      },
    });

    const standardsWhy = localizedStandardsWhy(measure, lang);
    if (standardsWhy) {
      runs.push({
        text: `${t(lang, 'standardsWhy')}: `,
        options: { bold: true, fontSize: 10.5, color: COLORS.ink },
      });
      runs.push({
        text: standardsWhy,
        options: {
          fontSize: 10.5,
          color: COLORS.inkSoft,
          breakLine: true,
          paraSpaceAfter: 4,
        },
      });
    }

    standards.forEach((std) => {
      runs.push({
        text: std.label,
        options: { bold: true, fontSize: 10.5, color: COLORS.ink },
      });
      runs.push({
        text: `  ${std.controls.join(', ')}`,
        options: { fontSize: 10.5, color: COLORS.inkSoft, breakLine: true },
      });
    });
  }

  // Further reading
  if (measure.references && measure.references.length > 0) {
    runs.push({
      text: t(lang, 'referencesTitle'),
      options: {
        bold: true,
        fontSize: 13,
        color: COLORS.accentInk,
        breakLine: true,
        paraSpaceBefore: 8,
      },
    });
    measure.references.forEach((ref) => {
      runs.push({
        text: localized(ref, 'label', lang),
        options: { fontSize: 10, color: COLORS.inkSoft, bullet: true, breakLine: true },
      });
    });
  }

  return runs;
}

/**
 * Builds and downloads a PPTX file containing a title slide plus one slide per
 * GRIP measure. Each measure slide carries the full detail shown in the app:
 * title, summary, practical guidance (why/do/don't), the Microsoft mapping with
 * documentation links, and the standards mapping with control references.
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

  const locale = { fr: 'fr-BE', en: 'en-GB', nl: 'nl-BE' }[lang] || 'nl-BE';
  const today = new Date().toLocaleDateString(locale, {
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
    const tier = highestTier(measure);

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

    // Type + Basis
    slide.addText(
      `${measure.type === 'T' ? t(lang, 'technical') : t(lang, 'organisational')}  ·  Basis ${measure.basis}`,
      {
        x: 1.35,
        y: 0.22,
        w: 4.5,
        h: 0.32,
        fontSize: 11,
        bold: true,
        color: COLORS.inkSoft,
        valign: 'middle',
        fontFace: 'Segoe UI',
      }
    );

    // Tier badge (top-right)
    slide.addText(tier, {
      x: 12.4,
      y: 0.2,
      w: 0.6,
      h: 0.32,
      fontSize: 11,
      bold: true,
      color: COLORS.surface,
      fill: { color: tierColor(tier) },
      align: 'center',
      valign: 'middle',
      shape: pptx.ShapeType.roundRect,
      rectRadius: 0.05,
      fontFace: 'Segoe UI',
    });

    // Title
    slide.addText(localized(measure, 'title', lang), {
      x: 0.35,
      y: 0.66,
      w: 12.6,
      h: 0.7,
      fontSize: 18,
      bold: true,
      color: COLORS.ink,
      fontFace: 'Segoe UI',
      valign: 'top',
      fit: 'shrink',
    });

    // Summary
    slide.addText(localized(measure, 'summary', lang), {
      x: 0.35,
      y: 1.38,
      w: 12.6,
      h: 0.62,
      fontSize: 12,
      color: COLORS.inkSoft,
      fontFace: 'Segoe UI',
      valign: 'top',
      fit: 'shrink',
    });

    // Left column — practical guidance
    slide.addText(guidanceRuns(measure, lang), {
      x: 0.35,
      y: 2.12,
      w: 6.1,
      h: 5.2,
      fontFace: 'Segoe UI',
      valign: 'top',
      fit: 'shrink',
    });

    // Right column — Microsoft mapping + standards + references
    slide.addText(mappingRuns(measure, lang), {
      x: 6.65,
      y: 2.12,
      w: 6.3,
      h: 5.2,
      fontFace: 'Segoe UI',
      valign: 'top',
      fit: 'shrink',
    });

    // Slide footer code
    slide.addText(measure.code, {
      x: 12.5,
      y: 7.15,
      w: 0.8,
      h: 0.2,
      fontSize: 8,
      color: COLORS.inkFaint,
      align: 'right',
      fontFace: 'Segoe UI',
    });
  }

  await pptx.writeFile({ fileName: 'GRIP-Visualizer.pptx' });
}
