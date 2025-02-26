import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Resource, Sequence } from "@shared/schema";
import { Plus, Search, FileText, Link as LinkIcon, File, FileImage, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Teacher } from "../App";

interface ResourcesPageProps {
  teacherInfo: Teacher;
}

export default function ResourcesPage({ teacherInfo }: ResourcesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSequence, setSelectedSequence] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "documents" | "links" | "exercises">("all");
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingSequences, setIsLoadingSequences] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const { toast } = useToast();
  
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
          const teacherSequences = parsedSequences.filter(seq => 
            String(seq.teacherId) === teacherInfo.fullName
          );
          setSequences(teacherSequences);
        } else {
          // Aucune séquence trouvée, initialiser un tableau vide
          setSequences([]);
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
  }, [teacherInfo.fullName, toast]);
  
  // Charger les ressources depuis le localStorage
  useEffect(() => {
    const fetchResources = () => {
      setIsLoadingResources(true);
      try {
        // Récupérer les ressources du localStorage
        const storedResources = localStorage.getItem('resources');
        
        if (storedResources) {
          const parsedResources = JSON.parse(storedResources) as Resource[];
          // Filtrer les ressources qui appartiennent à cet utilisateur
          let filteredResources = parsedResources.filter(res => 
            String(res.teacherId) === teacherInfo.fullName
          );
          
          // Filtrer par type de ressource si sélectionné
          if (activeTab !== 'all') {
            if (activeTab === 'documents') {
              filteredResources = filteredResources.filter(res => res.type === 'document');
            } else if (activeTab === 'links') {
              filteredResources = filteredResources.filter(res => res.type === 'link');
            } else if (activeTab === 'exercises') {
              filteredResources = filteredResources.filter(res => res.type === 'exercise');
            }
          }
          
          // Filtrer par séquence si nécessaire
          if (selectedSequence !== 'all') {
            filteredResources = filteredResources.filter(res => 
              res.sequenceId === parseInt(selectedSequence)
            );
          }
          
          setResources(filteredResources);
        } else {
          // Aucune ressource trouvée, initialiser un tableau vide
          setResources([]);
          
          // Si nous avons des séquences, créons quelques ressources d'exemple
          if (sequences.length > 0 && !localStorage.getItem('resources_created')) {
            const now = new Date();
            
            const defaultResources: Resource[] = [
              { 
                id: Date.now(),
                name: `Introduction à ${teacherInfo.subject}`, 
                type: "document", 
                url: null, 
                content: `Contenu du cours d'introduction à ${teacherInfo.subject}...`, 
                teacherId: teacherInfo.fullName as unknown as number, 
                sequenceId: sequences[0].id, 
                createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate())
              },
              { 
                id: Date.now() + 1,
                name: `Exercices de base - ${teacherInfo.subject}`, 
                type: "exercise", 
                url: null, 
                content: `Série d'exercices de base sur ${teacherInfo.subject}...`, 
                teacherId: teacherInfo.fullName as unknown as number, 
                sequenceId: sequences[0].id, 
                createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate())
              }
            ];
            
            localStorage.setItem('resources', JSON.stringify(defaultResources));
            localStorage.setItem('resources_created', 'true');
            setResources(defaultResources);
            
            toast({
              title: "Ressources créées",
              description: "Des ressources d'exemple ont été créées pour vous.",
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des ressources:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ressources.",
          variant: "destructive",
        });
        setResources([]);
      } finally {
        setIsLoadingResources(false);
      }
    };
    
    fetchResources();
  }, [sequences, selectedSequence, activeTab, teacherInfo.fullName, teacherInfo.subject, toast]);
  
  // Filter resources by search query
  const filteredResources = resources.filter(resource => 
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (resource.content && resource.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "d MMMM yyyy", { locale: fr });
  };
  
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'exercise':
        return <File className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <FileImage className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };
  
  const getResourceTypeBadge = (type: string) => {
    switch (type) {
      case 'document':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Document</Badge>;
      case 'exercise':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Exercice</Badge>;
      case 'link':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Lien</Badge>;
      case 'video':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Vidéo</Badge>;
      case 'image':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Image</Badge>;
      default:
        return <Badge variant="outline">Autre</Badge>;
    }
  };

  return (
    <AppLayout title="Ressources">
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
          <Select value={selectedSequence} onValueChange={setSelectedSequence}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Toutes les séquences" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les séquences</SelectItem>
              {sequences?.map(sequence => (
                <SelectItem key={sequence.id} value={sequence.id.toString()}>
                  {sequence.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/resources/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle ressource
          </Link>
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "documents" | "links" | "exercises")} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">Tout</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="exercises">Exercices</TabsTrigger>
          <TabsTrigger value="links">Liens</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoadingResources ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-48 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredResources && filteredResources.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResources.map(resource => {
                    // Find associated sequence
                    const sequence = sequences?.find(s => s.id === resource.sequenceId);
                    
                    return (
                      <Card key={resource.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            {getResourceTypeBadge(resource.type)}
                            {sequence && (
                              <span className="text-xs text-muted-foreground">
                                {sequence.title}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-lg mt-1">{resource.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {resource.content || (resource.url && `Lien: ${resource.url}`) || "Pas de contenu"}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Ajouté le {formatDate(resource.createdAt)}
                          </span>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/resources/${resource.id}`}>
                              Ouvrir
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                  <p className="text-gray-500">
                    Aucune ressource trouvée. 
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
