import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

describe('App', () => {
  it('renders the matrix with all six Basis columns by default', () => {
    render(<App />);
    expect(screen.getByRole('region', { name: 'Matrix' })).toBeInTheDocument();
    expect(screen.getAllByText('Basis')).toHaveLength(6);
  });

  it('opens the detail panel with the Microsoft mapping when a measure is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /O7/ }));
    const panel = screen.getByText('Microsoft-koppeling').closest('aside');
    expect(within(panel).getByText('Conditional Access')).toBeInTheDocument();
  });

  it('shows the standards mapping for a mapped measure', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /O7/ }));
    const panel = screen.getByText('Microsoft-koppeling').closest('aside');
    expect(within(panel).getByText('Koppeling met standaarden')).toBeInTheDocument();
    expect(within(panel).getByText(/ISO\/IEC 27002/)).toBeInTheDocument();
    expect(within(panel).getByText('5.17')).toBeInTheDocument();
  });

  it('shows the practical guidance section for a seeded measure', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /O7/ }));
    const panel = screen.getByText('Microsoft-koppeling').closest('aside');
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

  it('renders the Prioritize view with three horizon columns', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Prioriteren' }));
    expect(screen.getByText('Korte termijn')).toBeInTheDocument();
    expect(screen.getByText('Middellange termijn')).toBeInTheDocument();
    expect(screen.getByText('Lange termijn')).toBeInTheDocument();
  });
});
