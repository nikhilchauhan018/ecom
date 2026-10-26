import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardPage from '../features/dashboard/DashboardPage';
import ComingSoonPage from '../features/placeholder/ComingSoonPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  );
}
