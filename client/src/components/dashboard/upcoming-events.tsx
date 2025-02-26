import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Essayer de récupérer les événements depuis le localStorage
    const storedEvents = localStorage.getItem('events');
    
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents));
      } catch (error) {
        console.error("Erreur lors de la récupération des événements:", error);
      }
    } else {
      // Générer des données de démonstration si aucun événement n'est trouvé
      const now = new Date();
      const demoEvents = [
        {
          id: 1,
          title: "Cours - 3e A",
          description: "Théorème de Thalès - Exercices d'application",
          startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0),
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0),
          classId: 1,
          teacherId: 1,
          type: "class",
          createdAt: new Date()
        },
        {
          id: 2,
          title: "Évaluation - 4e B",
          description: "Contrôle sur les nombres relatifs et calcul littéral",
          startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0),
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 11, 0),
          classId: 2,
          teacherId: 1,
          type: "assessment",
          createdAt: new Date()
        },
        {
          id: 3,
          title: "Cours - 6e C",
          description: "Introduction aux fractions - Activité manipulatoire",
          startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 8, 0),
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 9, 0),
          classId: 3,
          teacherId: 1,
          type: "class",
          createdAt: new Date()
        },
        {
          id: 4,
          title: "Évaluation - 3e A",
          description: "Contrôle de géométrie - Thalès et Pythagore",
          startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 15, 0),
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 16, 0),
          classId: 1,
          teacherId: 1,
          type: "assessment",
          createdAt: new Date()
        }
      ];
      
      // Sauvegarde dans le localStorage pour une utilisation future
      localStorage.setItem('events', JSON.stringify(demoEvents));
      setEvents(demoEvents);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Agenda</h3>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <li key={i}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-60 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'assessment':
        return 'bg-red-100 text-red-600';
      case 'meeting':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-primary-100 text-primary-600';
    }
  };

  const formatEventDate = (date: Date) => {
    return {
      day: format(new Date(date), 'd', { locale: fr }),
      month: format(new Date(date), 'MMM', { locale: fr }),
      time: format(new Date(date), "HH'h'mm", { locale: fr })
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Agenda</h3>
        <Link href="/schedule" className="text-sm font-medium text-primary-500 hover:text-primary-600">
          Voir tout l'agenda
        </Link>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {!events || events.length === 0 ? (
            <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
              Aucun événement à venir. Ajoutez des événements à votre agenda.
            </li>
          ) : (
            events.map((event) => {
              const date = formatEventDate(event.startDate);
              const endTime = formatEventDate(event.endDate).time;
              const bgColorClass = getEventTypeColor(event.type);
              
              return (
                <li key={event.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-12 w-12 ${event.type === 'assessment' ? 'bg-red-100' : event.type === 'meeting' ? 'bg-yellow-100' : 'bg-primary-100'} rounded-md flex flex-col items-center justify-center`}>
                          <span className={`font-semibold text-lg ${event.type === 'assessment' ? 'text-red-600' : event.type === 'meeting' ? 'text-yellow-600' : 'text-primary-600'}`}>{date.day}</span>
                          <span className={`text-xs ${event.type === 'assessment' ? 'text-red-600' : event.type === 'meeting' ? 'text-yellow-600' : 'text-primary-600'}`}>{date.month}</span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 mr-2">{event.title}</div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.type === 'assessment' ? 'bg-red-100 text-red-800' : event.type === 'meeting' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                              {date.time} - {endTime}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/schedule/${event.id}`}>Détails</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
