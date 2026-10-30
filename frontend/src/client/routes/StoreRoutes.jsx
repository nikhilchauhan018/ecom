import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import StoreLayout from '../layouts/StoreLayout';
import HomePage from '../features/home/HomePage';

const StoreSubPage = lazy(() => import('../features/placeholder/StoreSubPage'));

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
          <Route path="account" element={<StoreSubPage title="Customer Account" />} />
          <Route path="search" element={<StoreSubPage title="Search Results" />} />
          <Route path="*" element={<StoreSubPage title="Page Not Found" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default StoreRoutes;
