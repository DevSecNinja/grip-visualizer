import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

describe('App', () => {
  afterEach(() => {
    // Reset any `?lang=` query the app may have written so each test starts
    // from a clean default-language URL.
    window.history.replaceState(null, '', '/');
  });

  it('renders the matrix with all six Basis columns by default', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: 'Matrix' })).toBeInTheDocument();
    expect(screen.getAllByText('Basis')).toHaveLength(6);
  });

  it('opens the detail panel with the Microsoft mapping when a measure is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /O7/ }));
    const panel = screen.getByRole('complementary');
    expect(within(panel).getByText('Conditional Access')).toBeInTheDocument();
  });

  it('shows the Microsoft value statement for a mapped product', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /T11/ }));
    const panel = screen.getByRole('complementary');
    expect(within(panel).getAllByText('Microsoft-meerwaarde:').length).toBeGreaterThan(0);
    expect(within(panel).getByText(/5 MB per gebruiker per dag/)).toBeInTheDocument();
  });

  it('shows the standards mapping for a mapped measure', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /O7/ }));
    const panel = screen.getByRole('complementary');
    expect(within(panel).getByText('Koppeling met standaarden')).toBeInTheDocument();
    expect(within(panel).getByText(/CIS Controls v8/)).toBeInTheDocument();
    expect(within(panel).getByText('6.3')).toBeInTheDocument();
    expect(within(panel).getByText('Waarom deze koppeling:')).toBeInTheDocument();
  });

  it('shows the practical guidance section for a seeded measure', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /O7/ }));
    const panel = screen.getByRole('complementary');
    expect(within(panel).getByText('Praktische richtlijnen')).toBeInTheDocument();
    expect(within(panel).getByText('Wel doen')).toBeInTheDocument();
    expect(within(panel).getByText('Niet doen')).toBeInTheDocument();
  });

  it('switches to the journey view', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Groeitraject' }));
    expect(screen.getByRole('region', { name: 'Groeitraject' })).toBeInTheDocument();
  });

  it('switches the UI language to English', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByRole('tab', { name: 'Journey' })).toBeInTheDocument();
  });

  it('switches the UI language to French', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'FR' }));
    expect(screen.getByRole('tab', { name: 'Parcours' })).toBeInTheDocument();
  });

  it('starts in the language requested by the ?lang= URL parameter', () => {
    window.history.replaceState(null, '', '/?lang=en');
    render(<App />);
    expect(screen.getByRole('tab', { name: 'Journey' })).toBeInTheDocument();
  });

  it('falls back to Dutch for an unknown ?lang= URL parameter', () => {
    window.history.replaceState(null, '', '/?lang=xx');
    render(<App />);
    expect(screen.getByRole('tab', { name: 'Groeitraject' })).toBeInTheDocument();
  });

  it('reflects the selected language in the URL for sharing', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'FR' }));
    expect(new URLSearchParams(window.location.search).get('lang')).toBe('fr');
  });

  it('removes the lang parameter when switching back to Dutch', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'FR' }));
    expect(new URLSearchParams(window.location.search).get('lang')).toBe('fr');
    await user.click(screen.getByRole('button', { name: 'NL' }));
    expect(new URLSearchParams(window.location.search).get('lang')).toBe(null);
  });

  it('renders the Prioritize view with three horizon columns', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Prioriteren' }));
    expect(screen.getByText('Korte termijn')).toBeInTheDocument();
    expect(screen.getByText('Middellange termijn')).toBeInTheDocument();
    expect(screen.getByText('Lange termijn')).toBeInTheDocument();
  });
});
