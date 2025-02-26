import { Link } from "wouter";
import { 
  ClipboardCheck, 
  CheckCircle, 
  Calendar, 
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const quickActions = [
    {
      title: "Créer une séquence",
      description: "Planifier une nouvelle séquence pédagogique",
      icon: <ClipboardCheck className="h-6 w-6 text-primary-500" />,
      iconBg: "bg-primary-100",
      href: "/sequences/new",
    },
    {
      title: "Évaluer des compétences",
      description: "Évaluer les compétences d'un groupe d'élèves",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      iconBg: "bg-green-100",
      href: "/competencies/evaluate",
    },
    {
      title: "Importer depuis Pronote",
      description: "Synchroniser avec votre compte Pronote",
      icon: <Calendar className="h-6 w-6 text-amber-500" />,
      iconBg: "bg-amber-100",
      href: "/pronote",
    },
    {
      title: "Créer un référentiel",
      description: "Définir un nouveau référentiel de compétences",
      icon: <BookOpen className="h-6 w-6 text-primary-500" />,
      iconBg: "bg-indigo-100",
      href: "/competencies/new-framework",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Actions rapides</h3>
        <Button asChild>
          <Link href="/competencies/evaluate">Nouvelle évaluation</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${action.iconBg} rounded-md p-3`}>
                  {action.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {action.title}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-sm text-gray-900">
                      {action.description}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link href={action.href} className="font-medium text-primary-500 hover:text-primary-600">
                  Commencer
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
