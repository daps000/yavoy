import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import RidesPage from "@/pages/rides";
import PublishPage from "@/pages/publish";
import FAQPage from "@/pages/faq";
import MyRidesPage from "@/pages/my-rides";
import ProfilePage from "@/pages/profile";
import LoginPage from "@/pages/login";
import { Layout } from "@/components/layout";
import { AuthProvider } from "@/lib/auth-context";
import { PendingReviewPrompt } from "@/components/PendingReviewPrompt";

function HashErrorRedirect() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("error")) {
      setLocation("/entrar" + hash);
    }
  }, [setLocation]);
  
  return null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/viajes" component={RidesPage} />
        <Route path="/publicar" component={PublishPage} />
        <Route path="/mis-viajes" component={MyRidesPage} />
        <Route path="/mi-perfil" component={ProfilePage} />
        <Route path="/entrar" component={LoginPage} />
        <Route path="/faq" component={FAQPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <PendingReviewPrompt />
          <HashErrorRedirect />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
