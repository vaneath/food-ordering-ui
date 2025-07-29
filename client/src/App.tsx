import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientProvider } from '@tanstack/react-query';
import { Router, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" />
      <Router>
        <Route path="/" component={Index} />
        <Route component={NotFound} />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;