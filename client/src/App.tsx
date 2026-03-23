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
import RecoverPasswordPage from "@/pages/recover-password";
import NewPasswordPage from "@/pages/new-password";
import LegalNoticePage from "@/pages/legal-notice";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import { Layout } from "@/components/layout";
import { AuthProvider } from "@/lib/auth-context";
import { PendingReviewPrompt } from "@/components/PendingReviewPrompt";

function HashAuthRedirect() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || (location !== "/" && location !== "")) return;
    
    const hashParams = new URLSearchParams(hash.substring(1));
    const type = hashParams.get("type");
    const hasError = hash.includes("error");
    
    if (type === "recovery") {
      setLocation("/nueva-contrasena" + hash);
    } else if (hasError) {
      setLocation("/entrar" + hash);
    }
  }, [setLocation, location]);
  
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
        <Route path="/recuperar" component={RecoverPasswordPage} />
        <Route path="/nueva-contrasena" component={NewPasswordPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/aviso-legal" component={LegalNoticePage} />
        <Route path="/privacidad" component={PrivacyPolicyPage} />
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
          <HashAuthRedirect />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
