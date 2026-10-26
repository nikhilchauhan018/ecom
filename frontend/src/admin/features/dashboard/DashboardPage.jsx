import Form from 'react-bootstrap/Form';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { dashboardMock as d } from '../../data/dashboard.mock';
import StatTiles from './components/StatTiles';
import SalesChart from './components/SalesChart';
import TodoList from './components/TodoList';
import RecentOrders from './components/RecentOrders';
import ActivityLogs from './components/ActivityLogs';
import NotificationsPanel from './components/NotificationsPanel';
import TopCategories from './components/TopCategories';
import FeatureModules from './components/FeatureModules';
import SecurityOverview from './components/SecurityOverview';

const split = 'tw-grid tw-grid-cols-1 tw-gap-4 lg:tw-grid-cols-[2fr_1fr]';

export default function DashboardPage() {
  return (
    <>
      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3">
        <div className="tw-min-w-[200px] tw-flex-1">
          <label className="visually-hidden-input" htmlFor="page-search">Search</label>
          <Form.Control id="page-search" type="search" placeholder="Search orders, products, customers" maxLength={100}
            className="tw-h-11 tw-rounded-[10px] tw-border-field tw-bg-card tw-text-sm tw-px-[14px] tw-text-ink" />
        </div>
        <Button>Add product</Button>
        <button type="button" aria-label="Notifications, 5 unread"
          className="tw-relative tw-grid tw-h-11 tw-w-11 tw-cursor-pointer tw-place-items-center tw-rounded-[10px] tw-border tw-border-solid tw-border-field tw-bg-card tw-text-ink">
          <Icon name="bell" />
          <b className="tw-absolute tw-right-[-7px] tw-top-[-7px] tw-grid tw-h-5 tw-min-w-5 tw-place-items-center tw-rounded-full tw-bg-[#b3261e] tw-text-[11px] tw-font-bold tw-text-white">5</b>
        </button>
        <div aria-label="Admin account" role="img" className="tw-grid tw-h-11 tw-w-11 tw-place-items-center tw-rounded-full tw-bg-[#dfe9e4] tw-font-semibold tw-text-[#1d4d3f]">AD</div>
      </div>

      <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
        <h1 className="tw-m-0 tw-text-xs tw-font-semibold tw-tracking-[.06em] tw-text-soft">DASHBOARD</h1>
        <Button variant="brandOutline">Manage widgets</Button>
      </div>

      <StatTiles tiles={d.tiles} />
      <section className={split}><SalesChart data={d.salesByDay} /><TodoList items={d.todo} /></section>
      <section className={split}><RecentOrders orders={d.recentOrders} /><ActivityLogs items={d.activity} /></section>
      <section className={split}><NotificationsPanel items={d.notifications} /><TopCategories items={d.topCategories} /></section>
      <FeatureModules modules={d.modules} />
      <SecurityOverview data={d.security} />
    </>
  );
}
