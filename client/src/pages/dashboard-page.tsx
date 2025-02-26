import { AppLayout } from "@/components/layout/app-layout";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ClassesOverview } from "@/components/dashboard/classes-overview";
import { SkillsProgressOverview } from "@/components/dashboard/skills-progress-overview";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  // Temporary: For development purposes, redirect to auth
  const [_, navigate] = useLocation();
  
  // Temporary until we resolve auth issues
  return <Redirect to="/auth" />;
  
  // Original dashboard layout
  /*
  return (
    <AppLayout>
      <QuickActions />
      <ClassesOverview />
      <SkillsProgressOverview />
      <UpcomingEvents />
    </AppLayout>
  );
  */
}
