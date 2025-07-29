import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientProvider } from '@tanstack/react-query';
import { Router, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import Index from './pages/Index';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import KitchenDisplay from './pages/KitchenDisplay';
import NotFound from './pages/NotFound';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" />
      <Router>
        <Route path="/" component={Index} />
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/owner" component={OwnerDashboard} />
        <Route path="/kitchen" component={KitchenDisplay} />
        <Route component={NotFound} />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;