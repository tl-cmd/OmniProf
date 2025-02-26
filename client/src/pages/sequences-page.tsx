import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Sequence, Class } from "@shared/schema";
import { Plus, Search, Calendar, Users, Check, Play, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Teacher } from "../App";

interface SequencesPageProps {
  teacherInfo: Teacher;
}

export default function SequencesPage({ teacherInfo }: SequencesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "completed">("active");
  const [classes, setClasses] = useState<Class[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingSequences, setIsLoadingSequences] = useState(true);
  const { toast } = useToast();
  
  // Charger les classes depuis le localStorage
  useEffect(() => {
    const fetchClasses = () => {
      setIsLoadingClasses(true);
      try {
        // Récupérer les classes du localStorage
        const storedClasses = localStorage.getItem('classes');
        if (storedClasses) {
          const parsedClasses = JSON.parse(storedClasses) as Class[];
          // Filtrer les classes qui appartiennent à cet utilisateur
          const teacherClasses = parsedClasses.filter(cls => 
            String(cls.teacherId) === teacherInfo.fullName
          );
          setClasses(teacherClasses);
        } else {
          // Aucune classe trouvée, initialiser un tableau vide
          setClasses([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des classes:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les classes.",
          variant: "destructive",
        });
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    
    fetchClasses();
  }, [teacherInfo.fullName, toast]);
  
  // Charger les séquences depuis le localStorage
  useEffect(() => {
    const fetchSequences = () => {
      setIsLoadingSequences(true);
      try {
        // Récupérer les séquences du localStorage
        const storedSequences = localStorage.getItem('sequences');
        
        if (storedSequences) {
          const parsedSequences = JSON.parse(storedSequences) as Sequence[];
          // Filtrer les séquences qui appartiennent à cet utilisateur
          let filteredSequences = parsedSequences.filter(seq => 
            String(seq.teacherId) === teacherInfo.fullName
          );
          
          // Filtrer par statut
          if (activeTab !== 'all') {
            filteredSequences = filteredSequences.filter(seq => seq.status === activeTab);
          }
          
          // Filtrer par classe si nécessaire
          if (selectedClass !== 'all') {
            filteredSequences = filteredSequences.filter(seq => 
              seq.classId === parseInt(selectedClass)
            );
          }
          
          setSequences(filteredSequences);
        } else {
          // Aucune séquence trouvée, initialiser un tableau vide
          setSequences([]);
          
          // Si nous avons des classes, créons quelques séquences d'exemple
          if (classes.length > 0 && !localStorage.getItem('sequences_created')) {
            const now = new Date();
            const defaultSequences: Sequence[] = [
              { 
                id: Date.now(),
                title: "Introduction à la matière", 
                description: `Introduction générale à ${teacherInfo.subject}`, 
                classId: classes[0].id, 
                teacherId: teacherInfo.fullName as unknown as number, 
                startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()), 
                endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14), 
                status: "active", 
                competencyIds: [],
                createdAt: new Date() 
              }
            ];
            
            localStorage.setItem('sequences', JSON.stringify(defaultSequences));
            localStorage.setItem('sequences_created', 'true');
            setSequences(defaultSequences);
            
            toast({
              title: "Séquence créée",
              description: "Une séquence d'exemple a été créée pour vous.",
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des séquences:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les séquences.",
          variant: "destructive",
        });
        setSequences([]);
      } finally {
        setIsLoadingSequences(false);
      }
    };
    
    fetchSequences();
  }, [classes, selectedClass, activeTab, teacherInfo.fullName, teacherInfo.subject, toast]);
  
  // Filter sequences by search query
  const filteredSequences = sequences.filter(sequence => 
    sequence.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (sequence.description && sequence.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const formatDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate && !endDate) return "Dates non définies";
    if (startDate && !endDate) {
      return `À partir du ${format(new Date(startDate), "d MMM yyyy", { locale: fr })}`;
    }
    if (!startDate && endDate) {
      return `Jusqu'au ${format(new Date(endDate), "d MMM yyyy", { locale: fr })}`;
    }
    return `${format(new Date(startDate!), "d MMM", { locale: fr })} - ${format(new Date(endDate!), "d MMM yyyy", { locale: fr })}`;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100">Brouillon</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Terminée</Badge>;
      default:
        return null;
    }
  };
  
  const getActionButtons = (sequence: Sequence) => {
    switch (sequence.status) {
      case 'draft':
        return (
          <>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <Link href={`/sequences/${sequence.id}/edit`}>
                Modifier
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/sequences/${sequence.id}/start`}>
                <Play className="mr-1 h-3 w-3" />
                Démarrer
              </Link>
            </Button>
          </>
        );
      case 'active':
        return (
          <>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <Link href={`/sequences/${sequence.id}`}>
                Voir
              </Link>
            </Button>
            <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href={`/sequences/${sequence.id}/complete`}>
                <Check className="mr-1 h-3 w-3" />
                Terminer
              </Link>
            </Button>
          </>
        );
      case 'completed':
        return (
          <>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <Link href={`/sequences/${sequence.id}`}>
                Voir
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/sequences/${sequence.id}/archive`}>
                <Archive className="mr-1 h-3 w-3" />
                Archiver
              </Link>
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout title="Séquences">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Toutes les classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes?.map(cls => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.level} - {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/sequences/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle séquence
          </Link>
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "draft" | "completed")} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active">En cours</TabsTrigger>
          <TabsTrigger value="draft">Brouillons</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoadingSequences ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    <Skeleton className="h-6 w-48 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredSequences && filteredSequences.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredSequences.map(sequence => {
                    // Find the class
                    const sequenceClass = classes?.find(c => c.id === sequence.classId);
                    
                    return (
                      <Card key={sequence.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div className="text-sm text-muted-foreground">
                              {sequenceClass ? `${sequenceClass.level} - ${sequenceClass.name}` : 'Classe inconnue'}
                            </div>
                            {getStatusBadge(sequence.status)}
                          </div>
                          <CardTitle className="text-xl mt-1">{sequence.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{sequence.description}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{formatDateRange(sequence.startDate, sequence.endDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{sequenceClass?.studentCount || 0} élèves</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          {getActionButtons(sequence)}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                  <p className="text-gray-500">
                    Aucune séquence {
                      activeTab === 'active' ? 'en cours' :
                      activeTab === 'draft' ? 'en brouillon' : 'terminée'
                    } trouvée. 
                    {searchQuery ? " Essayez une autre recherche." : " Vous pouvez en créer une nouvelle."}
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
