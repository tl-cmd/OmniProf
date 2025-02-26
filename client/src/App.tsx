import { Switch, Route, Redirect, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import ClassesPage from "@/pages/classes-page";
import NewClassPage from "@/pages/new-class-page";
import CompetenciesPage from "@/pages/competencies-page";
import NewFrameworkPage from "@/pages/new-framework-page";
import NewCompetencyPage from "@/pages/new-competency-page";
import SequencesPage from "@/pages/sequences-page";
import NewSequencePage from "@/pages/new-sequence-page";
import ResourcesPage from "@/pages/resources-page";
import NewResourcePage from "@/pages/new-resource-page";
import SchedulePage from "@/pages/schedule-page";
import PronotePage from "@/pages/pronote-page";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Contexte local de l'utilisateur
export type Teacher = {
  fullName: string;
  subject: string;
};

// Composant de route protégée qui nécessite une authentification locale
function ProtectedRoute({ 
  component: Component, 
  teacher,
  ...rest 
}: { 
  component: React.ComponentType<any>;
  teacher: Teacher | null;
  path: string;
}) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Court délai pour vérifier si l'enseignant est bien chargé
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }
  
  if (!teacher) {
    return <Redirect to="/" />;
  }
  
  return <Component teacherInfo={teacher} />;
}

function Router() {
  // État local de l'enseignant
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();
  const [location] = useLocation();

  // Au chargement, essayer de récupérer les infos du localStorage
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

  // Si c'est la première utilisation, demander les informations de base
  const handleSetupTeacher = (data: Teacher) => {
    setTeacher(data);
    localStorage.setItem('teacher', JSON.stringify(data));
    toast({
      title: "Bienvenue dans OmniProf",
      description: `Votre profil a été configuré. Bonne utilisation!`,
    });
  };

  // Page d'accueil
  const HomePage = () => {
    // Si l'utilisateur est déjà connecté et tente d'accéder à la page d'accueil,
    // rediriger vers le tableau de bord
    if (teacher && location === "/") {
      return <DashboardPage teacherInfo={teacher} />;
    }
    
    // Premier lancement, demander les infos
    if (!teacher) {
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h1 className="text-3xl font-bold text-center text-primary-600">OmniProf</h1>
            <h2 className="mt-2 text-center text-sm text-gray-600">
              Gestion pédagogique pour enseignants
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <h2 className="text-xl font-medium mb-6">Configuration initiale</h2>
              <form 
                className="space-y-6" 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value;
                  const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
                  
                  if (fullName.trim()) {
                    handleSetupTeacher({ fullName, subject });
                  }
                }}
              >
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  <div className="mt-1">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Jean Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Matière enseignée
                  </label>
                  <div className="mt-1">
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Mathématiques"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Commencer à utiliser OmniProf
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    // Si on arrive ici, l'utilisateur est connecté et se trouve sur la page d'accueil
    return <DashboardPage teacherInfo={teacher} />;
  };

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      
      {/* Routes pour les classes */}
      <Route 
        path="/classes" 
        component={() => 
          <ProtectedRoute path="/classes" component={ClassesPage} teacher={teacher} />
        } 
      />
      <Route 
        path="/classes/new" 
        component={() => 
          <ProtectedRoute path="/classes/new" component={NewClassPage} teacher={teacher} />
        } 
      />
      
      {/* Routes pour les compétences */}
      <Route 
        path="/competencies" 
        component={() => 
          <ProtectedRoute path="/competencies" component={CompetenciesPage} teacher={teacher} />
        } 
      />
      <Route 
        path="/competencies/new-framework" 
        component={() => 
          <ProtectedRoute path="/competencies/new-framework" component={NewFrameworkPage} teacher={teacher} />
        } 
      />
      <Route 
        path="/competencies/new" 
        component={() => 
          <ProtectedRoute path="/competencies/new" component={NewCompetencyPage} teacher={teacher} />
        } 
      />
      
      {/* Routes pour les séquences */}
      <Route 
        path="/sequences" 
        component={() => 
          <ProtectedRoute path="/sequences" component={SequencesPage} teacher={teacher} />
        } 
      />
      <Route 
        path="/sequences/new" 
        component={() => 
          <ProtectedRoute path="/sequences/new" component={NewSequencePage} teacher={teacher} />
        } 
      />
      
      {/* Routes pour les ressources */}
      <Route 
        path="/resources" 
        component={() => 
          <ProtectedRoute path="/resources" component={ResourcesPage} teacher={teacher} />
        } 
      />
      <Route 
        path="/resources/new" 
        component={() => 
          <ProtectedRoute path="/resources/new" component={NewResourcePage} teacher={teacher} />
        } 
      />
      
      {/* Autres routes */}
      <Route 
        path="/schedule" 
        component={() => 
          <ProtectedRoute path="/schedule" component={SchedulePage} teacher={teacher} />
        } 
      />
      <Route 
        path="/pronote" 
        component={() => 
          <ProtectedRoute path="/pronote" component={PronotePage} teacher={teacher} />
        } 
      />
      
      {/* Route par défaut */}
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
