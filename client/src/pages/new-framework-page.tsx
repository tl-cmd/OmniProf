import { AppLayout } from "@/components/layout/app-layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CompetencyFramework, Competency, InsertKnowledge, InsertEvaluationCriteria } from "@shared/schema";
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
import { Loader2, BookOpen, List, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

// Schéma de validation pour le référentiel
const frameworkSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
});

type FrameworkFormValues = z.infer<typeof frameworkSchema>;

interface NewFrameworkPageProps {
  teacherInfo: Teacher;
}

// Définition des données du BAC PRO CIEL
const BAC_PRO_CIEL_DATA = {
  name: "Référentiel BAC PRO CIEL",
  description: "Référentiel officiel du BAC PRO Cybersécurité, Informatique et réseaux, Électronique (CIEL)",
  competencies: [
    {
      code: "C01",
      name: "COMMUNIQUER EN SITUATION PROFESSIONNELLE (FRANÇAIS/ANGLAIS)",
      description: "CC8/CC9 - Renseigner les documents/Communiquer avec le client",
      knowledge: [
        { name: "Communication interpersonnelle", taxonomicLevel: 2 },
        { name: "Théorie de la communication : définition, composantes, enjeux, registre de langage, discours expert", taxonomicLevel: 2 },
        { name: "Communication écrite : cahiers des charges, dossiers de présentation", taxonomicLevel: 3 },
        { name: "Communication orale : verbale et non verbale, écoute active, empathie, techniques de reformulation", taxonomicLevel: 3 },
        { name: "Règles de présentation et de typographie", taxonomicLevel: 3 },
      ],
      technicalCriteria: [
        { description: "La présentation (typographie, orthographe, illustration, lisibilité) est soignée et soutient le discours avec des enchaînements cohérents" },
        { description: "La présentation orale (support et expression) est de qualité et claire" },
        { description: "L'argumentation développée lors de la présentation et de l'échange est de qualité" },
        { description: "L'argumentation tient compte des éventuelles situations de handicap des personnes avec lesquelles il interagit" },
      ],
      behaviorCriteria: [
        { description: "Le style, le ton et la terminologie utilisés sont adaptés à la personne et aux circonstances" },
        { description: "L'attitude, les comportements et le langage adoptés sont conformes aux règles de la profession, la réaction est adaptée au contexte" },
      ],
    },
    {
      code: "C03",
      name: "PARTICIPER A UN PROJET",
      description: "CC2/CC1 - Organiser la réalisation ou l'intervention/S'informer sur l'intervention ou sur la réalisation",
      knowledge: [
        { name: "Outils de suivi", taxonomicLevel: 2 },
        { name: "Budgétisation des ressources humaines et matérielles", taxonomicLevel: 2 },
      ],
      technicalCriteria: [
        { description: "Le suivi du projet est conforme aux attentes" },
        { description: "L'espace collaboratif est utilisé de manière appropriée" },
      ],
      behaviorCriteria: [
        { description: "Les tâches sont exécutées avec une attention soutenue et minutieuse afin de garantir le résultat escompté" },
      ],
    },
    {
      code: "C04",
      name: "ANALYSER UNE STRUCTURE MATÉRIELLE ET LOGICIELLE",
      description: "CC3 - Analyser et exploiter les données",
      knowledge: [
        { name: "Infrastructures matérielles et logicielles centralisées, décentralisées ou réparties", taxonomicLevel: 3 },
        { name: "Documents d'architecture métiers (synoptique, schéma de câblage, etc.)", taxonomicLevel: 3 },
        { name: "Structures électroniques matérielles (analogiques et numériques)", taxonomicLevel: 2 },
        { name: "Expertise en électronique analogique", taxonomicLevel: 3 },
        { name: "Anglais technique", taxonomicLevel: 2 },
      ],
      technicalCriteria: [
        { description: "Identification du besoin ainsi que des ressources matérielles, logicielles et humaines" },
        { description: "Extraction des informations nécessaires des documents réglementaires et/ou constructeurs" },
        { description: "Interprétation des indicateurs de fonctionnement" },
      ],
      behaviorCriteria: [
        { description: "Organisation du travail pour répondre aux exigences de qualité, d'efficacité et de délai" },
        { description: "Maintien constant du calme dans des situations particulières, persévérance jusqu'à l'obtention du résultat sans découragement" },
        { description: "Identification des risques en situation de travail et adoption des mesures appropriées pour la santé, la sécurité personnelle et celle des autres" },
      ],
    },
    {
      code: "C06",
      name: "VALIDER LA CONFORMITÉ D'UNE INSTALLATION",
      description: "CC6 - Mettre en service",
      knowledge: [
        { name: "Réseaux informatiques (protocoles, équipements et outils usuels)", taxonomicLevel: 3 },
        { name: "Principes des modèles en couches", taxonomicLevel: 1 },
        { name: "Architecture réseaux industriels et tertiaires", taxonomicLevel: 2 },
        { name: "Structures matérielles (analogiques et numériques)", taxonomicLevel: 2 },
        { name: "Structures programmables", taxonomicLevel: 2 },
        { name: "Appareils de mesure", taxonomicLevel: 3 },
      ],
      technicalCriteria: [
        { description: "Les exigences du cahier des charges sont respectées" },
        { description: "Les tests sont effectués" },
        { description: "Les résultats attendus sont vérifiés" },
        { description: "La procédure de test est suivie" },
      ],
      behaviorCriteria: [
        { description: "Le travail est effectué de manière honnête, sans tromper, abuser, léser ou blesser autrui" },
        { description: "Des actions appropriées sont décidées face à un ensemble de faits" },
      ],
    },
    {
      code: "C07",
      name: "RÉALISER DES MAQUETTES ET PROTOTYPES",
      description: "CC4 - Réaliser une installation ou une intervention",
      knowledge: [
        { name: "Technologies de boîtiers de composants (CMS, traversant, connectiques)", taxonomicLevel: 3 },
        { name: "Technologies de fabrication d'un PCB (procédés industriels)", taxonomicLevel: 2 },
        { name: "Procédés industriels de pose et brasure", taxonomicLevel: 2 },
        { name: "Procédés de prototypage", taxonomicLevel: 3 },
        { name: "Normes IPC", taxonomicLevel: 2 },
        { name: "Normes QSE", taxonomicLevel: 2 },
        { name: "Notions et concepts du développement durable appliqués aux produits électroniques et services numériques", taxonomicLevel: 2 },
      ],
      technicalCriteria: [
        { description: "Le placement et routage respectent le cahier des charges" },
        { description: "La génération des fichiers de fabrication du PCB est conforme aux attentes" },
        { description: "Le PCB est réalisé, contrôlé et respecte les normes IPC (tolérances mécaniques, finition de surface, propreté, ESD, etc.)" },
        { description: "Les composants sont conformes à la nomenclature (marquage, étiquetage)" },
        { description: "La nomenclature des composants est respectée" },
        { description: "Le brasage de la carte est conforme à la nomenclature et aux normes IPC" },
        { description: "Les contraintes environnementales sont intégrées" },
        { description: "Le contrôle visuel de la carte assemblée correspond au dossier de fabrication" },
        { description: "Les risques liés à la situation de travail sont identifiés et les mesures appropriées pour la santé et la sécurité sont prises" },
      ],
      behaviorCriteria: [
        { description: "Le travail est effectué selon les attentes en termes de temps, quantité ou qualité tout en respectant les contraintes environnementales" },
        { description: "L'effort nécessaire est fourni pour terminer et réussir le travail demandé" },
        { description: "Le travail est préparé pour satisfaire les exigences de qualité, d'efficacité et de respect des délais" },
      ],
    },
  ],
};

