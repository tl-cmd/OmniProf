import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CompetencyFramework, Competency, Knowledge, EvaluationCriteria, InsertKnowledge, InsertEvaluationCriteria } from "@shared/schema";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, Edit, Trash, BookOpen, List, CheckCircle2, PlusCircle, Info, AlignLeft, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Teacher } from "../App";

// Schéma de validation pour la compétence
const competencySchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
  code: z.string().optional(),
});

// Schéma de validation pour le savoir associé
const knowledgeSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  taxonomicLevel: z.number().min(1).max(3),
  competencyId: z.number(),
});

// Schéma de validation pour le critère d'évaluation
const criteriaSchema = z.object({
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
  type: z.enum(["technical", "behavior"]),
  competencyId: z.number(),
});

type CompetencyFormValues = z.infer<typeof competencySchema>;
type KnowledgeFormValues = z.infer<typeof knowledgeSchema>;
type CriteriaFormValues = z.infer<typeof criteriaSchema>;

interface FrameworkDetailPageProps {
  teacherInfo: Teacher;
  frameworkId?: string;
}

export default function FrameworkDetailPage({ teacherInfo, frameworkId }: FrameworkDetailPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [framework, setFramework] = useState<CompetencyFramework | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria[]>([]);
  const [isEditingFramework, setIsEditingFramework] = useState(false);
  const [isAddingCompetency, setIsAddingCompetency] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [isEditingCompetency, setIsEditingCompetency] = useState(false);
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false);
  const [isAddingCriteria, setIsAddingCriteria] = useState(false);
  const [activeCompetencyTab, setActiveCompetencyTab] = useState<string>("details");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Récupérer le référentiel et ses compétences
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!frameworkId) {
          setLocation("/competencies");
          return;
        }

        // Récupérer le référentiel
        const storedFrameworks = localStorage.getItem('competencyFrameworks');
        const frameworks: CompetencyFramework[] = storedFrameworks 
          ? JSON.parse(storedFrameworks) 
          : [];
        
        const foundFramework = frameworks.find(f => f.id.toString() === frameworkId);
        
        if (!foundFramework) {
          toast({
            title: "Référentiel non trouvé",
            description: "Le référentiel demandé n'existe pas.",
            variant: "destructive",
          });
          setLocation("/competencies");
          return;
        }
        
        setFramework(foundFramework);
        
        // Récupérer les compétences associées
        const storedCompetencies = localStorage.getItem('competencies');
        const allCompetencies: Competency[] = storedCompetencies 
          ? JSON.parse(storedCompetencies) 
          : [];
        
        const frameworkCompetencies = allCompetencies.filter(
          comp => comp.frameworkId.toString() === frameworkId
        );
        
        setCompetencies(frameworkCompetencies);

        // Récupérer les savoirs associés
        const storedKnowledge = localStorage.getItem('knowledge');
        const allKnowledge: Knowledge[] = storedKnowledge
          ? JSON.parse(storedKnowledge)
          : [];
        
        setKnowledgeItems(allKnowledge);
        
        // Récupérer les critères d'évaluation
        const storedCriteria = localStorage.getItem('evaluationCriteria');
        const allCriteria: EvaluationCriteria[] = storedCriteria
          ? JSON.parse(storedCriteria)
          : [];
        
        setEvaluationCriteria(allCriteria);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du référentiel.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [frameworkId, setLocation, toast]);
  
  // Récupérer les savoirs associés à une compétence
  const getCompetencyKnowledge = (competencyId: number) => {
    return knowledgeItems.filter(item => item.competencyId === competencyId);
  };
  
  // Récupérer les critères d'évaluation d'une compétence
  const getCompetencyCriteria = (competencyId: number) => {
    return evaluationCriteria.filter(item => item.competencyId === competencyId);
  };
  
  // Récupérer les critères d'évaluation techniques d'une compétence
  const getTechnicalCriteria = (competencyId: number) => {
    return evaluationCriteria.filter(item => item.competencyId === competencyId && item.type === 'technical');
  };
  
  // Récupérer les critères d'évaluation comportementaux d'une compétence
  const getBehaviorCriteria = (competencyId: number) => {
    return evaluationCriteria.filter(item => item.competencyId === competencyId && item.type === 'behavior');
  };

  // Formulaire d'édition du référentiel
  const editFrameworkForm = useForm<{
    name: string;
    description: string;
  }>({
    resolver: zodResolver(z.object({
      name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
      description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
    })),
    defaultValues: {
      name: framework?.name || "",
      description: framework?.description || "",
    },
    values: {
      name: framework?.name || "",
      description: framework?.description || "",
    },
  });

  // Mettre à jour le référentiel
  const handleUpdateFramework = async (values: { name: string; description: string }) => {
    try {
      if (!framework) return;
      
      const storedFrameworks = localStorage.getItem('competencyFrameworks');
      const frameworks: CompetencyFramework[] = storedFrameworks 
        ? JSON.parse(storedFrameworks) 
        : [];
      
      const updatedFrameworks = frameworks.map(f => {
        if (f.id === framework.id) {
          return {
            ...f,
            name: values.name,
            description: values.description,
          };
        }
        return f;
      });
      
      localStorage.setItem('competencyFrameworks', JSON.stringify(updatedFrameworks));
      
      setFramework({
        ...framework,
        name: values.name,
        description: values.description,
      });
      
      toast({
        title: "Référentiel mis à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      
      setIsEditingFramework(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du référentiel:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du référentiel.",
        variant: "destructive",
      });
    }
  };

  // Formulaire d'ajout de compétence
  const addCompetencyForm = useForm<CompetencyFormValues>({
    resolver: zodResolver(competencySchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
    },
  });
  
  // Formulaire d'édition de compétence
  const editCompetencyForm = useForm<CompetencyFormValues>({
    resolver: zodResolver(competencySchema),
    defaultValues: {
      name: selectedCompetency?.name || "",
      description: selectedCompetency?.description || "",
      code: selectedCompetency?.code || "",
    },
    values: {
      name: selectedCompetency?.name || "",
      description: selectedCompetency?.description || "",
      code: selectedCompetency?.code || "",
    }
  });
  
  // Mettre à jour les valeurs du formulaire d'édition quand la compétence sélectionnée change
  useEffect(() => {
    if (selectedCompetency) {
      editCompetencyForm.setValue("name", selectedCompetency.name);
      editCompetencyForm.setValue("description", selectedCompetency.description || "");
      editCompetencyForm.setValue("code", selectedCompetency.code || "");
    }
  }, [selectedCompetency, editCompetencyForm]);

  // Ajouter une compétence
  const handleAddCompetency = async (values: CompetencyFormValues) => {
    try {
      if (!framework) return;
      
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      const newCompetency: Competency = {
        id: newId,
        name: values.name,
        description: values.description,
        code: values.code || null,
        frameworkId: framework.id,
        createdAt: new Date(),
      };
      
      const storedCompetencies = localStorage.getItem('competencies');
      const existingCompetencies: Competency[] = storedCompetencies 
        ? JSON.parse(storedCompetencies) 
        : [];
      
      const updatedCompetencies = [...existingCompetencies, newCompetency];
      
      localStorage.setItem('competencies', JSON.stringify(updatedCompetencies));
      
      setCompetencies([...competencies, newCompetency]);
      
      toast({
        title: "Compétence ajoutée",
        description: `La compétence "${values.name}" a été ajoutée au référentiel.`,
      });
      
      addCompetencyForm.reset();
      setIsAddingCompetency(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la compétence:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la compétence.",
        variant: "destructive",
      });
    }
  };
  
  // Formulaire d'ajout de savoir
  const addKnowledgeForm = useForm<KnowledgeFormValues>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      name: "",
      taxonomicLevel: 1,
      competencyId: selectedCompetency?.id || 0,
    },
    values: {
      name: "",
      taxonomicLevel: 1,
      competencyId: selectedCompetency?.id || 0,
    }
  });
  
  // Formulaire d'ajout de critère
  const addCriteriaForm = useForm<CriteriaFormValues>({
    resolver: zodResolver(criteriaSchema),
    defaultValues: {
      description: "",
      type: "technical",
      competencyId: selectedCompetency?.id || 0,
    },
    values: {
      description: "",
      type: "technical",
      competencyId: selectedCompetency?.id || 0,
    }
  });
  
  // Fonction pour mettre à jour les formulaires lors de la sélection d'une compétence
  useEffect(() => {
    if (selectedCompetency) {
      addKnowledgeForm.setValue("competencyId", selectedCompetency.id);
      addCriteriaForm.setValue("competencyId", selectedCompetency.id);
    }
  }, [selectedCompetency, addKnowledgeForm, addCriteriaForm]);
  
  // Mettre à jour une compétence
  const handleUpdateCompetency = async (values: CompetencyFormValues) => {
    try {
      if (!selectedCompetency) return;
      
      const storedCompetencies = localStorage.getItem('competencies');
      const existingCompetencies: Competency[] = storedCompetencies 
        ? JSON.parse(storedCompetencies) 
        : [];
      
      const updatedCompetencies = existingCompetencies.map(comp => {
        if (comp.id === selectedCompetency.id) {
          return {
            ...comp,
            name: values.name,
            description: values.description,
            code: values.code || null,
          };
        }
        return comp;
      });
      
      localStorage.setItem('competencies', JSON.stringify(updatedCompetencies));
      
      // Mettre à jour l'état local
      setCompetencies(competencies.map(comp => {
        if (comp.id === selectedCompetency.id) {
          return {
            ...comp,
            name: values.name,
            description: values.description,
            code: values.code || null,
          };
        }
        return comp;
      }));
      
      // Mettre à jour la compétence sélectionnée
      setSelectedCompetency({
        ...selectedCompetency,
        name: values.name,
        description: values.description,
        code: values.code || null,
      });
      
      toast({
        title: "Compétence mise à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      
      setIsEditingCompetency(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la compétence:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la compétence.",
        variant: "destructive",
      });
    }
  };

  // Ajouter un savoir
  const handleAddKnowledge = async (values: KnowledgeFormValues) => {
    try {
      if (!selectedCompetency) return;
      
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      const newKnowledge: Knowledge = {
        id: newId,
        name: values.name,
        taxonomicLevel: values.taxonomicLevel,
        competencyId: values.competencyId,
        createdAt: new Date(),
      };
      
      const storedKnowledge = localStorage.getItem('knowledge');
      const existingKnowledge: Knowledge[] = storedKnowledge 
        ? JSON.parse(storedKnowledge) 
        : [];
      
      const updatedKnowledge = [...existingKnowledge, newKnowledge];
      
      localStorage.setItem('knowledge', JSON.stringify(updatedKnowledge));
      
      setKnowledgeItems([...knowledgeItems, newKnowledge]);
      
      toast({
        title: "Savoir associé ajouté",
        description: `Le savoir "${values.name}" a été ajouté à la compétence.`,
      });
      
      addKnowledgeForm.reset({
        name: "",
        taxonomicLevel: 1,
        competencyId: selectedCompetency.id,
      });
      
      setIsAddingKnowledge(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du savoir:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du savoir.",
        variant: "destructive",
      });
    }
  };
  
  // Ajouter un critère d'évaluation
  const handleAddCriteria = async (values: CriteriaFormValues) => {
    try {
      if (!selectedCompetency) return;
      
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      const newCriteria: EvaluationCriteria = {
        id: newId,
        description: values.description,
        type: values.type,
        competencyId: values.competencyId,
        createdAt: new Date(),
      };
      
      const storedCriteria = localStorage.getItem('evaluationCriteria');
      const existingCriteria: EvaluationCriteria[] = storedCriteria 
        ? JSON.parse(storedCriteria) 
        : [];
      
      const updatedCriteria = [...existingCriteria, newCriteria];
      
      localStorage.setItem('evaluationCriteria', JSON.stringify(updatedCriteria));
      
      setEvaluationCriteria([...evaluationCriteria, newCriteria]);
      
      toast({
        title: "Critère d'évaluation ajouté",
        description: `Le critère d'évaluation a été ajouté à la compétence.`,
      });
      
      addCriteriaForm.reset({
        description: "",
        type: "technical",
        competencyId: selectedCompetency.id,
      });
      
      setIsAddingCriteria(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du critère:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du critère.",
        variant: "destructive",
      });
    }
  };
  
  // Supprimer un savoir
  const handleDeleteKnowledge = async (knowledgeId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce savoir associé ?")) return;
    
    try {
      const storedKnowledge = localStorage.getItem('knowledge');
      const existingKnowledge: Knowledge[] = storedKnowledge 
        ? JSON.parse(storedKnowledge) 
        : [];
      
      const updatedKnowledge = existingKnowledge.filter(
        k => k.id !== knowledgeId
      );
      
      localStorage.setItem('knowledge', JSON.stringify(updatedKnowledge));
      
      setKnowledgeItems(knowledgeItems.filter(k => k.id !== knowledgeId));
      
      toast({
        title: "Savoir supprimé",
        description: "Le savoir associé a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du savoir:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du savoir.",
        variant: "destructive",
      });
    }
  };
  
  // Supprimer un critère
  const handleDeleteCriteria = async (criteriaId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce critère d'évaluation ?")) return;
    
    try {
      const storedCriteria = localStorage.getItem('evaluationCriteria');
      const existingCriteria: EvaluationCriteria[] = storedCriteria 
        ? JSON.parse(storedCriteria) 
        : [];
      
      const updatedCriteria = existingCriteria.filter(
        c => c.id !== criteriaId
      );
      
      localStorage.setItem('evaluationCriteria', JSON.stringify(updatedCriteria));
      
      setEvaluationCriteria(evaluationCriteria.filter(c => c.id !== criteriaId));
      
      toast({
        title: "Critère supprimé",
        description: "Le critère d'évaluation a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du critère:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du critère.",
        variant: "destructive",
      });
    }
  };

  // Supprimer une compétence
  const handleDeleteCompetency = async (competencyId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette compétence ?")) return;
    
    try {
      const storedCompetencies = localStorage.getItem('competencies');
      const existingCompetencies: Competency[] = storedCompetencies 
        ? JSON.parse(storedCompetencies) 
        : [];
      
      const updatedCompetencies = existingCompetencies.filter(
        c => c.id !== competencyId
      );
      
      localStorage.setItem('competencies', JSON.stringify(updatedCompetencies));
      
      setCompetencies(competencies.filter(c => c.id !== competencyId));
      
      toast({
        title: "Compétence supprimée",
        description: "La compétence a été supprimée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la compétence:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la compétence.",
        variant: "destructive",
      });
    }
  };

  // Supprimer le référentiel
  const handleDeleteFramework = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce référentiel ? Toutes les compétences associées seront également supprimées.")) return;
    
    try {
      if (!framework) return;
      
      // Supprimer le référentiel
      const storedFrameworks = localStorage.getItem('competencyFrameworks');
      const frameworks: CompetencyFramework[] = storedFrameworks 
        ? JSON.parse(storedFrameworks) 
        : [];
      
      const updatedFrameworks = frameworks.filter(f => f.id !== framework.id);
      
      localStorage.setItem('competencyFrameworks', JSON.stringify(updatedFrameworks));
      
      // Supprimer les compétences associées
      const storedCompetencies = localStorage.getItem('competencies');
      const allCompetencies: Competency[] = storedCompetencies 
        ? JSON.parse(storedCompetencies) 
        : [];
      
      const updatedCompetencies = allCompetencies.filter(
        c => c.frameworkId !== framework.id
      );
      
      localStorage.setItem('competencies', JSON.stringify(updatedCompetencies));
      
      toast({
        title: "Référentiel supprimé",
        description: "Le référentiel et toutes ses compétences ont été supprimés.",
      });
      
      setLocation("/competencies");
    } catch (error) {
      console.error("Erreur lors de la suppression du référentiel:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du référentiel.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Détails du référentiel">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    );
  }

  if (!framework) {
    return (
      <AppLayout title="Référentiel non trouvé">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Référentiel non trouvé</h1>
          <p className="text-gray-600 mb-6">
            Le référentiel que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => setLocation("/competencies")}>
            Retour à la liste des référentiels
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={framework.name}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{framework.name}</h1>
            <p className="text-gray-600 mt-1">
              Créé le {new Date(framework.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingFramework(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteFramework}
            >
              <Trash className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{framework.description}</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Compétences</h2>
          <Button onClick={() => setIsAddingCompetency(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une compétence
          </Button>
        </div>

        {competencies.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              Ce référentiel ne contient encore aucune compétence.
            </p>
            <Button onClick={() => setIsAddingCompetency(true)}>
              Ajouter votre première compétence
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {competencies.map((competency) => (
              <Card key={competency.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        {competency.code ? (
                          <CardTitle>
                            <span className="font-mono text-primary">{competency.code}</span> - {competency.name}
                          </CardTitle>
                        ) : (
                          <CardTitle>{competency.name}</CardTitle>
                        )}
                      </div>
                      <CardDescription className="mt-2">
                        {competency.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedCompetency(competency);
                          setIsEditingCompetency(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCompetency(competency.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="knowledge" className="w-full">
                    <TabsList className="w-full rounded-none grid grid-cols-3">
                      <TabsTrigger value="knowledge" className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Savoirs associés</span>
                        <span className="inline sm:hidden">Savoirs</span>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {getCompetencyKnowledge(competency.id).length}
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="technical" className="flex items-center gap-1">
                        <List className="h-4 w-4" />
                        <span className="hidden sm:inline">Critères techniques</span>
                        <span className="inline sm:hidden">Techniques</span>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {getTechnicalCriteria(competency.id).length}
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="behavior" className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Savoir-être</span>
                        <span className="inline sm:hidden">Savoir-être</span>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {getBehaviorCriteria(competency.id).length}
                        </span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="knowledge" className="p-4 min-h-[180px]">
                      {getCompetencyKnowledge(competency.id).length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>Aucun savoir associé</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              setSelectedCompetency(competency);
                              setIsAddingKnowledge(true);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Ajouter un savoir
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">Liste des savoirs associés</h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCompetency(competency);
                                setIsAddingKnowledge(true);
                              }}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          </div>
                          <ul className="space-y-2">
                            {getCompetencyKnowledge(competency.id).map((knowledge) => (
                              <li key={knowledge.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{knowledge.name}</p>
                                  {knowledge.taxonomicLevel && (
                                    <div className="flex items-center mt-1">
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                        Niveau taxonomique: {knowledge.taxonomicLevel}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 h-8 w-8 p-0"
                                  onClick={() => handleDeleteKnowledge(knowledge.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="technical" className="p-4 min-h-[180px]">
                      {getTechnicalCriteria(competency.id).length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <List className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>Aucun critère technique défini</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              setSelectedCompetency(competency);
                              setIsAddingCriteria(true);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Ajouter un critère
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">Critères d'évaluation techniques</h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCompetency(competency);
                                setIsAddingCriteria(true);
                              }}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          </div>
                          <ul className="space-y-2">
                            {getTechnicalCriteria(competency.id).map((criteria) => (
                              <li key={criteria.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-start">
                                <p>{criteria.description}</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 h-8 w-8 p-0"
                                  onClick={() => handleDeleteCriteria(criteria.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="behavior" className="p-4 min-h-[180px]">
                      {getBehaviorCriteria(competency.id).length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                          <p>Aucun critère comportemental défini</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              setSelectedCompetency(competency);
                              setIsAddingCriteria(true);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Ajouter un critère
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">Critères d'évaluation comportementaux</h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCompetency(competency);
                                setIsAddingCriteria(true);
                              }}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          </div>
                          <ul className="space-y-2">
                            {getBehaviorCriteria(competency.id).map((criteria) => (
                              <li key={criteria.id} className="bg-gray-50 p-3 rounded-md flex justify-between items-start">
                                <p>{criteria.description}</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 h-8 w-8 p-0"
                                  onClick={() => handleDeleteCriteria(criteria.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogue de modification du référentiel */}
      <Dialog open={isEditingFramework} onOpenChange={setIsEditingFramework}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le référentiel</DialogTitle>
            <DialogDescription>
              Modifiez les informations du référentiel de compétences.
            </DialogDescription>
          </DialogHeader>
          <Form {...editFrameworkForm}>
            <form onSubmit={editFrameworkForm.handleSubmit(handleUpdateFramework)} className="space-y-6">
              <FormField
                control={editFrameworkForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du référentiel</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editFrameworkForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditingFramework(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'ajout de compétence */}
      <Dialog open={isAddingCompetency} onOpenChange={setIsAddingCompetency}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une compétence</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle compétence à ce référentiel.
            </DialogDescription>
          </DialogHeader>
          <Form {...addCompetencyForm}>
            <form onSubmit={addCompetencyForm.handleSubmit(handleAddCompetency)} className="space-y-6">
              <FormField
                control={addCompetencyForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="C01" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addCompetencyForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la compétence</FormLabel>
                    <FormControl>
                      <Input placeholder="Résoudre une équation du premier degré" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addCompetencyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="L'élève est capable de résoudre une équation du premier degré à une inconnue..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingCompetency(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'ajout de savoir associé */}
      <Dialog open={isAddingKnowledge} onOpenChange={setIsAddingKnowledge}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un savoir associé</DialogTitle>
            <DialogDescription>
              {selectedCompetency ? (
                <>
                  Ajoutez un savoir associé à la compétence <span className="font-medium">{selectedCompetency.name}</span>.
                </>
              ) : (
                "Ajoutez un savoir associé à cette compétence."
              )}
            </DialogDescription>
          </DialogHeader>
          <Form {...addKnowledgeForm}>
            <form onSubmit={addKnowledgeForm.handleSubmit(handleAddKnowledge)} className="space-y-6">
              <FormField
                control={addKnowledgeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du savoir</FormLabel>
                    <FormControl>
                      <Input placeholder="Théorie de la communication" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addKnowledgeForm.control}
                name="taxonomicLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau taxonomique</FormLabel>
                    <div className="space-y-2">
                      <RadioGroup
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="level-1" />
                          <Label htmlFor="level-1" className="font-normal">Niveau 1 - Connaissance</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="level-2" />
                          <Label htmlFor="level-2" className="font-normal">Niveau 2 - Compréhension</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="level-3" />
                          <Label htmlFor="level-3" className="font-normal">Niveau 3 - Application</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingKnowledge(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'ajout de critère d'évaluation */}
      <Dialog open={isAddingCriteria} onOpenChange={setIsAddingCriteria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un critère d'évaluation</DialogTitle>
            <DialogDescription>
              {selectedCompetency ? (
                <>
                  Ajoutez un critère d'évaluation à la compétence <span className="font-medium">{selectedCompetency.name}</span>.
                </>
              ) : (
                "Ajoutez un critère d'évaluation à cette compétence."
              )}
            </DialogDescription>
          </DialogHeader>
          <Form {...addCriteriaForm}>
            <form onSubmit={addCriteriaForm.handleSubmit(handleAddCriteria)} className="space-y-6">
              <FormField
                control={addCriteriaForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de critère</FormLabel>
                    <div className="space-y-2">
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="technical" id="type-technical" />
                          <Label htmlFor="type-technical" className="font-normal">Technique</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="behavior" id="type-behavior" />
                          <Label htmlFor="type-behavior" className="font-normal">Comportemental (savoir-être)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addCriteriaForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description du critère</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="L'élève respecte les règles de présentation et de typographie..." 
                        {...field} 
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingCriteria(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}