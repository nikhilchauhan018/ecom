import React from 'react';
import { BrowserRouter, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import AppRoutes from './admin/routes/AppRoutes';
import StoreRoutes from './client/routes/StoreRoutes';
import ErrorBoundary from './admin/components/common/ErrorBoundary';

/**
 * Floating mode switcher allowing easy toggle between Storefront and Admin Ops in development.
 */
function ViewSwitcher() {
  const location = useLocation();
  const isAdmin =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/ecommerce');

  return (
    <aside
      aria-label="Application View Switcher"
      className="tw-fixed tw-bottom-20 tw-right-4 tw-z-50 print-hidden"
    >
      <Link
        to={isAdmin ? '/' : '/ecommerce'}
        className="tw-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-2 tw-rounded-full tw-bg-[#17181a] tw-text-white tw-shadow-xl tw-text-xs tw-font-semibold hover:tw-opacity-95 tw-transition-all tw-border tw-border-white/20"
      >
        <span
          className={`tw-w-2 tw-h-2 tw-rounded-full ${
            isAdmin ? 'tw-bg-[#3b82f6]' : 'tw-bg-[#10b981]'
          }`}
        />
        {isAdmin ? 'View Storefront' : 'View Admin Ops'}
      </Link>
    </aside>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Admin Back-Office Routes */}
          <Route path="/admin/*" element={<Navigate to="/ecommerce" replace />} />
          <Route path="/ecommerce/*" element={<AppRoutes />} />

          {/* Customer-Facing Storefront Routes */}
          <Route path="/*" element={<StoreRoutes />} />
        </Routes>
        <ViewSwitcher />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
