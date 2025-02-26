import { AppLayout } from "@/components/layout/app-layout";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ClassesOverview } from "@/components/dashboard/classes-overview";
import { SkillsProgressOverview } from "@/components/dashboard/skills-progress-overview";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Teacher } from "../App";

interface DashboardPageProps {
  teacherInfo: Teacher;
}

export default function DashboardPage({ teacherInfo }: DashboardPageProps) {
  return (
    <AppLayout title={`Tableau de bord - ${teacherInfo.fullName}`}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bienvenue, {teacherInfo.fullName}</h1>
        <p className="text-gray-600">{teacherInfo.subject}</p>
      </div>
      
      <QuickActions />
      <ClassesOverview />
      <SkillsProgressOverview />
      <UpcomingEvents />
    </AppLayout>
  );
}
