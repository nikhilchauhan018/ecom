import Form from 'react-bootstrap/Form';
import Icon from '../ui/Icon';
import { site } from '../../config/site';

function IconButton({ icon, label, count, hideOnPhone, onClick }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className={`tw-relative tw-grid tw-h-11 tw-w-11 tw-cursor-pointer tw-place-items-center tw-border-0 tw-bg-transparent tw-text-[#dbe3f0] ${hideOnPhone ? 'tw-hidden sm:tw-grid' : ''}`}>
      <Icon name={icon} size={icon === 'menu' ? 24 : 20} />
      {count != null && (
        <b className="tw-absolute tw-right-0 tw-top-0.5 tw-grid tw-h-5 tw-min-w-5 tw-place-items-center tw-rounded-full tw-bg-danger tw-px-1 tw-text-[11px] tw-font-bold tw-text-white">{count}</b>
      )}
    </button>
  );
}

export default function Topbar({ onToggleNav, theme, onToggleTheme, searchRef }) {
  return (
    <header className="tw-sticky tw-top-0 tw-z-[5] tw-flex tw-h-16 tw-items-center tw-gap-3 tw-bg-topbar tw-px-5 tw-text-white">
      <IconButton icon="menu" label="Toggle menu" onClick={onToggleNav} />
      <span className="tw-mr-3 tw-hidden tw-whitespace-nowrap tw-text-xl tw-font-semibold md:tw-inline">{site.name}</span>

      <div className="tw-relative tw-min-w-0 tw-flex-1 md:tw-flex-[0_1_400px]">
        <label className="visually-hidden-input" htmlFor="global-search">Search</label>
        <Form.Control id="global-search" ref={searchRef} type="search" placeholder="Search" autoComplete="off" maxLength={100}
          className="tw-h-11 tw-rounded-lg tw-border-[#35574d] tw-bg-[#183029] tw-pl-[14px] tw-pr-[14px] tw-text-sm tw-text-white placeholder:tw-text-[#b4bfd3] lg:tw-pr-[120px]" />
        <kbd className="tw-absolute tw-right-[10px] tw-top-3 tw-hidden tw-rounded-md tw-border tw-border-solid tw-border-[#35574d] tw-bg-transparent tw-px-1.5 tw-py-0.5 tw-text-xs tw-text-[#c3cde0] lg:tw-block">ctrl/cmd + k</kbd>
      </div>

      <span className="tw-hidden tw-flex-1 md:tw-block" />

      <a href={site.storeUrl} target="_blank" rel="noopener noreferrer"
        className="tw-inline-flex tw-h-11 tw-items-center tw-gap-2 tw-whitespace-nowrap tw-rounded-lg tw-border tw-border-solid tw-border-[#35574d] tw-px-[14px] tw-text-white hover:tw-bg-[#183029] hover:tw-text-white">
        <Icon name="globe" /><span className="tw-hidden md:tw-inline">View website</span>
      </a>

      <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={onToggleTheme} />
      <IconButton icon="bell" label="Notifications, 1 unread" count={1} />
      <IconButton icon="mail" label="Messages, 10 unread" count={10} hideOnPhone />
      <IconButton icon="cart" label="New orders, 48" count={48} hideOnPhone />

      <div className="tw-ml-2 tw-flex tw-items-center tw-gap-[10px]">
        <div aria-hidden="true" className="tw-grid tw-h-11 tw-w-11 tw-place-items-center tw-rounded-lg tw-bg-gold tw-font-semibold tw-text-gold-ink">{site.owner.name.replace(/[^A-Za-z]/g, '').charAt(0) || 'O'}</div>
        <div className="tw-hidden tw-leading-[1.3] md:tw-block">
          <strong>{site.owner.name}</strong><br /><small className="tw-text-[#b4bfd3]">{site.owner.email}</small>
        </div>
      </div>
    </header>
  );
}