export default function NewFrameworkPage({ teacherInfo }: NewFrameworkPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importingTemplate, setImportingTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("form");
  const [useTemplate, setUseTemplate] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Configuration du formulaire
  const form = useForm<FrameworkFormValues>({
    resolver: zodResolver(frameworkSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Mise à jour des valeurs du formulaire si le modèle est sélectionné
  const toggleTemplate = () => {
    const newValue = !useTemplate;
    setUseTemplate(newValue);
    
    if (newValue) {
      form.setValue("name", BAC_PRO_CIEL_DATA.name);
      form.setValue("description", BAC_PRO_CIEL_DATA.description);
    } else {
      form.setValue("name", "");
      form.setValue("description", "");
    }
  };

  // Fonction pour créer un référentiel et ses compétences
  const createFrameworkWithCompetencies = async (framework: CompetencyFramework, competenciesData: any[]) => {
    // Récupérer les référentiels existants
    const storedFrameworks = localStorage.getItem('competencyFrameworks');
    const existingFrameworks: CompetencyFramework[] = storedFrameworks 
      ? JSON.parse(storedFrameworks) 
      : [];
    
    // Ajouter le nouveau référentiel
    const updatedFrameworks = [...existingFrameworks, framework];
    localStorage.setItem('competencyFrameworks', JSON.stringify(updatedFrameworks));
    
    // Récupérer les compétences existantes
    const storedCompetencies = localStorage.getItem('competencies');
    const existingCompetencies: Competency[] = storedCompetencies 
      ? JSON.parse(storedCompetencies) 
      : [];
    
    const newCompetencies: Competency[] = [];
    const newKnowledge: InsertKnowledge[] = [];
    const newCriteria: InsertEvaluationCriteria[] = [];
    
    // Créer les compétences et leurs éléments associés
    for (const compData of competenciesData) {
      const competencyId = Date.now() + Math.floor(Math.random() * 1000) + newCompetencies.length;
      
      // Créer la compétence
      const newCompetency: Competency = {
        id: competencyId,
        name: compData.name,
        description: compData.description,
        code: compData.code,
        frameworkId: framework.id,
        createdAt: new Date(),
      };
      
      newCompetencies.push(newCompetency);
      
      // Ajouter les connaissances associées
      if (compData.knowledge && compData.knowledge.length > 0) {
        for (const k of compData.knowledge) {
          const knowledgeId = Date.now() + Math.floor(Math.random() * 1000) + newKnowledge.length;
          newKnowledge.push({
            name: k.name,
            taxonomicLevel: k.taxonomicLevel,
            competencyId: competencyId,
          });
        }
      }
      
      // Ajouter les critères d'évaluation techniques
      if (compData.technicalCriteria && compData.technicalCriteria.length > 0) {
        for (const tc of compData.technicalCriteria) {
          newCriteria.push({
            description: tc.description,
            competencyId: competencyId,
            type: 'technical',
          });
        }
      }
      
      // Ajouter les critères d'évaluation comportementaux
      if (compData.behaviorCriteria && compData.behaviorCriteria.length > 0) {
        for (const bc of compData.behaviorCriteria) {
          newCriteria.push({
            description: bc.description,
            competencyId: competencyId,
            type: 'behavior',
          });
        }
      }
    }
    
    // Sauvegarder les compétences
    const updatedCompetencies = [...existingCompetencies, ...newCompetencies];
    localStorage.setItem('competencies', JSON.stringify(updatedCompetencies));
    
    // Récupérer les connaissances existantes
    const storedKnowledge = localStorage.getItem('knowledge');
    const existingKnowledge = storedKnowledge ? JSON.parse(storedKnowledge) : [];
    const updatedKnowledge = [...existingKnowledge, ...newKnowledge];
    localStorage.setItem('knowledge', JSON.stringify(updatedKnowledge));
    
    // Récupérer les critères d'évaluation existants
    const storedCriteria = localStorage.getItem('evaluationCriteria');
    const existingCriteria = storedCriteria ? JSON.parse(storedCriteria) : [];
    const updatedCriteria = [...existingCriteria, ...newCriteria];
    localStorage.setItem('evaluationCriteria', JSON.stringify(updatedCriteria));
  };

  // Importer le modèle BAC PRO CIEL
  const importTemplate = async () => {
    setImportingTemplate(true);
    try {
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      // Créer un nouveau référentiel
      const newFramework: CompetencyFramework = {
        id: newId,
        name: BAC_PRO_CIEL_DATA.name,
        description: BAC_PRO_CIEL_DATA.description,
        teacherId: teacherInfo.fullName as unknown as number, // Conversion temporaire pour compatibilité
        createdAt: new Date(),
      };
      
      // Créer le référentiel avec toutes les compétences
      await createFrameworkWithCompetencies(newFramework, BAC_PRO_CIEL_DATA.competencies);
      
      // Afficher un message de succès
      toast({
        title: "Référentiel importé",
        description: `Le référentiel "${BAC_PRO_CIEL_DATA.name}" a été importé avec succès avec ${BAC_PRO_CIEL_DATA.competencies.length} compétences.`,
      });
      
      // Rediriger vers la page des compétences
      setTimeout(() => {
        setLocation("/competencies");
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'importation du référentiel:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'importation du référentiel.",
        variant: "destructive",
      });
    } finally {
      setImportingTemplate(false);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (values: FrameworkFormValues) => {
    setIsSubmitting(true);
    try {
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
      
      if (useTemplate) {
        // Si le modèle est sélectionné, importer avec toutes les compétences
        await createFrameworkWithCompetencies(newFramework, BAC_PRO_CIEL_DATA.competencies);
        toast({
          title: "Référentiel créé",
          description: `Le référentiel "${values.name}" a été créé avec succès avec les compétences du BAC PRO CIEL.`,
        });
      } else {
        // Sinon, créer un référentiel vide
        const storedFrameworks = localStorage.getItem('competencyFrameworks');
        const existingFrameworks: CompetencyFramework[] = storedFrameworks 
          ? JSON.parse(storedFrameworks) 
          : [];
        
        const updatedFrameworks = [...existingFrameworks, newFramework];
        localStorage.setItem('competencyFrameworks', JSON.stringify(updatedFrameworks));
        
        toast({
          title: "Référentiel créé",
          description: `Le référentiel "${values.name}" a été créé avec succès.`,
        });
      }
      
      // Rediriger vers la page des compétences
      setTimeout(() => {
        setLocation("/competencies");
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Créer un nouveau référentiel de compétences</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Créer un référentiel</TabsTrigger>
            <TabsTrigger value="template">Voir le modèle BAC PRO CIEL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="mb-6 flex items-center justify-end space-x-2">
                <Switch 
                  id="use-template" 
                  checked={useTemplate}
                  onCheckedChange={toggleTemplate}
                />
                <Label htmlFor="use-template">Utiliser le modèle BAC PRO CIEL</Label>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du référentiel</FormLabel>
                        <FormControl>
                          <Input placeholder="Référentiel BAC PRO CIEL" {...field} />
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
                            placeholder="Ce référentiel contient les compétences, savoirs et critères d'évaluation du BAC PRO CIEL..." 
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
                      onClick={() => setLocation("/competencies")}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création en cours...
                        </>
                      ) : "Créer le référentiel"}
                    </Button>
                  </div>
                </form>
              </Form>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-base font-semibold mb-4">Ou importez directement le référentiel BAC PRO CIEL complet</h3>
                <Button 
                  onClick={importTemplate} 
                  disabled={importingTemplate} 
                  variant="secondary"
                  className="w-full"
                >
                  {importingTemplate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importation en cours...
                    </>
                  ) : "Importer le référentiel BAC PRO CIEL"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="template" className="mt-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">{BAC_PRO_CIEL_DATA.name}</h2>
              <p className="text-gray-600 mb-6">{BAC_PRO_CIEL_DATA.description}</p>
              
              <h3 className="text-lg font-semibold mb-4">Aperçu des compétences incluses</h3>
              
              <div className="space-y-4">
                {BAC_PRO_CIEL_DATA.competencies.map((comp, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="text-primary font-mono mr-2">{comp.code}</span>
                        {comp.name}
                      </CardTitle>
                      <CardDescription>{comp.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                            <h4 className="font-semibold">Savoirs associés</h4>
                          </div>
                          <ul className="list-disc list-inside text-sm">
                            {comp.knowledge.map((k, kidx) => (
                              <li key={kidx}>{k.name} (Niveau {k.taxonomicLevel})</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <div>
                            <div className="flex items-center mb-2">
                              <List className="h-4 w-4 mr-2 text-green-500" />
                              <h4 className="font-semibold">Critères d'évaluation techniques</h4>
                            </div>
                            <ul className="list-disc list-inside text-sm mb-4">
                              {comp.technicalCriteria.map((tc, tcidx) => (
                                <li key={tcidx}>{tc.description}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex items-center mb-2">
                              <CheckCircle2 className="h-4 w-4 mr-2 text-purple-500" />
                              <h4 className="font-semibold">Savoir-être</h4>
                            </div>
                            <ul className="list-disc list-inside text-sm">
                              {comp.behaviorCriteria.map((bc, bcidx) => (
                                <li key={bcidx}>{bc.description}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={importTemplate}
                  disabled={importingTemplate}
                  size="lg"
                >
                  {importingTemplate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importation en cours...
                    </>
                  ) : "Importer ce référentiel"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}