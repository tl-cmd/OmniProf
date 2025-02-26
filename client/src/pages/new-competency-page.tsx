import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Competency, CompetencyFramework } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Teacher } from "../App";

// Schéma de validation pour la compétence
const competencySchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
  frameworkId: z.string().min(1, "Veuillez sélectionner un référentiel"),
});

type CompetencyFormValues = z.infer<typeof competencySchema>;

interface NewCompetencyPageProps {
  teacherInfo: Teacher;
}

export default function NewCompetencyPage({ teacherInfo }: NewCompetencyPageProps) {
  const [frameworks, setFrameworks] = useState<CompetencyFramework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Chargement des référentiels
  useEffect(() => {
    const loadFrameworks = () => {
      setIsLoading(true);
      try {
        const storedFrameworks = localStorage.getItem('competencyFrameworks');
        if (storedFrameworks) {
          const parsedFrameworks = JSON.parse(storedFrameworks) as CompetencyFramework[];
          const teacherFrameworks = parsedFrameworks.filter(f => 
            String(f.teacherId) === teacherInfo.fullName
          );
          setFrameworks(teacherFrameworks);
        } else {
          setFrameworks([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des référentiels:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les référentiels.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFrameworks();
  }, [teacherInfo.fullName, toast]);

  // Configuration du formulaire
  const form = useForm<CompetencyFormValues>({
    resolver: zodResolver(competencySchema),
    defaultValues: {
      name: "",
      description: "",
      frameworkId: "",
    },
  });

  // Soumission du formulaire
  const onSubmit = async (values: CompetencyFormValues) => {
    setIsSubmitting(true);
    try {
      // Récupérer les compétences existantes
      const storedCompetencies = localStorage.getItem('competencies');
      const existingCompetencies: Competency[] = storedCompetencies 
        ? JSON.parse(storedCompetencies) 
        : [];
      
      // Générer un nouvel ID
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Créer une nouvelle compétence
      const newCompetency: Competency = {
        id: newId,
        name: values.name,
        description: values.description,
        frameworkId: parseInt(values.frameworkId),
        createdAt: new Date(),
      };
      
      // Ajouter la nouvelle compétence au tableau
      const updatedCompetencies = [...existingCompetencies, newCompetency];
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('competencies', JSON.stringify(updatedCompetencies));
      
      // Afficher un message de succès
      toast({
        title: "Compétence créée",
        description: `La compétence "${values.name}" a été créée avec succès.`,
      });
      
      // Rediriger vers la page des compétences
      setTimeout(() => {
        setLocation("/competencies");
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la création de la compétence:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la compétence.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si aucun référentiel n'est disponible, inviter à en créer un
  if (!isLoading && frameworks.length === 0) {
    return (
      <AppLayout title="Nouvelle compétence">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Créer une nouvelle compétence</h1>
          
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Vous devez d'abord créer un référentiel de compétences avant de pouvoir ajouter des compétences.</p>
            <Button onClick={() => setLocation("/competencies/new-framework")}>
              Créer un référentiel
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Nouvelle compétence">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Créer une nouvelle compétence</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="L'élève est capable de résoudre une équation du premier degré à une inconnue..." 
                        {...field} 
                        className="min-h-32"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="frameworkId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référentiel</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un référentiel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frameworks.map((framework) => (
                          <SelectItem key={framework.id} value={framework.id.toString()}>
                            {framework.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/competencies" as any)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer la compétence"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}