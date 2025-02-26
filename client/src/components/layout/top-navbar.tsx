import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Upload, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { useToast } from "@/hooks/use-toast";

interface TopNavbarProps {
  className?: string;
  title?: string;
}

export function TopNavbar({ className, title }: TopNavbarProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  
  const getPageTitle = () => {
    if (title) return title;
    
    switch (location) {
      case "/":
        return "Tableau de bord";
      case "/competencies":
        return "Compétences";
      case "/classes":
        return "Classes";
      case "/sequences":
        return "Séquences";
      case "/resources":
        return "Ressources";
      case "/schedule":
        return "Emploi du temps";
      case "/pronote":
        return "Intégration Pronote";
      default:
        return "OmniProf";
    }
  };

  const handleExportData = () => {
    try {
      // Récupérer toutes les données du localStorage
      const exportData: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          exportData[key] = localStorage.getItem(key);
        }
      }
      
      // Créer un fichier JSON à télécharger
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileName = `omniprof_data_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      
      toast({
        title: "Exportation réussie",
        description: "Vos données ont été exportées avec succès.",
      });
    } catch (err) {
      console.error('Erreur lors de l\'exportation des données:', err);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur s'est produite lors de l'exportation de vos données.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    // Créer un input de type fichier caché
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          
          // Confirmation avant d'écraser les données existantes
          if (confirm("Cette opération va remplacer toutes vos données actuelles. Voulez-vous continuer?")) {
            // Effacer les données existantes
            localStorage.clear();
            
            // Importer les nouvelles données
            Object.keys(importedData).forEach(key => {
              localStorage.setItem(key, importedData[key]);
            });
            
            toast({
              title: "Importation réussie",
              description: "Vos données ont été importées avec succès. L'application va se rafraîchir.",
            });
            
            // Rafraîchir l'application après un court délai
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        } catch (err) {
          console.error('Erreur lors de l\'importation des données:', err);
          toast({
            title: "Erreur d'importation",
            description: "Le fichier sélectionné n'est pas valide ou est corrompu.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const handleShowHelp = () => {
    toast({
      title: "Aide",
      description: "OmniProf est une application locale pour les enseignants. Toutes vos données sont stockées sur votre appareil. Utilisez les boutons d'exportation et d'importation pour sauvegarder ou restaurer vos données.",
    });
  };

  return (
    <div className={cn("relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200", className)}>
      <Sidebar isMobile={true} />
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
        </div>
        <div className="ml-4 flex items-center space-x-1 md:ml-6">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm flex items-center"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm flex items-center"
            onClick={handleImportData}
          >
            <Upload className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Importer</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-400 hover:text-gray-500"
            onClick={handleShowHelp}
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Aide</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
