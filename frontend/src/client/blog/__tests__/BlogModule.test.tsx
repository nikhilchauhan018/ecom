import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BlogModule } from '../components/BlogModule';
import { emptyPostInput } from '../defaults';
import { createPost, resetBlogDb } from '../services/blogService';

beforeEach(() => resetBlogDb());
afterEach(() => cleanup());

describe('Posts', () => {
  it('lists posts and filters by search', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="posts" />);
    expect(await screen.findByRole('button', { name: 'Care guide for linen shirts' })).toBeTruthy();
    await user.type(screen.getByLabelText('Search posts by title'), 'festive');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Care guide for linen shirts' })).toBeNull());
    expect(screen.getByRole('button', { name: 'Festive collection is here' })).toBeTruthy();
  });

  it('shows hostile text as plain text and never creates real HTML elements', async () => {
    const payload = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>';
    const created = await createPost({ ...emptyPostInput(), title: payload, slug: 'xss-test' });
    expect(created.ok).toBe(true);
    const { container } = render(<BlogModule section="posts" />);
    expect(await screen.findByRole('button', { name: payload })).toBeTruthy();
    expect(container.querySelector('img, script')).toBeNull();
    expect((window as unknown as { __xss?: number }).__xss).toBeUndefined();
  });

  it('shows validation errors, blocks saving, and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="posts" />);
    await user.click(await screen.findByRole('button', { name: 'Create post' }));
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    expect(await screen.findAllByText('This field is required')).not.toHaveLength(0);
    expect(document.activeElement?.getAttribute('aria-invalid')).toBe('true');
  });

  it('auto-fills the permalink and saves a new post with a category and tag', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="posts" />);
    await user.click(await screen.findByRole('button', { name: 'Create post' }));
    await user.type(await screen.findByLabelText(/^Title/), 'Winter Jackets 2026');
    expect((screen.getByLabelText(/^Permalink/) as HTMLInputElement).value).toBe('winter-jackets-2026');
    await user.selectOptions(screen.getByLabelText('Category'), 'News');
    await user.click(screen.getByLabelText('linen'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Post saved.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Edit “Winter Jackets 2026”' })).toBeTruthy();
  });

  it('shows a server permalink conflict on the permalink field', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="posts" />);
    await user.click(await screen.findByRole('button', { name: 'Create post' }));
    await user.type(await screen.findByLabelText(/^Title/), 'Anything');
    const slug = screen.getByLabelText(/^Permalink/);
    await user.clear(slug);
    await user.type(slug, 'behind-the-scenes');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('This permalink is already used')).toBeTruthy();
  });

  it('asks before leaving with unsaved changes', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="posts" />);
    await user.click(await screen.findByRole('button', { name: 'Create post' }));
    await user.type(await screen.findByLabelText(/^Title/), 'Draft');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Leave page' }));
    expect(await screen.findByRole('heading', { name: 'Posts' })).toBeTruthy();
  });

  it('adds an image block and asks for an image and a description', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="posts" />);
    await user.click(await screen.findByRole('button', { name: 'Create post' }));
    await user.type(await screen.findByLabelText(/^Title/), 'With image');
    await user.selectOptions(screen.getByLabelText('Add block'), 'Image');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Upload an image or paste an https:// link')).toBeTruthy();
    expect(screen.getByLabelText(/^Image description/).getAttribute('aria-invalid')).toBe('true');
  });
});

describe('Featured image upload', () => {
  const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];

  it('uploads an image and lets the user remove it', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="posts" />);
    await user.click(await screen.findByRole('button', { name: 'Create post' }));
    const png = new File([new Uint8Array(PNG)], 'shirt.png', { type: 'image/png' });
    await user.upload(await screen.findByLabelText('Choose image file'), png);
    expect(await screen.findByRole('button', { name: 'Replace image' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(await screen.findByRole('button', { name: 'Upload image' })).toBeTruthy();
  });

  it('rejects a file that is not a real image', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="posts" />);
    await user.click(await screen.findByRole('button', { name: 'Create post' }));
    const fake = new File(['hello'], 'fake.png', { type: 'image/png' });
    await user.upload(await screen.findByLabelText('Choose image file'), fake);
    expect(await screen.findByText(/not a real JPG, PNG or WebP/)).toBeTruthy();
  });
});

describe('Categories and tags', () => {
  it('adds a category with an auto permalink', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="categories" />);
    await user.type(await screen.findByLabelText(/^Name/), 'Sale News');
    expect((screen.getByLabelText(/^Permalink/) as HTMLInputElement).value).toBe('sale-news');
    await user.click(screen.getByRole('button', { name: 'Add category' }));
    expect(await screen.findByText('Category saved.')).toBeTruthy();
    expect(await screen.findByRole('cell', { name: 'Sale News' })).toBeTruthy();
  });

  it('shows validation and duplicate permalink errors', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="categories" />);
    await screen.findByRole('cell', { name: 'News' });
    await user.click(screen.getByRole('button', { name: 'Add category' }));
    expect(await screen.findByText('This field is required')).toBeTruthy();
    await user.type(screen.getByLabelText(/^Name/), 'News again');
    const slug = screen.getByLabelText(/^Permalink/);
    await user.clear(slug);
    await user.type(slug, 'news');
    await user.click(screen.getByRole('button', { name: 'Add category' }));
    expect(await screen.findByText('This permalink is already used')).toBeTruthy();
  });

  it('disables delete for a category that posts still use', async () => {
    render(<BlogModule section="categories" />);
    const del = await screen.findByRole('button', { name: 'Delete Style guides' });
    expect((del as HTMLButtonElement).disabled).toBe(true);
  });

  it('deletes an unused tag after confirming', async () => {
    const user = userEvent.setup();
    render(<BlogModule section="tags" />);
    await user.type(await screen.findByLabelText(/^Name/), 'spare');
    await user.click(screen.getByRole('button', { name: 'Add tag' }));
    await user.click(await screen.findByRole('button', { name: 'Delete spare' }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByRole('cell', { name: 'spare' })).toBeNull());
  });

  it('hides the description field for tags', async () => {
    render(<BlogModule section="tags" />);
    await screen.findByLabelText(/^Name/);
    expect(screen.queryByLabelText(/^Description/)).toBeNull();
  });
});
