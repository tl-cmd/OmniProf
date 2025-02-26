import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CompetencyFramework } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Teacher } from "../App";

// Schéma de validation pour le référentiel
const frameworkSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
});

type FrameworkFormValues = z.infer<typeof frameworkSchema>;

interface NewFrameworkPageProps {
  teacherInfo: Teacher;
}

export default function NewFrameworkPage({ teacherInfo }: NewFrameworkPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [navigate] = useLocation();

  // Configuration du formulaire
  const form = useForm<FrameworkFormValues>({
    resolver: zodResolver(frameworkSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Soumission du formulaire
  const onSubmit = async (values: FrameworkFormValues) => {
    setIsSubmitting(true);
    try {
      // Récupérer les référentiels existants
      const storedFrameworks = localStorage.getItem('competencyFrameworks');
      const existingFrameworks: CompetencyFramework[] = storedFrameworks 
        ? JSON.parse(storedFrameworks) 
        : [];
      
      // Générer un nouvel ID
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Créer un nouveau référentiel
      const newFramework: CompetencyFramework = {
        id: newId,
        name: values.name,
        description: values.description,
        teacherId: teacherInfo.fullName as unknown as number, // Conversion temporaire pour compatibilité
        createdAt: new Date(),
      };
      
      // Ajouter le nouveau référentiel au tableau
      const updatedFrameworks = [...existingFrameworks, newFramework];
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('competencyFrameworks', JSON.stringify(updatedFrameworks));
      
      // Afficher un message de succès
      toast({
        title: "Référentiel créé",
        description: `Le référentiel "${values.name}" a été créé avec succès.`,
      });
      
      // Rediriger vers la page des compétences
      setTimeout(() => {
        navigate("/competencies" as any);
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la création du référentiel:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du référentiel.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Nouveau référentiel">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Créer un nouveau référentiel de compétences</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du référentiel</FormLabel>
                    <FormControl>
                      <Input placeholder="Mathématiques - Cycle 4" {...field} />
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
                        placeholder="Ce référentiel regroupe les compétences attendues en mathématiques au cycle 4..." 
                        {...field} 
                        className="min-h-32"
                      />
                    </FormControl>
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
                  {isSubmitting ? "Création en cours..." : "Créer le référentiel"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}