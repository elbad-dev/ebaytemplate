import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/auth-page";
import { Logo } from "@/components/Logo";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <>
      <AppHeader />
      <main>
        <Switch>
          <ProtectedRoute path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="bg-gray-50 border-t py-8 mt-12">
        <div className="container mx-auto px-8 max-w-[1400px] text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TemplateEditor. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

// Navigation header for the app
function AppHeader() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-8 py-6 max-w-[1400px] flex justify-between items-center">
        {/* Logo/Brand section */}
        <div 
          onClick={handleHomeClick}
          className="flex items-center space-x-3 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Logo size="default" />
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TemplateEditor
          </span>
        </div>
        
        <nav className="flex items-center space-x-8">
          {/* Home link */}
          <div 
            onClick={handleHomeClick}
            className="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Home
          </div>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-base font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            Documentation
          </a>
          
          {user ? (
            <div className="flex items-center gap-6">
              <span className="text-base font-medium text-gray-700">
                {user.username}
              </span>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-6"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm px-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                <circle cx="16.5" cy="7.5" r=".5" />
              </svg>
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
