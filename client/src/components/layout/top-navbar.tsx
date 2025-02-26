import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

interface TopNavbarProps {
  className?: string;
  title?: string;
}

export function TopNavbar({ className, title }: TopNavbarProps) {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    if (title) return title;
    
    switch (location) {
      case "/":
        return "Tableau de bord";
      case "/competencies":
        return "Compétences";
      case "/classes":
        return "Classes";
      case "/sequences":
        return "Séquences";
      case "/resources":
        return "Ressources";
      case "/schedule":
        return "Emploi du temps";
      case "/pronote":
        return "Intégration Pronote";
      default:
        return "OmniProf";
    }
  };

  return (
    <div className={cn("relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200", className)}>
      <Sidebar isMobile={true} />
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
            <Bell className="h-6 w-6" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="ml-3 text-gray-400 hover:text-gray-500">
            <Settings className="h-6 w-6" />
            <span className="sr-only">Paramètres</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
