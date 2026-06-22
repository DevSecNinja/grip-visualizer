import { describe, it, expect } from 'vitest';
import { render, within } from '@testing-library/react';
import PrintDocument from './PrintDocument.jsx';
import {
  getMeasures,
  findMeasure,
  localizedGuidance,
  standardsFor,
} from '../data/grip.js';

describe('PrintDocument', () => {
  it('renders one print page per measure plus a cover', () => {
    const { container } = render(<PrintDocument lang="nl" />);
    const pages = container.querySelectorAll('.print-page');
    expect(pages).toHaveLength(getMeasures().length);
    expect(container.querySelector('.print-cover')).not.toBeNull();
  });

  it('includes the full detail for a measure with guidance and standards', () => {
    // Guard the fixture assumption: T1 must carry guidance and standards.
    const t1 = findMeasure('T1');
    expect(localizedGuidance(t1, 'nl')).not.toBeNull();
    expect(standardsFor(t1).length).toBeGreaterThan(0);

    const { container } = render(<PrintDocument lang="nl" />);
    const t1Page = Array.from(container.querySelectorAll('.print-page')).find((page) =>
      within(page).queryByText('T1')
    );
    expect(t1Page).toBeTruthy();
    const scoped = within(t1Page);
    expect(scoped.getByText('Praktische richtlijnen')).toBeInTheDocument();
    expect(scoped.getByText('Wel doen')).toBeInTheDocument();
    expect(scoped.getByText('Niet doen')).toBeInTheDocument();
    expect(scoped.getByText('Microsoft-koppeling')).toBeInTheDocument();
    expect(scoped.getByText('Koppeling met standaarden')).toBeInTheDocument();
    // Documentation URL is rendered as text in the print output.
    expect(scoped.getByText(/learn\.microsoft\.com/)).toBeInTheDocument();
  });

  it('renders the self-evaluation status and note when assessment data is provided', () => {
    const assessment = {
      measures: {
        T1: { status: 'done', note: 'Implemented and reviewed.' },
      },
    };
    const { container } = render(<PrintDocument lang="en" assessment={assessment} />);
    const t1Page = Array.from(container.querySelectorAll('.print-page')).find((page) =>
      within(page).queryByText('T1')
    );
    const scoped = within(t1Page);
    expect(scoped.getByText('Self-assessment')).toBeInTheDocument();
    expect(scoped.getByText('Implemented and reviewed.')).toBeInTheDocument();

    // A measure without an entry shows the empty-state placeholder.
    const otherPage = Array.from(container.querySelectorAll('.print-page')).find((page) =>
      within(page).queryByText('O1')
    );
    expect(
      within(otherPage).getByText('No self-assessment provided')
    ).toBeInTheDocument();
  });

  it('omits the self-evaluation section when no assessment is provided', () => {
    const { container } = render(<PrintDocument lang="en" />);
    expect(container.querySelector('.print-self-eval')).toBeNull();
  });
});
