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
  search: 'M11 4a7 7 0 105.3 11.6L21 20.3M18 18l3 3', plus: 'M12 5v14M5 12h14',
  refresh: 'M20 11a8 8 0 00-14.9-3M4 5v4h4M4 13a8 8 0 0014.9 3M20 19v-4h-4',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14', filter: 'M4 5h16M7 12h10M10 19h4',
  edit: 'M4 20h4L19 9l-4-4L4 16v4M13.5 6.5l4 4', trash: 'M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3v13H8z',
  clock: 'M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0', check: 'M5 12l4 4L19 6',
  box: 'M4 7l8-4 8 4v10l-8 4-8-4V7zM4 7l8 4 8-4M12 11v10', truck: 'M3 6h11v10H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 100-4 2 2 0 000 4M18 19a2 2 0 100-4 2 2 0 000 4',
  close: 'M6 6l12 12M18 6L6 18', arrowUp: 'M12 19V5M6 11l6-6 6 6', arrowDown: 'M12 5v14M18 13l-6 6-6-6',
};

export default function Icon({ name, size = 20, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={PATHS[name]} />
    </svg>
  );
}
