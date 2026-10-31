import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardPage from '../features/dashboard/DashboardPage';
const ComingSoonPage = lazy(() => import('../features/placeholder/ComingSoonPage'));
const OrdersPage = lazy(() => import('../features/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('../features/orders/OrderDetailPage'));
const OrderFormPage = lazy(() => import('../features/orders/OrderFormPage'));
const ProductsPage = lazy(() => import('../features/products/ProductsPage'));
const ProductFormPage = lazy(() => import('../features/products/ProductFormPage'));
const CategoriesPage = lazy(() => import('../features/categories/CategoriesPage'));
const CategoryFormPage = lazy(() => import('../features/categories/CategoryFormPage'));
const ProductInventoryPage = lazy(() => import('../features/product-inventory/ProductInventoryPage'));
const ShipmentsPage = lazy(() => import('../features/shipments/ShipmentsPage'));
const CustomersPage = lazy(() => import('../features/customers/CustomersPage'));
const InvoicesPage = lazy(() => import('../features/invoices/InvoicesPage'));
const InvoiceDetailPage = lazy(() => import('../features/invoices/InvoiceDetailPage'));
const ReturnsPage = lazy(() => import('../features/returns/ReturnsPage'));
const DiscountsPage = lazy(() => import('../features/discounts/DiscountsPage'));
const ReviewsPage = lazy(() => import('../features/reviews/ReviewsPage'));
const ShippingPage = lazy(() => import('../features/shipping/ShippingPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="tw-p-6 tw-text-muted">Loading…</div>}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/create" element={<OrderFormPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="orders/:id/edit" element={<OrderFormPage />} />
          <Route path="report" element={<ComingSoonPage />} />
          <Route path="incomplete-orders" element={<ComingSoonPage />} />
          <Route path="order-returns" element={<ReturnsPage />} />
          <Route path="shipments" element={<ShipmentsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/:id/edit" element={<InvoiceDetailPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/create" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="products/:id" element={<Navigate to="edit" replace />} />
          <Route path="product-prices" element={<ComingSoonPage />} />
          <Route path="product-inventory" element={<ProductInventoryPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/create" element={<CategoryFormPage />} />
          <Route path="categories/:id/edit" element={<CategoryFormPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="discounts" element={<DiscountsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="shipping" element={<ShippingPage />} />
          <Route path="notifications" element={<ComingSoonPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
