import { useRef, useState, useEffect } from 'react';
import { t } from '../i18n/strings.js';
import { exportPDF, exportPPTX } from '../data/export.js';

export default function ExportMenu({ lang }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  async function handlePptx() {
    setOpen(false);
    setExporting(true);
    try {
      await exportPPTX(lang);
    } finally {
      setExporting(false);
    }
  }

  function handlePdf() {
    setOpen(false);
    exportPDF();
  }

  return (
    <div className="export-menu" ref={menuRef}>
      <button
        type="button"
        className={`export-menu__trigger${open ? ' is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t(lang, 'exportLabel')}
        disabled={exporting}
        onClick={() => setOpen((v) => !v)}
      >
        {exporting ? (
          <svg
            className="export-menu__spinner"
            viewBox="0 0 16 16"
            aria-hidden="true"
            width="14"
            height="14"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="28"
              strokeDashoffset="10"
            />
          </svg>
        ) : (
          <svg
            className="export-menu__icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
            width="14"
            height="14"
          >
            <path
              d="M8 1v9M4.5 7l3.5 3.5L11.5 7M2 12v1.5A1.5 1.5 0 0 0 3.5 15h9A1.5 1.5 0 0 0 14 13.5V12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span>{t(lang, 'exportLabel')}</span>
        <svg
          className={`export-menu__caret${open ? ' is-open' : ''}`}
          viewBox="0 0 10 6"
          aria-hidden="true"
          width="10"
          height="6"
        >
          <path
            d="M1 1l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <ul className="export-menu__dropdown" role="menu">
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="export-menu__item"
              aria-label={t(lang, 'exportPdfAria')}
              onClick={handlePdf}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" width="14" height="14">
                <rect
                  x="2"
                  y="1"
                  width="10"
                  height="13"
                  rx="1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M5 5h4M5 8h4M5 11h2"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <text x="10" y="13" fontSize="4" fill="currentColor" fontWeight="bold">
                  PDF
                </text>
              </svg>
              {t(lang, 'exportPdf')}
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="export-menu__item"
              aria-label={t(lang, 'exportPptxAria')}
              onClick={handlePptx}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" width="14" height="14">
                <rect
                  x="2"
                  y="2"
                  width="12"
                  height="9"
                  rx="1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M8 11v3M5 14h6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              {t(lang, 'exportPptx')}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
