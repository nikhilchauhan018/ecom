import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import StoreLayout from '../layouts/StoreLayout';
import HomePage from '../features/home/HomePage';
import RequireAuth from '../features/auth/RequireAuth';

const StoreSubPage = lazy(() => import('../features/placeholder/StoreSubPage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const AccountPage = lazy(() => import('../features/account/AccountPage'));
const ProfilePage = lazy(() => import('../features/account/ProfilePage'));
const AddressesPage = lazy(() => import('../features/account/AddressesPage'));
const AddressFormPage = lazy(() => import('../features/account/AddressFormPage'));
const NotificationsPage = lazy(() => import('../features/account/NotificationsPage'));
const SecurityPage = lazy(() => import('../features/account/SecurityPage'));
const DeleteAccountPage = lazy(() => import('../features/account/DeleteAccountPage'));
const OrdersPage = lazy(() => import('../features/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('../features/orders/OrderDetailPage'));
const ReturnsPage = lazy(() => import('../features/returns/ReturnsPage'));
const ReturnRequestPage = lazy(() => import('../features/returns/ReturnRequestPage'));
const ContentPage = lazy(() => import('../features/content/ContentPage'));

export function StoreRoutes() {
  return (
    <Suspense fallback={<div className="tw-p-8 tw-text-center tw-text-muted">Loading...</div>}>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<StoreSubPage title="Shop Catalog" />} />
          <Route path="categories" element={<StoreSubPage title="All Categories" />} />
          <Route path="categories/:slug" element={<StoreSubPage />} />
          <Route path="seasons" element={<StoreSubPage title="Seasonal Collections" />} />
          <Route path="seasons/:slug" element={<StoreSubPage />} />
          <Route path="product/:slug" element={<StoreSubPage title="Product Detail" />} />
          <Route path="wishlist" element={<StoreSubPage title="My Wishlist" />} />
          <Route path="cart" element={<StoreSubPage title="Shopping Cart" />} />
          <Route path="search" element={<StoreSubPage title="Search Results" />} />

          {/* Public */}
          <Route path="login" element={<LoginPage />} />
          <Route path="about" element={<ContentPage pageId="about" />} />
          <Route path="contact" element={<ContentPage pageId="contact" />} />
          <Route path="policies/shipping" element={<ContentPage pageId="shipping" />} />
          <Route path="policies/returns" element={<ContentPage pageId="returns" />} />
          <Route path="policies/privacy" element={<ContentPage pageId="privacy" />} />
          <Route path="policies/terms" element={<ContentPage pageId="terms" />} />

          {/* Signed-in only: private components never mount for anonymous visitors */}
          <Route element={<RequireAuth />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="account/profile" element={<ProfilePage />} />
            <Route path="account/addresses" element={<AddressesPage />} />
            <Route path="account/addresses/new" element={<AddressFormPage />} />
            <Route path="account/addresses/:id" element={<AddressFormPage />} />
            <Route path="account/notifications" element={<NotificationsPage />} />
            <Route path="account/security" element={<SecurityPage />} />
            <Route path="account/delete" element={<DeleteAccountPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="orders/:id/track" element={<OrderDetailPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="returns/new" element={<ReturnRequestPage />} />
          </Route>

          <Route path="*" element={<StoreSubPage title="Page Not Found" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default StoreRoutes;
