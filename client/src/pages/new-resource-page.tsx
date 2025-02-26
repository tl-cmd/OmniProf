import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Resource, Sequence } from "@shared/schema";
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
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Teacher } from "../App";

// Schéma de validation pour la ressource
const resourceSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  type: z.enum(["document", "exercise", "link", "video", "image"]),
  sequenceId: z.string().optional(),
  content: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface NewResourcePageProps {
  teacherInfo: Teacher;
}

export default function NewResourcePage({ teacherInfo }: NewResourcePageProps) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "exercise" | "link">("document");
  const { toast } = useToast();
  const [navigate] = useLocation();

  // Chargement des séquences
  useEffect(() => {
    const loadSequences = () => {
      setIsLoading(true);
      try {
        const storedSequences = localStorage.getItem('sequences');
        if (storedSequences) {
          const parsedSequences = JSON.parse(storedSequences) as Sequence[];
          const teacherSequences = parsedSequences.filter(s => 
            String(s.teacherId) === teacherInfo.fullName
          );
          setSequences(teacherSequences);
        } else {
          setSequences([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des séquences:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les séquences.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSequences();
  }, [teacherInfo.fullName, toast]);

  // Configuration du formulaire
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: "",
      type: "document",
      sequenceId: "",
      content: "",
      url: "",
    },
  });

  // Surveiller les changements du type de ressource
  useEffect(() => {
    const type = form.watch("type");
    setActiveTab(type as "document" | "exercise" | "link");
  }, [form.watch]);

  // Mettre à jour le type lorsque l'onglet change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "document" | "exercise" | "link");
    form.setValue("type", value as "document" | "exercise" | "link" | "video" | "image");
  };

  // Soumission du formulaire
  const onSubmit = async (values: ResourceFormValues) => {
    setIsSubmitting(true);
    try {
      // Récupérer les ressources existantes
      const storedResources = localStorage.getItem('resources');
      const existingResources: Resource[] = storedResources 
        ? JSON.parse(storedResources) 
        : [];
      
      // Générer un nouvel ID
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Créer une nouvelle ressource
      const newResource: Resource = {
        id: newId,
        name: values.name,
        type: values.type,
        teacherId: teacherInfo.fullName as unknown as number, // Conversion temporaire pour compatibilité
        content: values.content || null,
        url: values.url || null,
        sequenceId: values.sequenceId ? parseInt(values.sequenceId) : null,
        createdAt: new Date(),
      };
      
      // Ajouter la nouvelle ressource au tableau
      const updatedResources = [...existingResources, newResource];
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('resources', JSON.stringify(updatedResources));
      
      // Afficher un message de succès
      toast({
        title: "Ressource créée",
        description: `La ressource "${values.name}" a été créée avec succès.`,
      });
      
      // Rediriger vers la page des ressources
      navigate("/resources");
    } catch (error) {
      console.error("Erreur lors de la création de la ressource:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la ressource.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Nouvelle ressource">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Créer une nouvelle ressource</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la ressource</FormLabel>
                    <FormControl>
                      <Input placeholder="Cours sur les équations" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sequenceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Séquence associée (optionnel)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une séquence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucune séquence</SelectItem>
                        {sequences.map((sequence) => (
                          <SelectItem key={sequence.id} value={sequence.id.toString()}>
                            {sequence.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Vous pouvez associer cette ressource à une séquence d'enseignement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Type de ressource</FormLabel>
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="document">Document</TabsTrigger>
                    <TabsTrigger value="exercise">Exercice</TabsTrigger>
                    <TabsTrigger value="link">Lien</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="document" className="mt-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contenu du document</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Écrivez votre contenu..." 
                              className="min-h-40" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="exercise" className="mt-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contenu de l'exercice</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Écrivez les consignes et les questions de votre exercice..." 
                              className="min-h-40" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="link" className="mt-4">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL du lien</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com" 
                              type="url" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Entrez l'adresse du site web ou de la ressource en ligne
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/resources")}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer la ressource"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}