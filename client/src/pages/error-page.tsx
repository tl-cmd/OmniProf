
import { Link } from "@/hooks/use-location";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Page non trouvée</h1>
        <p className="mt-3 text-base text-gray-600">
          Désolé, nous ne trouvons pas la page que vous recherchez.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-12 space-y-3">
        <h2 className="text-xl font-medium text-gray-800">Pages disponibles :</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/" className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Accueil</Link>
          <Link href="/dashboard" className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Tableau de bord</Link>
          <Link href="/classes" className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Classes</Link>
          <Link href="/competencies" className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Compétences</Link>
          <Link href="/sequences" className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Séquences</Link>
          <Link href="/planning" className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Planning</Link>
          <Link href="/resources" className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Ressources</Link>
          <Link href="/pronote" className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50">Pronote</Link>
        </div>
      </div>
    </div>
  );
}
