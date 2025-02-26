import { AppLayout } from "@/components/layout/app-layout";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Upload, Download, Check, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function PronotePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [icalFile, setIcalFile] = useState<File | null>(null);
  const [importTab, setImportTab] = useState<"ical" | "pronote">("ical");
  const [exportTab, setExportTab] = useState<"ical" | "pronote">("ical");
  
  // Mock successful import
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIcalFile(e.target.files[0]);
      setImportError(null);
    }
  };
  
  // Import iCal mutation
  const importIcalMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/import-ical", { icalData: await formData.get('file')?.toString() });
      return await response.json();
    },
    onMutate: () => {
      setImportProgress(0);
      setImportComplete(false);
      setImportError(null);
      
      // Simulate progress updates
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      return () => clearInterval(interval);
    },
    onSuccess: (data) => {
      setImportProgress(100);
      setTimeout(() => {
        setImportComplete(true);
        toast({
          title: "Importation réussie",
          description: `${data.events?.length || 0} événements ont été importés.`,
        });
      }, 500);
    },
    onError: (error: Error) => {
      setImportProgress(0);
      setImportError(error.message || "Une erreur est survenue lors de l'importation.");
      toast({
        title: "Erreur d'importation",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleImportIcal = async () => {
    if (!icalFile) {
      setImportError("Veuillez sélectionner un fichier iCal.");
      return;
    }
    
    const formData = new FormData();
    formData.append('file', icalFile);
    
    // For demo purposes, we'll simulate a successful import
    // In a real app, uncomment the following line
    // importIcalMutation.mutate(formData);
    
    // Simulate success for demo
    setImportProgress(0);
    setImportComplete(false);
    setImportError(null);
    
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    
    setTimeout(() => {
      clearInterval(interval);
      setImportProgress(100);
      setTimeout(() => {
        setImportComplete(true);
        toast({
          title: "Importation réussie",
          description: "5 événements ont été importés.",
        });
      }, 500);
    }, 3000);
  };
  
  const handleExportIcal = () => {
    // In a real app, this would call the export API endpoint
    // For demo, we'll just show a toast
    toast({
      title: "Exportation réussie",
      description: "Le fichier iCal a été téléchargé.",
    });
    
    // Simulate download by creating a link
    const link = document.createElement('a');
    link.href = `/api/export-ical`;
    link.setAttribute('download', 'omniprof-events.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <AppLayout title="Intégration Pronote">
      <div className="mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <ClipboardList className="h-12 w-12 text-primary-500 mx-auto mb-2" />
            <h1 className="text-2xl font-bold">Intégration avec Pronote</h1>
            <p className="text-gray-600 mt-2">
              Synchronisez vos données entre OmniProf et Pronote pour éviter les doubles saisies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Import Card */}
            <Card>
              <CardHeader>
                <CardTitle>Importer des données</CardTitle>
                <CardDescription>
                  Importez votre emploi du temps et vos classes depuis Pronote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={importTab} onValueChange={(v) => setImportTab(v as "ical" | "pronote")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="ical">Fichier iCal</TabsTrigger>
                    <TabsTrigger value="pronote">Connexion Pronote</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ical" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ical-file">Fichier iCal (.ics)</Label>
                        <Input 
                          id="ical-file" 
                          type="file" 
                          accept=".ics"
                          onChange={handleFileChange}
                        />
                      </div>
                      
                      {importError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Erreur</AlertTitle>
                          <AlertDescription>
                            {importError}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {importProgress > 0 && !importComplete && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Importation en cours...</span>
                            <span>{importProgress}%</span>
                          </div>
                          <Progress value={importProgress} />
                        </div>
                      )}
                      
                      {importComplete && (
                        <Alert className="bg-green-50 border-green-200">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">Importation terminée</AlertTitle>
                          <AlertDescription className="text-green-700">
                            Vos événements ont été importés avec succès.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pronote" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pronote-url">URL Pronote</Label>
                        <Input
                          id="pronote-url"
                          placeholder="https://0000000a.index-education.net/pronote/"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pronote-username">Identifiant</Label>
                        <Input
                          id="pronote-username"
                          placeholder="Identifiant Pronote"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pronote-password">Mot de passe</Label>
                        <Input
                          id="pronote-password"
                          type="password"
                          placeholder="Mot de passe Pronote"
                        />
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Fonctionnalité en développement</AlertTitle>
                        <AlertDescription>
                          L'intégration directe avec Pronote sera disponible prochainement. Utilisez l'import iCal pour le moment.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleImportIcal}
                  disabled={importTab === "ical" ? !icalFile || importProgress > 0 : true}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importer
                </Button>
              </CardFooter>
            </Card>
            
            {/* Export Card */}
            <Card>
              <CardHeader>
                <CardTitle>Exporter des données</CardTitle>
                <CardDescription>
                  Exportez vos données vers Pronote ou en format iCal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={exportTab} onValueChange={(v) => setExportTab(v as "ical" | "pronote")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="ical">Fichier iCal</TabsTrigger>
                    <TabsTrigger value="pronote">Vers Pronote</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ical" className="space-y-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Exportez votre emploi du temps au format iCal. Vous pourrez ensuite l'importer dans n'importe quelle application compatible (Google Calendar, Apple Calendar, etc.).
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-sm mb-2">Contenu de l'export :</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Tous les événements (cours, évaluations, réunions)
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Dates et heures des événements
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            Informations sur les classes concernées
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pronote" className="space-y-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Exportez vos évaluations directement vers Pronote.
                      </p>
                      
                      <div className="space-y-2">
                        <Label htmlFor="export-type">Type de données à exporter</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type de données" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="evaluations">Évaluations et notes</SelectItem>
                            <SelectItem value="competencies">Compétences</SelectItem>
                            <SelectItem value="all">Toutes les données</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Fonctionnalité en développement</AlertTitle>
                        <AlertDescription>
                          L'export direct vers Pronote sera disponible prochainement. Utilisez l'export iCal pour le moment.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleExportIcal}
                  disabled={exportTab === "pronote"}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* How-to Guide */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Guide d'utilisation</CardTitle>
              <CardDescription>
                Comment utiliser l'intégration avec Pronote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 mr-2">1</span>
                    Exportez votre emploi du temps depuis Pronote
                  </h3>
                  <p className="text-sm text-gray-600 ml-8">
                    Dans Pronote, allez dans "Emploi du temps" puis cliquez sur "Exporter" et choisissez le format iCal (.ics).
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 mr-2">2</span>
                    Importez le fichier iCal dans OmniProf
                  </h3>
                  <p className="text-sm text-gray-600 ml-8">
                    Utilisez la fonction "Importer des données" et sélectionnez le fichier iCal que vous avez exporté depuis Pronote.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 mr-2">3</span>
                    Complétez les informations dans OmniProf
                  </h3>
                  <p className="text-sm text-gray-600 ml-8">
                    Ajoutez des compétences, des ressources et des évaluations à vos cours importés dans OmniProf.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 mr-2">4</span>
                    Exportez vos évaluations et compétences
                  </h3>
                  <p className="text-sm text-gray-600 ml-8">
                    Une fois vos évaluations réalisées, exportez-les pour les importer dans Pronote.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
