import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PagesModule } from '../components/PagesModule';
import { resetPagesDb } from '../services/pagesService';

beforeEach(() => resetPagesDb());
afterEach(() => cleanup());

describe('PagesModule', () => {
  it('lists pages and filters by search', async () => {
    const user = userEvent.setup();
    render(<PagesModule />);
    expect(await screen.findByRole('button', { name: 'Contact' })).toBeTruthy();
    await user.type(screen.getByLabelText('Search pages by name'), 'faq');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Contact' })).toBeNull());
    expect(screen.getByRole('button', { name: 'FAQs' })).toBeTruthy();
  });

  it('disables delete for system pages', async () => {
    render(<PagesModule />);
    const del = await screen.findByRole('button', { name: 'Delete Cookie policy' });
    expect((del as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows validation errors and blocks saving an empty page', async () => {
    const user = userEvent.setup();
    render(<PagesModule />);
    await user.click(await screen.findByRole('button', { name: 'Create page' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findAllByText('This field is required')).not.toHaveLength(0);
    expect(document.activeElement?.getAttribute('aria-invalid')).toBe('true');
  });

  it('auto-fills the permalink from the name and saves a new page', async () => {
    const user = userEvent.setup();
    render(<PagesModule />);
    await user.click(await screen.findByRole('button', { name: 'Create page' }));
    await user.type(screen.getByLabelText(/^Name/), 'Gift Cards');
    expect((screen.getByLabelText(/^Permalink/) as HTMLInputElement).value).toBe('gift-cards');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Page saved.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Edit “Gift Cards”' })).toBeTruthy();
  });

  it('asks before leaving with unsaved changes', async () => {
    const user = userEvent.setup();
    render(<PagesModule />);
    await user.click(await screen.findByRole('button', { name: 'Create page' }));
    await user.type(screen.getByLabelText(/^Name/), 'Draft');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Leave page' }));
    expect(await screen.findByRole('heading', { name: 'Pages' })).toBeTruthy();
  });

  it('adds a block and reports its field error with the right label', async () => {
    const user = userEvent.setup();
    render(<PagesModule />);
    await user.click(await screen.findByRole('button', { name: 'Create page' }));
    await user.type(screen.getByLabelText(/^Name/), 'Story');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('This field is required')).toBeTruthy();
    expect(screen.getByLabelText(/^Text/).getAttribute('aria-invalid')).toBe('true');
  });
});
