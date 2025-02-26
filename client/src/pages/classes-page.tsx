import { AppLayout } from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Class } from "@shared/schema";
import { Plus, CheckCircle, Calendar, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: classes, isLoading } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });
  
  // Filter classes by search query
  const filteredClasses = classes?.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cls.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatNextSession = (nextSessionDate: Date | null) => {
    if (!nextSessionDate) return "Aucun cours prévu";
    
    const formattedDate = format(new Date(nextSessionDate), "EEE. d MMM, HH'h'mm", { locale: fr });
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  return (
    <AppLayout title="Classes">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/classes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle classe
          </Link>
        </Button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {isLoading ? (
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-32" />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredClasses && filteredClasses.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredClasses.map((cls) => (
                  <div key={cls.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-lg">{cls.level}</span>
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-gray-900">{cls.name}</h2>
                          <p className="text-sm text-gray-500">{cls.subject}</p>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Button variant="outline" asChild>
                          <Link href={`/classes/${cls.id}`}>
                            Voir les détails
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span>{cls.studentCount} élèves</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span>Progression: {cls.progress}%</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span>Prochain cours: {formatNextSession(cls.nextSessionDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5 sm:px-6 text-center">
                <p className="text-gray-500">Aucune classe trouvée. {searchQuery ? "Essayez une autre recherche." : "Commencez par créer une classe."}</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
