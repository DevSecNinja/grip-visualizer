import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PptxGenJS from 'pptxgenjs';
import { exportPDF, exportPPTX, exportMarkdown } from './export.js';
import ExportMenu from '../components/ExportMenu.jsx';

// ── exportPDF ────────────────────────────────────────────────────────────────

describe('exportPDF', () => {
  it('calls window.print()', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    exportPDF();
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});

// ── exportPPTX ───────────────────────────────────────────────────────────────

describe('exportPPTX', () => {
  it('builds and writes a deck for all supported languages', async () => {
    // Stub writeFile so the test never touches the filesystem.
    const writeSpy = vi
      .spyOn(PptxGenJS.prototype, 'writeFile')
      .mockResolvedValue(undefined);
    for (const lang of ['nl', 'en', 'fr']) {
      await expect(exportPPTX(lang)).resolves.not.toThrow();
    }
    expect(writeSpy).toHaveBeenCalledTimes(3);
    writeSpy.mockRestore();
  });

  it('builds a deck that includes self-evaluation data without throwing', async () => {
    const writeSpy = vi
      .spyOn(PptxGenJS.prototype, 'writeFile')
      .mockResolvedValue(undefined);
    const assessment = {
      measures: {
        O1: { status: 'in_progress', note: 'Rolling this out across teams.' },
      },
    };
    await expect(exportPPTX('en', assessment)).resolves.not.toThrow();
    expect(writeSpy).toHaveBeenCalledTimes(1);
    writeSpy.mockRestore();
  });
});

// ── exportMarkdown ───────────────────────────────────────────────────────────

describe('exportMarkdown', () => {
  let createSpy;
  let revokeSpy;
  let clickSpy;
  let lastBlob;

  beforeEach(() => {
    lastBlob = null;
    createSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      lastBlob = blob;
      return 'blob:mock';
    });
    revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    createSpy.mockRestore();
    revokeSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it('builds and downloads a Markdown document for all supported languages', async () => {
    for (const lang of ['nl', 'en', 'fr']) {
      expect(() => exportMarkdown(lang)).not.toThrow();
    }
    expect(clickSpy).toHaveBeenCalledTimes(3);
    expect(revokeSpy).toHaveBeenCalledTimes(3);
  });

  it('includes the full measure detail (Microsoft mapping, standards, guidance)', async () => {
    exportMarkdown('nl');
    expect(lastBlob).toBeInstanceOf(Blob);
    const text = await lastBlob.text();
    // Title and a measure heading
    expect(text).toContain('# GRIP');
    expect(text).toMatch(/## \w+ —/);
    // Section headings from the app detail
    expect(text).toContain('Microsoft-koppeling');
    expect(text).toContain('Koppeling met standaarden');
    // Standards link with a control reference (NIS2)
    expect(text).toContain('NIS2 Directive (EU) 2022/2555');
  });

  it('omits the self-evaluation section when no assessment is provided', async () => {
    exportMarkdown('en');
    const text = await lastBlob.text();
    expect(text).not.toContain('### Self-assessment');
  });

  it('includes the self-evaluation status and note for measures with data', async () => {
    const assessment = {
      measures: {
        O1: { status: 'done', note: 'We finished this measure last quarter.' },
      },
    };
    exportMarkdown('en', assessment);
    const text = await lastBlob.text();
    expect(text).toContain('### Self-assessment');
    expect(text).toContain('**Progress:** Done');
    expect(text).toContain('**Note:** We finished this measure last quarter.');
    // A measure without an entry falls back to the empty-state placeholder.
    expect(text).toContain('No self-assessment provided');
  });
});

describe('ExportMenu', () => {
  let printSpy;

  beforeEach(() => {
    printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  afterEach(() => {
    printSpy.mockRestore();
  });

  it('renders an export trigger button', () => {
    render(<ExportMenu lang="nl" />);
    expect(screen.getByRole('button', { name: /exporteren/i })).toBeInTheDocument();
  });

  it('opens the dropdown on click and shows PDF, PowerPoint and Markdown options', async () => {
    const user = userEvent.setup();
    render(<ExportMenu lang="nl" />);
    await user.click(screen.getByRole('button', { name: /exporteren/i }));
    expect(screen.getByRole('menuitem', { name: /pdf/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /powerpoint/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /markdown/i })).toBeInTheDocument();
  });

  it('closes the dropdown when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<ExportMenu lang="nl" />);
    await user.click(screen.getByRole('button', { name: /exporteren/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls window.print when the PDF option is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportMenu lang="en" />);
    await user.click(screen.getByRole('button', { name: /export/i }));
    await user.click(screen.getByRole('menuitem', { name: /pdf/i }));
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('renders in English', () => {
    render(<ExportMenu lang="en" />);
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('renders in French', () => {
    render(<ExportMenu lang="fr" />);
    expect(screen.getByRole('button', { name: /exporter/i })).toBeInTheDocument();
  });
});
