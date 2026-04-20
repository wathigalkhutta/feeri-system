// Feeri System - Main App
// Design: Corporate - Light/Dark mode, Arabic/English, Role-based access

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { InvoiceTemplateProvider } from "./contexts/InvoiceTemplateContext";
import { DataProvider } from "./contexts/DataContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import HR from "./pages/HR";
import Accounting from "./pages/Accounting";
import Contracts from "./pages/Contracts";
import Partnerships from "./pages/Partnerships";
import CarRental from "./pages/CarRental";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Companies from "./pages/Companies";
import BusinessDevelopment from "./pages/BusinessDevelopment";
import Messages from "./pages/Messages";
import Users from "./pages/Users";

// ─── Protected Route wrapper ───────────────────────────────────────────────
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--feeri-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--feeri-text-muted)' }}>جارى التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/companies" component={() => <ProtectedRoute component={Companies} />} />
      <Route path="/crm" component={() => <ProtectedRoute component={CRM} />} />
      <Route path="/hr" component={() => <ProtectedRoute component={HR} />} />
      <Route path="/accounting" component={() => <ProtectedRoute component={Accounting} />} />
      <Route path="/contracts" component={() => <ProtectedRoute component={Contracts} />} />
      <Route path="/partnerships" component={() => <ProtectedRoute component={Partnerships} />} />
      <Route path="/car-rental" component={() => <ProtectedRoute component={CarRental} />} />
      <Route path="/tasks" component={() => <ProtectedRoute component={Tasks} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route path="/business-dev" component={() => <ProtectedRoute component={BusinessDevelopment} />} />
      <Route path="/messages" component={() => <ProtectedRoute component={Messages} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/users" component={() => <ProtectedRoute component={Users} />} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <AppProvider>
            <InvoiceTemplateProvider>
              <DataProvider>
                <TooltipProvider>
                  <Toaster richColors position="top-center" />
                  <Router />
                </TooltipProvider>
              </DataProvider>
            </InvoiceTemplateProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
