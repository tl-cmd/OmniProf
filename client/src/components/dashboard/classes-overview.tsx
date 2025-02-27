import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Class } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ClassesOverview() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Chargement des classes depuis localStorage
    try {
      const storedClasses = localStorage.getItem('classes');
      if (storedClasses) {
        setClasses(JSON.parse(storedClasses));
      } else {
        // Création de données de démonstration si aucune classe n'est trouvée
        const now = new Date();
        const demoClasses: Class[] = [
          {
            id: 1,
            name: "3e A",
            level: "3e",
            subject: "Mathématiques",
            studentCount: 28,
            teacherId: 1,
            nextSessionDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0),
            progress: 65,
            createdAt: new Date()
          },
          {
            id: 2,
            name: "4e B",
            level: "4e",
            subject: "Mathématiques",
            studentCount: 26,
            teacherId: 1,
            nextSessionDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0),
            progress: 45,
            createdAt: new Date()
          },
          {
            id: 3,
            name: "6e C",
            level: "6e",
            subject: "Mathématiques",
            studentCount: 24,
            teacherId: 1,
            nextSessionDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0),
            progress: 92,
            createdAt: new Date()
          }
        ];
        
        // Sauvegarde dans le localStorage pour une utilisation future
        localStorage.setItem('classes', JSON.stringify(demoClasses));
        setClasses(demoClasses);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Mes classes</h3>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-20 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-60 mt-2 sm:mt-0" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const formatNextSession = (nextSessionDate: Date | null) => {
    if (!nextSessionDate) return "Aucun cours prévu";
    
    const formattedDate = format(new Date(nextSessionDate), "EEE. d MMM, HH'h'mm", { locale: fr });
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Mes classes</h3>
        <Link href="/classes" className="text-sm font-medium text-primary-500 hover:text-primary-600">
          Voir toutes les classes
        </Link>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {!classes || classes.length === 0 ? (
            <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
              Aucune classe disponible. Commencez par en créer une.
            </li>
          ) : (
            classes.map((cls) => (
              <li key={cls.id}>
                <Link href={`/classes/${cls.id}`}>
                  <div className="block hover:bg-gray-50 cursor-pointer">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">{cls.level}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {cls.level} - {cls.subject}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cls.studentCount} élèves
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {cls.progress && cls.progress > 90 
                                ? "Programme terminé" 
                                : cls.progress && cls.progress > 70 
                                  ? "Nouvelle évaluation à prévoir" 
                                  : "En cours de progression"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <CheckCircle className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>Progression: <span>{cls.progress || 0}%</span></span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <p>
                            Prochain cours: <time dateTime={cls.nextSessionDate?.toISOString()}>
                              {formatNextSession(cls.nextSessionDate)}
                            </time>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
