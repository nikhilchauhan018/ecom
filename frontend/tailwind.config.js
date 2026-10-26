/** Tailwind sits next to Bootstrap, so: prefix `tw-` (no class-name clashes: .container/.collapse/.visible/.table…)
 *  and preflight OFF (Bootstrap's Reboot is the reset). Breakpoints match the design (820 / 1100 / 520). */
export default {
  prefix: 'tw-',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false },
  theme: {
    screens: { sm: '521px', md: '821px', lg: '1101px' }, // mobile-first
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        page: 'var(--c-page)', card: 'var(--c-card)', ink: 'var(--c-ink)', muted: 'var(--c-muted)',
        soft: 'var(--c-soft)', line: 'var(--c-line)', hair: 'var(--c-hair)', field: 'var(--c-field)',
        brand: '#1f7a62', 'brand-dark': '#0f4c3d', 'brand-chart': '#1f6f5b', 'brand-chip': '#17614e',
        topbar: '#10231f', side: '#17332c', 'side-hover': '#21443a',
        gold: '#d9a441', 'gold-ink': '#2b1d00', danger: '#d92d20',
      },
      borderRadius: { card: '14px' },
    },
  },
  plugins: [],
};
