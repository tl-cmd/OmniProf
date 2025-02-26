import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sequence, Class, Competency } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Teacher } from "../App";

// Schéma de validation pour la création d'une séquence
const sequenceSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  description: z.string().optional(),
  classId: z.string().min(1, "Veuillez sélectionner une classe"),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  competencyIds: z.array(z.number()).optional(),
  status: z.enum(["draft", "active", "completed"]).default("draft"),
});

type SequenceFormValues = z.infer<typeof sequenceSchema>;

interface NewSequencePageProps {
  teacherInfo: Teacher;
}

export default function NewSequencePage({ teacherInfo }: NewSequencePageProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [navigate] = useLocation();

  // Chargement des classes et compétences depuis le localStorage
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      try {
        // Charger les classes
        const storedClasses = localStorage.getItem('classes');
        if (storedClasses) {
          const parsedClasses = JSON.parse(storedClasses) as Class[];
          const teacherClasses = parsedClasses.filter(cls => 
            String(cls.teacherId) === teacherInfo.fullName
          );
          setClasses(teacherClasses);
        } else {
          setClasses([]);
        }

        // Charger les compétences
        const storedCompetencies = localStorage.getItem('competencies');
        if (storedCompetencies) {
          const parsedCompetencies = JSON.parse(storedCompetencies) as Competency[];
          setCompetencies(parsedCompetencies);
        } else {
          setCompetencies([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données nécessaires.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [teacherInfo.fullName, toast]);

  // Configuration du formulaire
  const form = useForm<SequenceFormValues>({
    resolver: zodResolver(sequenceSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "",
      startDate: null,
      endDate: null,
      competencyIds: [],
      status: "draft",
    },
  });

  // Soumission du formulaire
  const onSubmit = async (values: SequenceFormValues) => {
    setIsSubmitting(true);
    try {
      // Récupérer les séquences existantes
      const storedSequences = localStorage.getItem('sequences');
      const existingSequences: Sequence[] = storedSequences ? JSON.parse(storedSequences) : [];
      
      // Générer un nouvel ID (utiliser timestamp + random pour éviter les collisions)
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Créer une nouvelle séquence
      const newSequence: Sequence = {
        id: newId,
        teacherId: teacherInfo.fullName as unknown as number, // Conversion temporaire pour compatibilité
        title: values.title,
        description: values.description || null,
        classId: parseInt(values.classId),
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status,
        competencyIds: values.competencyIds || [],
        createdAt: new Date(),
      };
      
      // Ajouter la nouvelle séquence au tableau
      const updatedSequences = [...existingSequences, newSequence];
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('sequences', JSON.stringify(updatedSequences));
      
      // Afficher un message de succès
      toast({
        title: "Séquence créée",
        description: `La séquence "${values.title}" a été créée avec succès.`,
      });
      
      // Rediriger vers la liste des séquences
      setTimeout(() => {
        navigate("/sequences");
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la création de la séquence:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la séquence.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Nouvelle séquence">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Créer une nouvelle séquence</h1>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre de la séquence</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction aux fonctions" {...field} />
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
                      <Textarea placeholder="Objectifs et contenu de la séquence..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une classe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.level} - {cls.name} ({cls.subject})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de début</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "P", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de fin</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "P", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01") || 
                              (form.getValues("startDate") && date < form.getValues("startDate"))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="active">En cours</SelectItem>
                        <SelectItem value="completed">Terminée</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {competencies.length > 0 && (
                <FormField
                  control={form.control}
                  name="competencyIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Compétences associées</FormLabel>
                        <FormDescription>
                          Sélectionnez les compétences travaillées dans cette séquence
                        </FormDescription>
                      </div>
                      {competencies.map((competency) => (
                        <FormField
                          key={competency.id}
                          control={form.control}
                          name="competencyIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={competency.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(competency.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValue, competency.id]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter((value) => value !== competency.id)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {competency.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/sequences")}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer la séquence"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}