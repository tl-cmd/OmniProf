import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Teacher } from "../App";
import { Class } from "@shared/schema";

// Schéma de validation pour la création d'une classe
const classSchema = z.object({
  name: z.string().min(1, "Le nom de la classe est requis"),
  subject: z.string().min(1, "La matière est requise"),
  level: z.string().min(1, "Le niveau est requis"),
  studentCount: z.coerce.number().min(1, "Le nombre d'élèves doit être au moins 1"),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface NewClassPageProps {
  teacherInfo: Teacher;
}

export default function NewClassPage({ teacherInfo }: NewClassPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Créer un formulaire avec validation
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      subject: teacherInfo.subject || "",
      level: "",
      studentCount: 0,
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (values: ClassFormValues) => {
    setIsSubmitting(true);
    try {
      // Récupérer les classes existantes ou initialiser un tableau vide
      const existingClassesJson = localStorage.getItem('classes');
      const existingClasses: Class[] = existingClassesJson 
        ? JSON.parse(existingClassesJson)
        : [];
      
      // Générer un nouvel ID (utiliser timestamp + random pour éviter les collisions)
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Créer une nouvelle classe
      // Nous utilisons le nom de l'enseignant comme identifiant
      const newClass: Class = {
        id: newId,
        teacherId: teacherInfo.fullName as unknown as number, // Conversion temporaire pour compatibilité
        name: values.name,
        subject: values.subject,
        level: values.level,
        studentCount: values.studentCount,
        progress: 0,
        nextSessionDate: null,
        createdAt: new Date(),
      };
      
      // Ajouter la nouvelle classe au tableau
      const updatedClasses = [...existingClasses, newClass];
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('classes', JSON.stringify(updatedClasses));
      
      // Afficher un message de succès
      toast({
        title: "Classe créée",
        description: `La classe ${values.name} a été créée avec succès.`,
      });
      
      // Rediriger vers la liste des classes
      navigate("/classes");
    } catch (error) {
      console.error("Erreur lors de la création de la classe:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la classe.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Nouvelle classe">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Créer une nouvelle classe</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la classe</FormLabel>
                    <FormControl>
                      <Input placeholder="3ème A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matière</FormLabel>
                    <FormControl>
                      <Input placeholder="Mathématiques" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau</FormLabel>
                    <FormControl>
                      <Input placeholder="3ème" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="studentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre d'élèves</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/classes")}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer la classe"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}