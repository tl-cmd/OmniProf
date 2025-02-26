import { AppLayout } from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Resource, Sequence } from "@shared/schema";
import { Plus, Search, FileText, Link as LinkIcon, File, FileImage, Play, Video, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSequence, setSelectedSequence] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "documents" | "links" | "exercises">("all");
  
  // Fetch sequences
  const { data: sequences, isLoading: isLoadingSequences } = useQuery<Sequence[]>({
    queryKey: ['/api/sequences'],
  });
  
  // Fetch resources
  const { data: resources, isLoading: isLoadingResources } = useQuery<Resource[]>({
    queryKey: ['/api/resources', { 
      sequenceId: selectedSequence !== "all" ? parseInt(selectedSequence) : undefined,
      type: selectedType !== "all" ? selectedType : undefined
    }],
    queryFn: async () => {
      // In a real app, we would fetch from the API
      // For now, we'll return mock data
      const now = new Date();
      return [
        { 
          id: 1, 
          name: "Cours sur le théorème de Pythagore", 
          type: "document", 
          url: null, 
          content: "Contenu du cours sur le théorème de Pythagore...", 
          teacherId: 1, 
          sequenceId: 1, 
          createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10)
        },
        { 
          id: 2, 
          name: "Exercices d'application - Pythagore", 
          type: "exercise", 
          url: null, 
          content: "Série d'exercices sur l'application du théorème de Pythagore...", 
          teacherId: 1, 
          sequenceId: 1, 
          createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8)
        },
        { 
          id: 3, 
          name: "Vidéo explicative - Théorème de Pythagore", 
          type: "link", 
          url: "https://www.youtube.com/watch?v=example", 
          content: null, 
          teacherId: 1, 
          sequenceId: 1, 
          createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5)
        },
        { 
          id: 4, 
          name: "Cours sur les nombres relatifs", 
          type: "document", 
          url: null, 
          content: "Contenu du cours sur les nombres relatifs...", 
          teacherId: 1, 
          sequenceId: 2, 
          createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4)
        },
        { 
          id: 5, 
          name: "Exercices - Opérations sur les relatifs", 
          type: "exercise", 
          url: null, 
          content: "Série d'exercices sur les opérations avec des nombres relatifs...", 
          teacherId: 1, 
          sequenceId: 2, 
          createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)
        }
      ].filter(res => {
        // Filter by resource type if selected
        if (activeTab !== 'all') {
          if (activeTab === 'documents' && res.type !== 'document') return false;
          if (activeTab === 'links' && res.type !== 'link') return false;
          if (activeTab === 'exercises' && res.type !== 'exercise') return false;
        }
        
        // Filter by sequence if selected
        if (selectedSequence !== 'all' && res.sequenceId !== parseInt(selectedSequence)) return false;
        
        return true;
      });
    }
  });
  
  // Filter resources by search query
  const filteredResources = resources?.filter(resource => 
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
