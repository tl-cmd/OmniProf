import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Class, Competency, CompetencyAssessment } from "@shared/schema";

// Type to hold aggregated competency data with statistics
type CompetencyProgress = {
  id: number;
  name: string;
  percentComplete: number;
  studentsEvaluated: number;
  totalStudents: number;
};

export function SkillsProgressOverview() {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  
  // Fetch classes
  const { data: classes, isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });
  
  // Fetch competencies
  const { data: competencyData, isLoading: isLoadingCompetencies } = useQuery<{ frameworks: any[], competencies: Competency[] }>({
    queryKey: ['/api/competencies/all'],
    queryFn: async () => {
      // In a real app, you would have an API endpoint that returns all competencies
      // For now, we'll mock the data
      return {
        frameworks: [],
        competencies: [
          { id: 1, name: "Résoudre des problèmes", description: "", frameworkId: 1, createdAt: new Date() },
          { id: 2, name: "Utiliser les nombres relatifs", description: "", frameworkId: 1, createdAt: new Date() },
          { id: 3, name: "Calculer avec des fractions", description: "", frameworkId: 1, createdAt: new Date() },
          { id: 4, name: "Utiliser le théorème de Pythagore", description: "", frameworkId: 1, createdAt: new Date() },
          { id: 5, name: "Calculer une expression littérale", description: "", frameworkId: 1, createdAt: new Date() },
          { id: 6, name: "Résoudre des équations", description: "", frameworkId: 1, createdAt: new Date() },
        ]
      };
    },
  });
  
  // Fetch assessments
  const { data: assessments, isLoading: isLoadingAssessments } = useQuery<CompetencyAssessment[]>({
    queryKey: ['/api/competency-assessments', { classId: selectedClassId !== "all" ? parseInt(selectedClassId) : undefined }],
    queryFn: async () => {
      // In a real app, you would fetch the actual assessments
      // For now, we'll return mock data
      return [];
    },
  });
  
  const isLoading = isLoadingClasses || isLoadingCompetencies || isLoadingAssessments;
  
  // Calculate competency progress statistics
  const competencyProgress: CompetencyProgress[] = !isLoading && competencyData ? competencyData.competencies.map(comp => {
    // In a real app, you would calculate these values from assessments and classes
    // For now, we'll use mock data
    const mockStats: { [key: number]: { percent: number, evaluated: number, total: number } } = {
      1: { percent: 78, evaluated: 21, total: 28 },
      2: { percent: 62, evaluated: 24, total: 28 },
      3: { percent: 45, evaluated: 28, total: 28 },
      4: { percent: 85, evaluated: 26, total: 28 },
      5: { percent: 68, evaluated: 25, total: 28 },
      6: { percent: 72, evaluated: 28, total: 28 },
    };
    
    const stats = mockStats[comp.id] || { percent: 0, evaluated: 0, total: 0 };
    
    return {
      id: comp.id,
      name: comp.name,
      percentComplete: stats.percent,
      studentsEvaluated: stats.evaluated,
      totalStudents: stats.total
    };
  }) : [];

  const getColorClass = (percent: number) => {
    if (percent >= 75) return "text-green-600 bg-success";
    if (percent >= 60) return "text-yellow-600 bg-warning";
    return "text-red-600 bg-error";
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Progression des compétences</h3>
        <div className="flex items-center">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-[180px] mr-2">
              <SelectValue placeholder="Toutes les classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes?.map(cls => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/competencies" className="text-sm font-medium text-primary-500 hover:text-primary-600">
            Voir toutes les compétences
          </Link>
        </div>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white overflow-hidden border border-gray-200 rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full" />
                    <div className="mt-2">
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {competencyProgress.map((comp) => (
                <div key={comp.id} className="bg-white overflow-hidden border border-gray-200 rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{comp.name}</h4>
                      <span className={`text-sm font-semibold ${comp.percentComplete >= 75 ? 'text-green-600' : comp.percentComplete >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {comp.percentComplete}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${getColorClass(comp.percentComplete)}`} 
                        style={{ width: `${comp.percentComplete}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>{comp.studentsEvaluated} élèves évalués sur {comp.totalStudents}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
