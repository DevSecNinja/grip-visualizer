import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PptxGenJS from 'pptxgenjs';
import { exportPDF, exportPPTX } from './export.js';
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
});

// ── ExportMenu component ─────────────────────────────────────────────────────

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

  it('opens the dropdown on click and shows PDF and PowerPoint options', async () => {
    const user = userEvent.setup();
    render(<ExportMenu lang="nl" />);
    await user.click(screen.getByRole('button', { name: /exporteren/i }));
    expect(screen.getByRole('menuitem', { name: /pdf/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /powerpoint/i })).toBeInTheDocument();
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
