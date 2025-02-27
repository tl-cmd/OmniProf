import { CompetencyFramework, Competency, Knowledge, EvaluationCriteria } from "@shared/schema";

// Fonction pour créer un référentiel BAC PRO CIEL avec ses compétences, savoirs et critères
export const createBacProCielReferentiel = (teacherId: number | string): { 
  framework: CompetencyFramework;
  competencies: Competency[];
  knowledgeItems: Knowledge[];
  evaluationCriteria: EvaluationCriteria[];
} => {
  // Convertir teacherId en number si c'est une chaîne
  const teacherIdNum = typeof teacherId === 'string' ? teacherId as unknown as number : teacherId;
  // Créer l'ID unique pour le référentiel
  const frameworkId = Date.now();
  
  // Créer le référentiel
  const framework: CompetencyFramework = {
    id: frameworkId,
    name: "BAC PRO CIEL - Cybersécurité, Informatique et réseaux, Électronique",
    description: "Référentiel de compétences du BAC PRO CIEL - Ce référentiel définit les compétences, savoirs et critères d'évaluation pour la formation au BAC PRO CIEL.",
    teacherId: teacherIdNum,
    createdAt: new Date(),
  };
  
  // Tableau pour stocker toutes les compétences
  const competencies: Competency[] = [];
  // Tableau pour stocker tous les savoirs associés
  const knowledgeItems: Knowledge[] = [];
  // Tableau pour stocker tous les critères d'évaluation
  const evaluationCriteria: EvaluationCriteria[] = [];
  
  // Incrément pour les IDs
  let nextCompetencyId = frameworkId + 1;
  let nextKnowledgeId = frameworkId + 1000;
  let nextCriteriaId = frameworkId + 2000;
  
  // Fonction helper pour ajouter une compétence et ses éléments associés
  const addCompetency = (
    code: string,
    name: string,
    description: string,
    associatedKnowledge: { name: string; taxonomicLevelId: number }[] = [],
    technicalCriteria: string[] = [],
    behaviorCriteria: string[] = []
  ) => {
    const competencyId = nextCompetencyId++;
    
    // Ajouter la compétence
    competencies.push({
      id: competencyId,
      code,
      name,
      description,
      frameworkId,
      createdAt: new Date(),
    });
    
    // Ajouter les savoirs associés
    associatedKnowledge.forEach(knowledge => {
      knowledgeItems.push({
        id: nextKnowledgeId++,
        name: knowledge.name,
        taxonomicLevelId: knowledge.taxonomicLevelId,
        competencyId,
        createdAt: new Date(),
      });
    });
    
    // Ajouter les critères techniques
    technicalCriteria.forEach(description => {
      evaluationCriteria.push({
        id: nextCriteriaId++,
        description,
        type: "technical",
        competencyId,
        createdAt: new Date(),
      });
    });
    
    // Ajouter les critères comportementaux
    behaviorCriteria.forEach(description => {
      evaluationCriteria.push({
        id: nextCriteriaId++,
        description,
        type: "behavior",
        competencyId,
        createdAt: new Date(),
      });
    });
  };
  
  // BLOC 1: COMMUNIQUER
  addCompetency(
    "C01",
    "COMMUNIQUER avec le client, l'exploitant ou l'équipe",
    "Dialoguer, collecter et transmettre des informations, adapter sa communication à son interlocuteur",
    [
      { name: "Communication professionnelle écrite et orale", taxonomicLevelId: 3 },
      { name: "Vocabulaire technique dans le domaine professionnel", taxonomicLevelId: 2 },
      { name: "Techniques d'écoute active et de questionnement", taxonomicLevelId: 3 },
    ],
    [
      "Les informations nécessaires sont collectées",
      "Le vocabulaire technique est adapté à l'interlocuteur",
      "Les documents professionnels sont rédigés correctement",
      "Les informations sont transmises de manière claire et précise",
    ],
    [
      "L'expression est claire, précise et adaptée à l'interlocuteur",
      "L'attitude est courtoise et respectueuse",
      "L'écoute est attentive",
    ]
  );
  
  addCompetency(
    "C02",
    "ORGANISER son intervention en respectant la sécurité",
    "Planifier et organiser son intervention en respectant les règles de sécurité",
    [
      { name: "Planification d'intervention", taxonomicLevelId: 3 },
      { name: "Règles de sécurité dans le domaine professionnel", taxonomicLevelId: 3 },
      { name: "Normes et réglementations", taxonomicLevelId: 2 },
    ],
    [
      "L'intervention est planifiée de manière cohérente",
      "Les outils nécessaires sont identifiés et préparés",
      "Les risques sont identifiés et pris en compte",
      "Les équipements de protection sont utilisés correctement",
    ],
    [
      "L'organisation est méthodique",
      "Les règles de sécurité sont respectées avec rigueur",
      "L'autocontrôle est systématique",
    ]
  );
  
  // BLOC 2: PRÉPARER
  addCompetency(
    "C03",
    "PRÉVOIR les ressources nécessaires à l'intervention",
    "Identifier et rassembler les ressources matérielles et documentaires nécessaires",
    [
      { name: "Gestion des ressources matérielles", taxonomicLevelId: 3 },
      { name: "Documentation technique des équipements", taxonomicLevelId: 2 },
      { name: "Techniques d'estimation et de planification", taxonomicLevelId: 3 },
    ],
    [
      "Les ressources matérielles nécessaires sont correctement identifiées",
      "La documentation technique est sélectionnée de manière pertinente",
      "L'estimation des ressources est réaliste",
    ],
    [
      "La méthode d'organisation est efficace",
      "L'anticipation des besoins est appropriée",
    ]
  );
  
  addCompetency(
    "C04",
    "PRÉPARER l'intégration d'un système cybersécurisé",
    "Configurer et préparer les équipements et logiciels pour une intégration sécurisée",
    [
      { name: "Bases de la cybersécurité", taxonomicLevelId: 3 },
      { name: "Configuration des équipements réseau", taxonomicLevelId: 3 },
      { name: "Protocoles de sécurité informatique", taxonomicLevelId: 2 },
    ],
    [
      "Les configurations de sécurité sont correctement implémentées",
      "Les tests préliminaires sont effectués méthodiquement",
      "Les vulnérabilités potentielles sont identifiées",
    ],
    [
      "La rigueur dans l'application des protocoles est constante",
      "L'attention aux détails de configuration est manifeste",
    ]
  );
  
  // BLOC 3: RÉALISER
  addCompetency(
    "C05",
    "INSTALLER un système cybersécurisé",
    "Déployer et mettre en service des systèmes informatiques en appliquant les mesures de sécurité appropriées",
    [
      { name: "Installation de systèmes d'exploitation", taxonomicLevelId: 3 },
      { name: "Mise en place de pare-feu et systèmes de protection", taxonomicLevelId: 3 },
      { name: "Déploiement d'environnements virtualisés sécurisés", taxonomicLevelId: 2 },
    ],
    [
      "L'installation est réalisée conformément aux spécifications",
      "Les configurations de sécurité sont correctement implémentées",
      "La documentation de l'installation est complète et précise",
    ],
    [
      "La méthodologie d'installation est suivie rigoureusement",
      "Les bonnes pratiques de sécurité sont systématiquement appliquées",
    ]
  );
  
  addCompetency(
    "C06",
    "EXPLOITER un système cybersécurisé",
    "Utiliser, surveiller et maintenir un système informatique en conditions opérationnelles de sécurité",
    [
      { name: "Supervision et monitoring de systèmes", taxonomicLevelId: 3 },
      { name: "Gestion des incidents de sécurité", taxonomicLevelId: 3 },
      { name: "Mécanismes de détection d'intrusion", taxonomicLevelId: 2 },
    ],
    [
      "La surveillance du système est effectuée régulièrement",
      "Les incidents sont détectés et traités selon les procédures",
      "Les performances du système sont maintenues à un niveau optimal",
    ],
    [
      "La vigilance dans la détection d'anomalies est constante",
      "La réactivité face aux incidents est appropriée",
    ]
  );
  
  addCompetency(
    "C07",
    "DIAGNOSTIQUER un dysfonctionnement dans un système cybersécurisé",
    "Identifier l'origine d'un dysfonctionnement et évaluer son impact sur la sécurité du système",
    [
      { name: "Méthodes de diagnostic systématique", taxonomicLevelId: 3 },
      { name: "Analyse des journaux système et de sécurité", taxonomicLevelId: 3 },
      { name: "Outils de diagnostic réseau et système", taxonomicLevelId: 2 },
    ],
    [
      "La démarche de diagnostic est méthodique et logique",
      "Les tests réalisés sont pertinents",
      "L'origine du dysfonctionnement est correctement identifiée",
      "L'impact sur la sécurité est correctement évalué",
    ],
    [
      "L'analyse est rigoureuse et systématique",
      "La persévérance dans la recherche de solutions est démontrée",
    ]
  );
  
  addCompetency(
    "C08",
    "DÉPANNER un système cybersécurisé",
    "Corriger les dysfonctionnements en rétablissant la sécurité du système",
    [
      { name: "Techniques de correction de vulnérabilités", taxonomicLevelId: 3 },
      { name: "Procédures de restauration système", taxonomicLevelId: 3 },
      { name: "Mise à jour et application de correctifs de sécurité", taxonomicLevelId: 2 },
    ],
    [
      "La solution mise en œuvre corrige effectivement le dysfonctionnement",
      "La sécurité du système est rétablie après intervention",
      "La documentation de l'intervention est complète et utilisable",
    ],
    [
      "L'efficacité dans la mise en œuvre des solutions est démontrée",
      "La vérification post-intervention est systématique",
    ]
  );
  
  // BLOC 4: CYBERSÉCURITÉ
  addCompetency(
    "C09",
    "SÉCURISER un système d'information",
    "Mettre en œuvre les mesures de sécurité adaptées pour protéger un système d'information",
    [
      { name: "Politiques de sécurité des systèmes d'information", taxonomicLevelId: 3 },
      { name: "Chiffrement et protection des données", taxonomicLevelId: 3 },
      { name: "Gestion des identités et des accès", taxonomicLevelId: 3 },
    ],
    [
      "Les mesures de sécurité implémentées sont adaptées aux besoins",
      "La politique de contrôle d'accès est correctement définie et appliquée",
      "Les données sensibles sont correctement protégées",
    ],
    [
      "La rigueur dans l'application des politiques de sécurité est constante",
      "L'anticipation des risques potentiels est démontrée",
    ]
  );
  
  addCompetency(
    "C10",
    "ASSURER la cybersécurité d'un système",
    "Maintenir et faire évoluer le niveau de cybersécurité d'un système d'information",
    [
      { name: "Veille technologique en cybersécurité", taxonomicLevelId: 2 },
      { name: "Tests d'intrusion et évaluation de vulnérabilités", taxonomicLevelId: 3 },
      { name: "Plans de réponse aux incidents de sécurité", taxonomicLevelId: 3 },
    ],
    [
      "La veille sur les nouvelles menaces est régulière et documentée",
      "Les mises à jour de sécurité sont appliquées de manière appropriée",
      "Les tests de sécurité sont réalisés périodiquement",
    ],
    [
      "La proactivité dans l'amélioration continue de la sécurité est démontrée",
      "L'adaptation aux évolutions des menaces est constante",
    ]
  );
  
  return { framework, competencies, knowledgeItems, evaluationCriteria };
};

