import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CompetencyFramework, Competency } from "@shared/schema";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, Edit, Trash } from "lucide-react";
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
});

type CompetencyFormValues = z.infer<typeof competencySchema>;

interface FrameworkDetailPageProps {
  teacherInfo: Teacher;
  frameworkId?: string;
}

export default function FrameworkDetailPage({ teacherInfo, frameworkId }: FrameworkDetailPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [framework, setFramework] = useState<CompetencyFramework | null>(null);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [isEditingFramework, setIsEditingFramework] = useState(false);
  const [isAddingCompetency, setIsAddingCompetency] = useState(false);
  const { toast } = useToast();
  const [navigate] = useLocation();

  // Récupérer le référentiel et ses compétences
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!frameworkId) {
          navigate("/competencies" as any);
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
          navigate("/competencies" as any);
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
  }, [frameworkId, navigate, toast]);

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
    },
  });

  // Ajouter une compétence
  const handleAddCompetency = async (values: CompetencyFormValues) => {
    try {
      if (!framework) return;
      
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      const newCompetency: Competency = {
        id: newId,
        name: values.name,
        description: values.description,
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
      
      navigate("/competencies" as any);
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
          <Button onClick={() => navigate("/competencies" as any)}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competencies.map((competency) => (
              <Card key={competency.id}>
                <CardHeader>
                  <CardTitle>{competency.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{competency.description}</p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCompetency(competency.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </CardFooter>
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
    </AppLayout>
  );
}