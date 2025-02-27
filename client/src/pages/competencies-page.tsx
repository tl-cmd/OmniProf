import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { CompetencyFramework, Competency } from "@shared/schema";
import { Plus, Search, FileText, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Teacher } from "../App";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CompetenciesPageProps {
  teacherInfo: Teacher;
}

export default function CompetenciesPage({ teacherInfo }: CompetenciesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("frameworks");
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [frameworks, setFrameworks] = useState<CompetencyFramework[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [isLoadingFrameworks, setIsLoadingFrameworks] = useState(true);
  const [isLoadingCompetencies, setIsLoadingCompetencies] = useState(true);
  const { toast } = useToast();
  
  // Charger les référentiels depuis le localStorage
  useEffect(() => {
    const fetchFrameworks = () => {
      setIsLoadingFrameworks(true);
      try {
        // Récupérer les référentiels du localStorage
        const storedFrameworks = localStorage.getItem('competencyFrameworks');
        if (storedFrameworks) {
          const parsedFrameworks = JSON.parse(storedFrameworks) as CompetencyFramework[];
          // Filtrer les référentiels qui appartiennent à cet utilisateur
          const teacherFrameworks = parsedFrameworks.filter(framework => 
            String(framework.teacherId) === teacherInfo.fullName
          );
          setFrameworks(teacherFrameworks);
        } else {
          // Aucun référentiel trouvé, initialiser un tableau vide
          setFrameworks([]);
          
          // Pour la première utilisation, créer un référentiel par défaut
          if (teacherInfo.subject) {
            const defaultFramework: CompetencyFramework = {
              id: Date.now(),
              name: `${teacherInfo.subject} - Compétences de base`,
              description: `Référentiel de compétences pour ${teacherInfo.subject}`,
              teacherId: teacherInfo.fullName as unknown as number,
              createdAt: new Date(),
            };
            
            localStorage.setItem('competencyFrameworks', JSON.stringify([defaultFramework]));
            setFrameworks([defaultFramework]);
            
            toast({
              title: "Référentiel créé",
              description: "Un référentiel de compétences par défaut a été créé pour vous.",
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des référentiels:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les référentiels.",
          variant: "destructive",
        });
        setFrameworks([]);
      } finally {
        setIsLoadingFrameworks(false);
      }
    };
    
    fetchFrameworks();
  }, [teacherInfo.fullName, teacherInfo.subject, toast]);
  
  // Charger les compétences depuis le localStorage
  useEffect(() => {
    const fetchCompetencies = () => {
      setIsLoadingCompetencies(true);
      try {
        // Récupérer les compétences du localStorage
        const storedCompetencies = localStorage.getItem('competencies');
        if (storedCompetencies) {
          const parsedCompetencies = JSON.parse(storedCompetencies) as Competency[];
          let filteredCompetencies = parsedCompetencies;
          
          // Filtrer par référentiel si nécessaire
          if (selectedFramework !== "all") {
            filteredCompetencies = parsedCompetencies.filter(
              comp => comp.frameworkId === parseInt(selectedFramework)
            );
          }
          
          setCompetencies(filteredCompetencies);
        } else {
          // Aucune compétence trouvée, initialiser un tableau vide
          setCompetencies([]);
          
          // Si nous avons un référentiel par défaut, ajoutons quelques compétences d'exemple
          if (frameworks.length > 0 && teacherInfo.subject === "Mathématiques") {
            const defaultCompetencies: Competency[] = [
              { id: Date.now(), name: "Résoudre des problèmes", description: "Résoudre des problèmes impliquant des grandeurs variées", frameworkId: frameworks[0].id, createdAt: new Date() },
              { id: Date.now() + 1, name: "Utiliser les nombres relatifs", description: "Additionner, soustraire, multiplier et diviser des nombres relatifs", frameworkId: frameworks[0].id, createdAt: new Date() },
              { id: Date.now() + 2, name: "Calculer avec des fractions", description: "Effectuer des calculs avec des nombres en écriture fractionnaire", frameworkId: frameworks[0].id, createdAt: new Date() },
            ];
            
            localStorage.setItem('competencies', JSON.stringify(defaultCompetencies));
            setCompetencies(defaultCompetencies);
            
            toast({
              title: "Compétences créées",
              description: "Des compétences d'exemple ont été créées pour vous.",
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des compétences:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les compétences.",
          variant: "destructive",
        });
        setCompetencies([]);
      } finally {
        setIsLoadingCompetencies(false);
      }
    };
    
    fetchCompetencies();
  }, [frameworks, selectedFramework, teacherInfo.subject, toast]);
  
  // Filter items by search query
  const filteredFrameworks = frameworks.filter(framework => 
    framework.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (framework.description && framework.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredCompetencies = competencies.filter(competency => 
    competency.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (competency.description && competency.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Progress data (mock, mais dans un vrai cas il viendrait du localStorage aussi)
  const competencyProgress: Record<number, number> = {};

  const getProgressColorClass = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <AppLayout title="Compétences">
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
          {activeTab === "competencies" && (
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Tous les référentiels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les référentiels</SelectItem>
                {frameworks?.map(framework => (
                  <SelectItem key={framework.id} value={framework.id.toString()}>
                    {framework.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/competencies/evaluate">
              <Check className="mr-2 h-4 w-4" />
              Évaluer
            </Link>
          </Button>
          <Button asChild>
            <Link href={activeTab === "frameworks" ? "/competencies/new-framework" : "/competencies/new"}>
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === "frameworks" ? "Nouveau référentiel" : "Nouvelle compétence"}
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="frameworks" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="frameworks">Référentiels</TabsTrigger>
          <TabsTrigger value="competencies">Compétences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frameworks">
          {isLoadingFrameworks ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map(i => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <div className="mt-4 flex justify-between">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredFrameworks && filteredFrameworks.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredFrameworks.map(framework => (
                    <Card key={framework.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">{framework.name}</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{framework.description}</p>
                        <div className="mt-4 flex justify-between">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/competencies/framework/${framework.id}`}>
                              Gérer le référentiel
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setActiveTab("competencies");
                              setSelectedFramework(framework.id.toString());
                            }}
                          >
                            Voir les compétences
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                  <p className="text-gray-500">Aucun référentiel trouvé. {searchQuery ? "Essayez une autre recherche." : "Commencez par créer un référentiel."}</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="competencies">
          {isLoadingCompetencies ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Accordion type="single" collapsible className="bg-white rounded-lg shadow" key={i}>
                  <AccordionItem value={`item-${i}`} className="border-none">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-4">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-2 w-16 rounded-full" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <Skeleton className="h-4 w-full mt-2" />
                      <Skeleton className="h-4 w-3/4 mt-2" />
                      <div className="mt-4 flex justify-end gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          ) : (
            <>
              {filteredCompetencies && filteredCompetencies.length > 0 ? (
                <div className="space-y-4">
                  {filteredCompetencies.map(competency => (
                    <Accordion type="single" collapsible className="bg-white rounded-lg shadow" key={competency.id}>
                      <AccordionItem value={`item-${competency.id}`} className="border-none">
                        <AccordionTrigger className="px-4 py-2 hover:no-underline">
                          <div className="flex justify-between items-center w-full pr-4">
                            <span>
                              {competency.code && (
                                <span className="font-mono text-primary mr-2">{competency.code} -</span>
                              )}
                              {competency.name}
                            </span>
                            <div className="flex items-center">
                              <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColorClass(competencyProgress[competency.id] || 0)}`} 
                                  style={{ width: `${competencyProgress[competency.id] || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{competencyProgress[competency.id] || 0}%</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <p className="text-sm text-muted-foreground">{competency.description}</p>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/competencies/${competency.id}/evaluate`}>
                                Évaluer
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/competencies/${competency.id}/edit`}>
                                Modifier
                              </Link>
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                  <p className="text-gray-500">Aucune compétence trouvée. {searchQuery ? "Essayez une autre recherche." : "Commencez par créer une compétence."}</p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