// Fonction pour stocker les données dans le localStorage
export const storeReferentielData = (
  framework: CompetencyFramework, 
  competencies: Competency[],
  knowledgeItems: Knowledge[],
  evaluationCriteria: EvaluationCriteria[]
) => {
  // Stocker le référentiel
  const storedFrameworks = localStorage.getItem('competencyFrameworks');
  const existingFrameworks: CompetencyFramework[] = storedFrameworks 
    ? JSON.parse(storedFrameworks) 
    : [];
  
  localStorage.setItem('competencyFrameworks', JSON.stringify([...existingFrameworks, framework]));
  
  // Stocker les compétences
  const storedCompetencies = localStorage.getItem('competencies');
  const existingCompetencies: Competency[] = storedCompetencies 
    ? JSON.parse(storedCompetencies) 
    : [];
  
  localStorage.setItem('competencies', JSON.stringify([...existingCompetencies, ...competencies]));
  
  // Stocker les savoirs
  const storedKnowledge = localStorage.getItem('knowledge');
  const existingKnowledge: Knowledge[] = storedKnowledge 
    ? JSON.parse(storedKnowledge) 
    : [];
  
  localStorage.setItem('knowledge', JSON.stringify([...existingKnowledge, ...knowledgeItems]));
  
  // Stocker les critères
  const storedCriteria = localStorage.getItem('evaluationCriteria');
  const existingCriteria: EvaluationCriteria[] = storedCriteria 
    ? JSON.parse(storedCriteria) 
    : [];
  
  localStorage.setItem('evaluationCriteria', JSON.stringify([...existingCriteria, ...evaluationCriteria]));
  
  return true;
};