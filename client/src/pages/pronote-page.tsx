import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, ClipboardList, Upload, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function PronotePage() {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier à importer.",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    // Simuler un chargement pour la démo
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = () => {
        // Ici, nous simulons l'importation des données pour la démo
        // Dans une application réelle, vous enverriez ces données au serveur

        setTimeout(() => {
          setImporting(false);
          toast({
            title: "Importation réussie",
            description: "Les données ont été importées avec succès depuis Pronote.",
          });
          setFile(null);

          // Réinitialiser le champ de fichier
          const fileInput = document.getElementById("import-file") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        }, 2000);
      };

      if (file) {
        reader.readAsText(file);
      }
    }, 500);
  };

  const handleExportIcal = () => {
    // Dans une vraie application, cela appellerait l'API
    // Pour la démo, on affiche juste un toast
    toast({
      title: "Exportation réussie",
      description: "Le fichier iCal a été téléchargé.",
    });

    // Simuler un téléchargement en créant un lien
    const link = document.createElement('a');
    link.href = `/api/export-ical`;
    link.setAttribute('download', 'omniprof-events.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCompetencies = () => {
    toast({
      title: "Exportation des compétences",
      description: "Le fichier d'évaluation des compétences a été généré.",
    });

    // Simulation du téléchargement d'un CSV
    const csvContent = "ID,Élève,Compétence,Note,Date\n1,Dupont Marie,C01 - Analyser,85,2023-10-15\n2,Martin Thomas,C02 - Concevoir,92,2023-10-15";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'evaluations_competences.csv');
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
              <CardContent className="space-y-6">
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
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <div className="flex items-center w-full">
                  <Input
                    id="import-file"
                    type="file"
                    accept=".ics"
                    onChange={handleFileChange}
                    className="flex-1 mr-2"
                  />
                  <Button 
                    onClick={handleImport} 
                    disabled={!file || importing}
                    className="flex-shrink-0"
                  >
                    {importing ? (
                      <>
                        <span className="animate-spin mr-2">⚙️</span>
                        Importation...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Importer
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Formats acceptés: fichiers iCal (.ics) exportés depuis Pronote
                </p>
              </CardFooter>
            </Card>

            {/* Export Card */}
            <Card>
              <CardHeader>
                <CardTitle>Exporter des données</CardTitle>
                <CardDescription>
                  Exportez vos données depuis OmniProf pour les utiliser dans Pronote
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <Download className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Exporter les événements (iCal)</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Exportez vos cours et événements au format iCal pour les importer dans un autre calendrier.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleExportIcal}
                      >
                        Exporter le calendrier
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <Download className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Exporter les évaluations de compétences</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Exportez les évaluations de compétences au format CSV pour les importer dans Pronote.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleExportCompetencies}
                      >
                        Exporter les évaluations
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-primary-50">
                  <h3 className="text-sm font-medium text-primary-700">Aide à l'importation</h3>
                  <p className="text-xs text-gray-600 mt-1 mb-2">
                    Comment importer les données exportées dans Pronote :
                  </p>
                  <ol className="text-xs text-gray-700 space-y-1 ml-4 list-decimal">
                    <li>Ouvrez Pronote et connectez-vous avec vos identifiants</li>
                    <li>Allez dans la section "Ressources" ou "Évaluations"</li>
                    <li>Recherchez l'option "Importer des données"</li>
                    <li>Sélectionnez le fichier exporté depuis OmniProf</li>
                    <li>Suivez les instructions à l'écran pour finaliser l'importation</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}