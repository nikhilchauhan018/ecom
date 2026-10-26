export const navItems = [
  { label: 'Dashboard', icon: 'home', to: '/' },
  {
    label: 'Ecommerce', icon: 'bag', badge: 48,
    children: ['Orders', 'Products', 'Categories', 'Customers', 'Discounts', 'Returns', 'Reviews', 'Shipping', 'Notifications']
      .map((label) => ({ label, to: `/ecommerce/${label.toLowerCase()}` })),
  },
  { label: 'Pages', icon: 'page', to: '/pages' },
  { label: 'Blog', icon: 'list', to: '/blog', chevron: true },
  { label: 'Payments', icon: 'card', to: '/payments', chevron: true },
  { label: 'Ads', icon: 'megaphone', to: '/ads', chevron: true },
  { label: 'Contact', icon: 'mail', to: '/contact', badge: 56, chevron: true },
  { label: 'Sliders', icon: 'image', to: '/sliders' },
  { label: 'FAQs', icon: 'help', to: '/faqs', chevron: true },
  { label: 'Newsletters', icon: 'mail', to: '/newsletters' },
  { label: 'Locations', icon: 'globe', to: '/locations', chevron: true },
  { label: 'Media', icon: 'folder', to: '/media' },
  { label: 'Appearance', icon: 'brush', to: '/appearance', chevron: true },
  { label: 'Tools', icon: 'wrench', to: '/tools', chevron: true },
  { label: 'Settings', icon: 'cog', to: '/settings' },
];
