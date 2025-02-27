import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, BookOpen, Calendar, Award, Book, FolderOpen, Clock, 
  TrendingUp, CheckCircle, AlertCircle, AlertTriangle
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Teacher } from "@/App";

type Class = {
  id: number;
  name: string;
  level: string;
  studentCount: number;
  progress: number;
  nextSessionDate?: string;
};

type Sequence = {
  id: number;
  title: string;
  status: string;
  startDate?: string;
  endDate?: string;
};

type Event = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  type: string;
};

interface DashboardPageProps {
  teacherInfo: Teacher;
}

export default function DashboardPage({ teacherInfo }: DashboardPageProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Nous simulons les données pour la démo
        // Dans une vraie application, vous feriez des appels API
        
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Classes fictives
        setClasses([
          { id: 1, name: "Terminale CIEL", level: "Terminale", studentCount: 24, progress: 65, nextSessionDate: "2023-10-20T10:00:00" },
          { id: 2, name: "Première CIEL", level: "Première", studentCount: 28, progress: 42, nextSessionDate: "2023-10-19T14:00:00" },
          { id: 3, name: "Seconde Pro", level: "Seconde", studentCount: 30, progress: 25 }
        ]);
        
        // Séquences fictives
        setSequences([
          { id: 1, title: "Les bases de l'électricité", status: "active", startDate: "2023-10-01", endDate: "2023-11-15" },
          { id: 2, title: "Schémas électriques", status: "draft" },
          { id: 3, title: "Moteurs électriques", status: "completed", startDate: "2023-09-01", endDate: "2023-09-30" }
        ]);
        
        // Événements fictifs
        setEvents([
          { id: 1, title: "TP Circuits électriques", startDate: "2023-10-20T10:00:00", endDate: "2023-10-20T12:00:00", type: "class" },
          { id: 2, title: "Évaluation schémas", startDate: "2023-10-22T14:00:00", endDate: "2023-10-22T16:00:00", type: "assessment" },
          { id: 3, title: "Conseil de classe", startDate: "2023-10-25T16:30:00", endDate: "2023-10-25T18:30:00", type: "meeting" }
        ]);
        
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données du tableau de bord",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Fonction pour formater les dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Fonction pour obtenir le nombre de jours restants
  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Déterminer les classes qui ont une session prochaine
  const upcomingClasses = classes
    .filter(cls => cls.nextSessionDate)
    .sort((a, b) => {
      if (!a.nextSessionDate || !b.nextSessionDate) return 0;
      return new Date(a.nextSessionDate).getTime() - new Date(b.nextSessionDate).getTime();
    })
    .slice(0, 3);
  
  // Obtenir les prochains événements
  const upcomingEvents = events
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);
  
  // Calculer les statistiques
  const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);
  const activeSequences = sequences.filter(seq => seq.status === "active").length;
  const completedSequences = sequences.filter(seq => seq.status === "completed").length;
  
  // Obtenir l'icône en fonction du type d'événement
  const getEventIcon = (type: string) => {
    switch (type) {
      case "class":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "assessment":
        return <Award className="h-5 w-5 text-amber-500" />;
      case "meeting":
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <AppLayout title="Tableau de bord">
      {/* Bienvenue et statistiques */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Bienvenue, {teacherInfo?.fullName || "Enseignant"} 👋</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Élèves</p>
                <h3 className="text-2xl font-bold">{totalStudents}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="rounded-full bg-amber-100 p-3 mr-4">
                <Book className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Classes</p>
                <h3 className="text-2xl font-bold">{classes.length}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Séquences actives</p>
                <h3 className="text-2xl font-bold">{activeSequences}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Séquences terminées</p>
                <h3 className="text-2xl font-bold">{completedSequences}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes avec prochaines sessions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Prochaines sessions</CardTitle>
            <CardDescription>Vos prochains cours avec leur progression</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
              </div>
            ) : upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map(cls => (
                  <div key={cls.id} className="border rounded-lg p-4 transition-colors hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{cls.name}</h3>
                        <p className="text-sm text-gray-600">
                          {cls.level} • {cls.studentCount} élèves
                        </p>
                        <p className="text-sm mt-1">
                          <Clock className="h-4 w-4 inline-block mr-1 text-gray-500" />
                          {formatDate(cls.nextSessionDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getDaysRemaining(cls.nextSessionDate) === 0 ? (
                            "Aujourd'hui"
                          ) : getDaysRemaining(cls.nextSessionDate) === 1 ? (
                            "Demain"
                          ) : (
                            `Dans ${getDaysRemaining(cls.nextSessionDate)} jours`
                          )}
                        </span>
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="text-right min-w-[40px] mr-2">
                              <span className="text-sm font-medium">{cls.progress}%</span>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-primary-500 h-2.5 rounded-full" 
                                style={{ width: `${cls.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/classes">Voir toutes les classes</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">Aucune session prochaine</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ajoutez des sessions à votre planning pour les voir apparaître ici.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/planning">Ajouter une session</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Prochains événements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Agenda</CardTitle>
            <CardDescription>Vos prochains événements</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start border-l-4 border-primary-400 pl-3 py-1">
                    <div className="mr-3 mt-0.5">
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.startDate).toLocaleDateString('fr-FR', { 
                          day: '2-digit', 
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/planning">Voir l'agenda complet</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-base font-medium text-gray-900">Agenda vide</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vous n'avez pas d'événements prévus.
                </p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/planning">Planifier un événement</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* État des séquences */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Séquences pédagogiques</CardTitle>
            <CardDescription>État d'avancement de vos séquences</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
              </div>
            ) : sequences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sequences.map(sequence => (
                  <div key={sequence.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{sequence.title}</h3>
                      {sequence.status === "active" && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          En cours
                        </span>
                      )}
                      {sequence.status === "draft" && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Brouillon
                        </span>
                      )}
                      {sequence.status === "completed" && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Terminée
                        </span>
                      )}
                    </div>
                    
                    {sequence.startDate && sequence.endDate && (
                      <p className="text-sm text-gray-600 mt-2">
                        Du {new Date(sequence.startDate).toLocaleDateString('fr-FR')} au {new Date(sequence.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    
                    <div className="mt-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/sequences/${sequence.id}`}>Voir détails</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Book className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">Aucune séquence</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Créez des séquences pédagogiques pour organiser vos cours et ressources.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/sequences/new">Créer une séquence</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Rappels et alertes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Rappels</CardTitle>
            <CardDescription>Actions à réaliser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start border-l-4 border-amber-400 pl-3 py-2 bg-amber-50 rounded-r-md">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Évaluations à programmer</h4>
                  <p className="text-sm text-gray-600">
                    2 classes n'ont pas d'évaluations programmées ce mois-ci.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start border-l-4 border-green-400 pl-3 py-2 bg-green-50 rounded-r-md">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Compétences complètes</h4>
                  <p className="text-sm text-gray-600">
                    Toutes les compétences sont assignées à vos classes.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start border-l-4 border-blue-400 pl-3 py-2 bg-blue-50 rounded-r-md">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Sauvegarder vos données</h4>
                  <p className="text-sm text-gray-600">
                    Pensez à exporter régulièrement vos données.
                  </p>
                  <Button variant="link" size="sm" className="px-0 h-auto text-blue-600" onClick={() => {
                    toast({
                      title: "Sauvegarde lancée",
                      description: "Vos données sont en cours d'export",
                    });
                  }}>
                    Exporter maintenant
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}