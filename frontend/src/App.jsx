import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './admin/routes/AppRoutes';
import ErrorBoundary from './admin/components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
