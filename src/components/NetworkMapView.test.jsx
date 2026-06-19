import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NetworkMapView from './NetworkMapView.jsx';

// The force simulation uses requestAnimationFrame; mock it so the tests do
// not run an infinite animation loop in jsdom.
beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', () => 0);
  vi.stubGlobal('cancelAnimationFrame', () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NetworkMapView', () => {
  it('renders with the correct accessible region label (NL)', () => {
    render(<NetworkMapView lang="nl" selectedCode={null} onSelect={() => {}} />);
    expect(screen.getByRole('region', { name: 'Netwerk' })).toBeInTheDocument();
  });

  it('renders with the correct accessible region label (EN)', () => {
    render(<NetworkMapView lang="en" selectedCode={null} onSelect={() => {}} />);
    expect(screen.getByRole('region', { name: 'Network' })).toBeInTheDocument();
  });

  it('renders with the correct accessible region label (FR)', () => {
    render(<NetworkMapView lang="fr" selectedCode={null} onSelect={() => {}} />);
    expect(screen.getByRole('region', { name: 'Réseau' })).toBeInTheDocument();
  });

  it('renders an SVG canvas', () => {
    const { container } = render(
      <NetworkMapView lang="nl" selectedCode={null} onSelect={() => {}} />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders measure nodes labelled with their codes', () => {
    render(<NetworkMapView lang="nl" selectedCode={null} onSelect={() => {}} />);
    // O1 is the first measure in the dataset; its code should appear as a text label
    expect(screen.getByText('O1')).toBeInTheDocument();
  });

  it('shows the legend', () => {
    render(<NetworkMapView lang="nl" selectedCode={null} onSelect={() => {}} />);
    expect(screen.getByRole('list', { name: 'Legenda' })).toBeInTheDocument();
  });

  it('shows the legend in English when lang=en', () => {
    render(<NetworkMapView lang="en" selectedCode={null} onSelect={() => {}} />);
    expect(screen.getByRole('list', { name: 'Legend' })).toBeInTheDocument();
  });

  it('calls onSelect with the measure code when a measure node is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<NetworkMapView lang="nl" selectedCode={null} onSelect={onSelect} />);
    // Each measure node is a <g> with an aria-label on its inner text element
    // We can find the "O1" label text and click the parent group
    const label = screen.getByText('O1');
    await user.click(label);
    expect(onSelect).toHaveBeenCalledWith('O1');
  });

  it('deselects a measure when the same node is clicked while selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<NetworkMapView lang="nl" selectedCode="O1" onSelect={onSelect} />);
    const label = screen.getByText('O1');
    await user.click(label);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('dims measures that do not match the active type filter', () => {
    render(
      <NetworkMapView
        lang="nl"
        selectedCode={null}
        onSelect={() => {}}
        typeFilter="O"
        tierFilter={null}
      />
    );
    // O1 is organisational → stays visible; T1 is technical → dimmed
    const orgGroup = screen.getByText('O1').closest('.nm-node');
    const techGroup = screen.getByText('T1').closest('.nm-node');
    expect(Number(orgGroup.style.opacity)).toBe(1);
    expect(Number(techGroup.style.opacity)).toBeLessThan(1);
  });
});
