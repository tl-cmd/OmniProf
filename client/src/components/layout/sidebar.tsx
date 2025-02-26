import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Boxes,
  Book,
  Calendar,
  ClipboardList,
  Settings,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { Teacher } from "../../App";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();
  
  // Récupérer les infos enseignant du localStorage
  useEffect(() => {
    const savedTeacher = localStorage.getItem('teacher');
    if (savedTeacher) {
      try {
        setTeacher(JSON.parse(savedTeacher));
      } catch (e) {
        console.error("Impossible de charger les données de l'enseignant", e);
      }
    }
  }, []);
  
  const handleClearData = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser l'application ? Toutes vos données seront perdues.")) {
      localStorage.clear();
      toast({
        title: "Application réinitialisée",
        description: "Toutes les données ont été effacées. L'application va redémarrer.",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
  };

  const closeSheetIfMobile = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const links = [
    { 
      href: "/", 
      label: "Tableau de bord", 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      href: "/competencies", 
      label: "Compétences", 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      href: "/classes", 
      label: "Classes", 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      href: "/sequences", 
      label: "Séquences", 
      icon: <Boxes className="h-5 w-5" /> 
    },
    { 
      href: "/resources", 
      label: "Ressources", 
      icon: <Book className="h-5 w-5" /> 
    },
    { 
      href: "/schedule", 
      label: "Emploi du temps", 
      icon: <Calendar className="h-5 w-5" /> 
    },
    { 
      href: "/pronote", 
      label: "Intégration Pronote", 
      icon: <ClipboardList className="h-5 w-5" /> 
    },
  ];

  const sidebarContent = (
    <div className={cn("flex flex-col w-64 h-full bg-white border-r border-gray-200", className)}>
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-500">OmniProf</h1>
      </div>
      <div className="h-0 flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md", 
                  location === link.href 
                    ? "bg-primary-50 text-primary-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={closeSheetIfMobile}
              >
                <div className={cn(
                  "mr-3", 
                  location === link.href 
                    ? "text-primary-500" 
                    : "text-gray-400 group-hover:text-gray-500"
                )}>
                  {link.icon}
                </div>
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        {teacher && (
          <div className="flex flex-col p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {teacher.fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{teacher.fullName}</p>
                <p className="text-xs font-medium text-gray-500 truncate">
                  {teacher.subject ? `Professeur de ${teacher.subject}` : 'Enseignant'}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs flex items-center justify-center"
                onClick={handleClearData}
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                Réinitialiser l'application
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // For mobile, we use a sheet that slides in
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 max-w-[280px]">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop, we just return the sidebar
  return sidebarContent;
}
