const PATHS = {
  menu: 'M4 6h16M4 12h16M4 18h16', globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  moon: 'M20 14A8 8 0 019.5 4 8 8 0 1020 14z', sun: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
  bell: 'M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 004 0', mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  cart: 'M3 4h3l3 12h9l2-8H7', home: 'M3 11l9-8 9 8M5 10v10h14V10', bag: 'M6 8h12l-1 12H7zM9 8a3 3 0 016 0',
  page: 'M6 3h9l3 3v15H6zM9 11h6M9 15h6', list: 'M5 6h14M5 12h14M5 18h14', card: 'M3 6h18v12H3zM3 10h18',
  megaphone: 'M3 10v4h4l8 4V6L7 10zM18 9v6', image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 5',
  help: 'M12 17v.01M9.5 9a2.5 2.5 0 115 0c0 2-2.5 2-2.5 4', folder: 'M3 6h6l2 2h10v11H3z',
  brush: 'M4 20c0-3 2-4 4-4l9-9 3 3-9 9c0 2-1 4-7 4', wrench: 'M14 6a4 4 0 005 5l-9 9-3-3 9-9',
  cog: 'M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3', chevron: 'M6 9l6 6 6-6',
};

export default function Icon({ name, size = 20, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={PATHS[name]} />
    </svg>
  );
}
