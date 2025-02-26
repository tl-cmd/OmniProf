import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ClassesPage from "@/pages/classes-page";
import CompetenciesPage from "@/pages/competencies-page";
import SequencesPage from "@/pages/sequences-page";
import ResourcesPage from "@/pages/resources-page";
import SchedulePage from "@/pages/schedule-page";
import PronotePage from "@/pages/pronote-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/classes" component={ClassesPage} />
      <Route path="/competencies" component={CompetenciesPage} />
      <Route path="/sequences" component={SequencesPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/pronote" component={PronotePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
