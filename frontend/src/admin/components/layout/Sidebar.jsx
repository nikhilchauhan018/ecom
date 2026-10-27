import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';
import { navItems } from '../../config/navigation';
import { getOrderCounts } from '../../services/api/orders';

const row = 'tw-flex tw-items-center tw-gap-3 tw-px-4 md:tw-px-5 tw-whitespace-nowrap md:tw-whitespace-normal tw-cursor-pointer tw-border-0 tw-w-auto md:tw-w-full tw-text-left tw-text-[15px]';
const idle = 'tw-bg-transparent tw-text-[#e3e9f5] hover:tw-bg-side-hover hover:tw-text-white';
const active = 'tw-bg-brand tw-text-white hover:tw-bg-brand hover:tw-text-white';

function Badge({ children, on, ariaLabel }) {
  return <span aria-label={ariaLabel} className={`tw-rounded-full tw-px-[9px] tw-py-px tw-text-xs ${on ? 'tw-bg-brand-dark' : 'tw-bg-brand-chip'} tw-text-white`}>{children}</span>;
}
const Chevron = ({ open }) => (
  <span className={`tw-ml-auto tw-grid ${open === false ? '-tw-rotate-90' : ''}`}><Icon name="chevron" size={16} /></span>
);

function Group({ item, counts }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`${row} tw-min-h-11 ${idle}`}>
        <Icon name={item.icon} />{item.label}{item.badge && <Badge>{item.badge}</Badge>}<Chevron open={open} />
      </button>
      {open && item.children.map((c) => (
        <NavLink key={c.to} to={c.to}
          className={({ isActive }) => `${row} md:tw-pl-[52px] tw-min-h-10 tw-text-[13.5px] ${isActive ? active : idle}`}>
          {({ isActive }) => {
            const count = c.badge?.source ? counts[c.badge.source] : 0;
            const visibleCount = count > 99 ? '99+' : count;
            return <>{c.label}{count > 0 && <Badge on={isActive} ariaLabel={`${c.label}, ${count} pending`}>{visibleCount}</Badge>}</>;
          }}
        </NavLink>
      ))}
    </>
  );
}

export default function Sidebar() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let active = true;
    getOrderCounts().then((result) => {
      if (active) setCounts(result);
    }).catch(() => {
      if (active) setCounts({});
    });
    return () => { active = false; };
  }, []);

  return (
    <nav aria-label="Main"
      className="tw-flex tw-flex-row tw-overflow-x-auto tw-bg-side md:tw-sticky md:tw-top-16 md:tw-h-[calc(100vh-64px)] md:tw-flex-col md:tw-self-start md:tw-overflow-y-auto md:tw-overflow-x-hidden md:tw-py-2">
      {navItems.map((item) => item.children ? <Group key={item.label} item={item} counts={counts} /> : (
        <NavLink key={item.label} to={item.to} end={item.to === '/'}
          className={({ isActive }) => `${row} tw-min-h-11 ${isActive ? active : idle}`}>
          {({ isActive }) => (<>
            <Icon name={item.icon} />{item.label}
            {item.badge && <Badge on={isActive}>{item.badge}</Badge>}
            {item.chevron && <Chevron />}
          </>)}
        </NavLink>
      ))}
    </nav>
  );
}
