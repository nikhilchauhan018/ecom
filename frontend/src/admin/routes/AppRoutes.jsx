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
          <Route path="ecommerce/orders" element={<OrdersPage />} />
          <Route path="ecommerce/orders/create" element={<OrderFormPage />} />
          <Route path="ecommerce/orders/:id" element={<OrderDetailPage />} />
          <Route path="ecommerce/orders/:id/edit" element={<OrderFormPage />} />
          <Route path="ecommerce/report" element={<ComingSoonPage />} />
          <Route path="ecommerce/incomplete-orders" element={<ComingSoonPage />} />
          <Route path="ecommerce/order-returns" element={<ReturnsPage />} />
          <Route path="ecommerce/shipments" element={<ShipmentsPage />} />
          <Route path="ecommerce/invoices" element={<InvoicesPage />} />
          <Route path="ecommerce/invoices/:id/edit" element={<InvoiceDetailPage />} />
          <Route path="ecommerce/products" element={<ProductsPage />} />
          <Route path="ecommerce/products/create" element={<ProductFormPage />} />
          <Route path="ecommerce/products/:id/edit" element={<ProductFormPage />} />
          <Route path="ecommerce/products/:id" element={<Navigate to="edit" replace />} />
          <Route path="ecommerce/product-prices" element={<ComingSoonPage />} />
          <Route path="ecommerce/product-inventory" element={<ProductInventoryPage />} />
          <Route path="ecommerce/categories" element={<CategoriesPage />} />
          <Route path="ecommerce/categories/create" element={<CategoryFormPage />} />
          <Route path="ecommerce/categories/:id/edit" element={<CategoryFormPage />} />
          <Route path="ecommerce/customers" element={<CustomersPage />} />
          <Route path="ecommerce/discounts" element={<DiscountsPage />} />
          <Route path="ecommerce/reviews" element={<ReviewsPage />} />
          <Route path="ecommerce/shipping" element={<ShippingPage />} />
          <Route path="ecommerce/notifications" element={<ComingSoonPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
