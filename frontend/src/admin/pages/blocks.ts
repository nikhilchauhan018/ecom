import type { Block, BlockType } from './schema';
import { newId } from './utils/id';

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: 'Heading',
  text: 'Text',
  map: 'Google map',
  contactInfo: 'Contact info',
  contactForm: 'Contact form',
  productCollection: 'Product collection',
  sizeGuide: 'Size guide table',
  newsletter: 'Newsletter signup',
};

export const BLOCK_TYPES = Object.keys(BLOCK_LABELS) as BlockType[];

export function createBlock(type: BlockType): Block {
  const id = newId();
  switch (type) {
    case 'heading':
      return { id, type, text: '', level: 2 };
    case 'text':
      return { id, type, text: '' };
    case 'map':
      return { id, type, address: '' };
    case 'contactInfo':
      return { id, type, title: 'Contact us', phone: '', email: '' };
    case 'contactForm':
      return { id, type, successMessage: 'Thanks. We will reply within one working day.' };
    case 'productCollection':
      return { id, type, collectionSlug: 'new-arrivals', limit: 8 };
    case 'sizeGuide':
      return { id, type, title: 'Size guide', unit: 'cm' };
    case 'newsletter':
      return { id, type, heading: 'Get new arrivals first' };
  }
}

export function describeBlock(block: Block): string {
  switch (block.type) {
    case 'heading':
      return block.text || 'Empty heading';
    case 'text':
      return block.text.slice(0, 80) || 'Empty text';
    case 'map':
      return block.address || 'No address yet';
    case 'contactInfo':
      return block.title;
    case 'contactForm':
      return 'Name, email, phone and message';
    case 'productCollection':
      return `${block.collectionSlug}, ${block.limit} products`;
    case 'sizeGuide':
      return `${block.title} (${block.unit})`;
    case 'newsletter':
      return block.heading;
  }
}
