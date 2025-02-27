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
    description: "Référentiel officiel des compétences, savoirs et critères d'évaluation pour le BAC PRO CIEL.",
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
    correspondence: string,
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
      description: correspondence,
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
  
  // Ajout des compétences selon le référentiel BAC PRO CIEL officiel
  
  // C01 - COMMUNIQUER EN SITUATION PROFESSIONNELLE (FRANÇAIS/ANGLAIS)
  addCompetency(
    "C01",
    "COMMUNIQUER EN SITUATION PROFESSIONNELLE (FRANÇAIS/ANGLAIS)",
    "CC8/CC9 - Renseigner les documents/Communiquer avec le client",
    [
      { name: "Communication interpersonnelle", taxonomicLevelId: 2 },
      { name: "Théorie de la communication : définition, composantes, enjeux, registre de langage, discours expert", taxonomicLevelId: 2 },
      { name: "Communication écrite : cahiers des charges, dossiers de présentation", taxonomicLevelId: 3 },
      { name: "Communication orale : verbale et non verbale, écoute active, empathie, techniques de reformulation", taxonomicLevelId: 3 },
      { name: "Règles de présentation et de typographie", taxonomicLevelId: 3 },
    ],
    [
      "La présentation (typographie, orthographe, illustration, lisibilité) est soignée et soutient le discours avec des enchaînements cohérents",
      "La présentation orale (support et expression) est de qualité et claire",
      "L'argumentation développée lors de la présentation et de l'échange est de qualité",
      "L'argumentation tient compte des éventuelles situations de handicap des personnes avec lesquelles il interagit",
    ],
    [
      "Le style, le ton et la terminologie utilisés sont adaptés à la personne et aux circonstances",
      "L'attitude, les comportements et le langage adoptés sont conformes aux règles de la profession, la réaction est adaptée au contexte",
    ]
  );
  
  // C03 - PARTICIPER A UN PROJET
  addCompetency(
    "C03",
    "PARTICIPER A UN PROJET",
    "CC2/CC1 - Organiser la réalisation ou l'intervention/S'informer sur l'intervention ou sur la réalisation",
    [
      { name: "Outils de suivi", taxonomicLevelId: 2 },
      { name: "Budgétisation des ressources humaines et matérielles", taxonomicLevelId: 2 },
    ],
    [
      "Le suivi du projet est conforme aux attentes",
      "L'espace collaboratif est utilisé de manière appropriée",
    ],
    [
      "Les tâches sont exécutées avec une attention soutenue et minutieuse afin de garantir le résultat escompté",
    ]
  );
  
  // C04 - ANALYSER UNE STRUCTURE MATÉRIELLE ET LOGICIELLE
  addCompetency(
    "C04",
    "ANALYSER UNE STRUCTURE MATÉRIELLE ET LOGICIELLE",
    "CC3 - Analyser et exploiter les données",
    [
      { name: "Infrastructures matérielles et logicielles centralisées, décentralisées ou réparties", taxonomicLevelId: 3 },
      { name: "Documents d'architecture métiers (synoptique, schéma de câblage, etc.)", taxonomicLevelId: 3 },
      { name: "Structures électroniques matérielles (analogiques et numériques)", taxonomicLevelId: 2 },
      { name: "Expertise en électronique analogique", taxonomicLevelId: 3 },
      { name: "Anglais technique", taxonomicLevelId: 2 },
    ],
    [
      "Identification du besoin ainsi que des ressources matérielles, logicielles et humaines",
      "Extraction des informations nécessaires des documents réglementaires et/ou constructeurs",
      "Interprétation des indicateurs de fonctionnement",
    ],
    [
      "Organisation du travail pour répondre aux exigences de qualité, d'efficacité et de délai",
      "Maintien constant du calme dans des situations particulières, persévérance jusqu'à l'obtention du résultat sans découragement",
      "Identification des risques en situation de travail et adoption des mesures appropriées pour la santé, la sécurité personnelle et celle des autres",
    ]
  );
  
  // C06 - VALIDER LA CONFORMITÉ D'UNE INSTALLATION
  addCompetency(
    "C06",
    "VALIDER LA CONFORMITÉ D'UNE INSTALLATION",
    "CC6 - Mettre en service",
    [
      { name: "Réseaux informatiques (protocoles, équipements et outils usuels)", taxonomicLevelId: 3 },
      { name: "Principes des modèles en couches", taxonomicLevelId: 1 },
      { name: "Architecture réseaux industriels et tertiaires", taxonomicLevelId: 2 },
      { name: "Structures matérielles (analogiques et numériques)", taxonomicLevelId: 2 },
      { name: "Structures programmables", taxonomicLevelId: 2 },
      { name: "Appareils de mesure", taxonomicLevelId: 3 },
    ],
    [
      "Les exigences du cahier des charges sont respectées",
      "Les tests sont effectués",
      "Les résultats attendus sont vérifiés",
      "La procédure de test est suivie",
    ],
    [
      "Le travail est effectué de manière honnête, sans tromper, abuser, léser ou blesser autrui",
      "Des actions appropriées sont décidées face à un ensemble de faits",
    ]
  );
  
  // C07 - RÉALISER DES MAQUETTES ET PROTOTYPES
  addCompetency(
    "C07",
    "RÉALISER DES MAQUETTES ET PROTOTYPES",
    "CC4 - Réaliser une installation ou une intervention",
    [
      { name: "Technologies de boîtiers de composants (CMS, traversant, connectiques)", taxonomicLevelId: 3 },
      { name: "Technologies de fabrication d'un PCB (procédés industriels)", taxonomicLevelId: 2 },
      { name: "Procédés industriels de pose et brasure", taxonomicLevelId: 2 },
      { name: "Procédés de prototypage", taxonomicLevelId: 3 },
      { name: "Normes IPC", taxonomicLevelId: 2 },
      { name: "Normes QSE", taxonomicLevelId: 2 },
      { name: "Notions et concepts du développement durable appliqués aux produits électroniques et services numériques", taxonomicLevelId: 2 },
    ],
    [
      "Le placement et routage respectent le cahier des charges",
      "La génération des fichiers de fabrication du PCB est conforme aux attentes",
      "Le PCB est réalisé, contrôlé et respecte les normes IPC (tolérances mécaniques, finition de surface, propreté, ESD, etc.)",
      "Les composants sont conformes à la nomenclature (marquage, étiquetage)",
      "La nomenclature des composants est respectée",
      "Le brasage de la carte est conforme à la nomenclature et aux normes IPC",
      "Les contraintes environnementales sont intégrées",
      "Le contrôle visuel de la carte assemblée correspond au dossier de fabrication",
      "Les risques liés à la situation de travail sont identifiés et les mesures appropriées pour la santé et la sécurité sont prises",
    ],
    [
      "Le travail est effectué selon les attentes en termes de temps, quantité ou qualité tout en respectant les contraintes environnementales",
      "L'effort nécessaire est fourni pour terminer et réussir le travail demandé",
      "Le travail est préparé pour satisfaire les exigences de qualité, d'efficacité et de respect des délais",
    ]
  );
  
  // C08 - CODER
  addCompetency(
    "C08",
    "CODER",
    "CC4 - Réaliser une installation ou une intervention",
    [
      { name: "Langages de développement, description, interfaces IDE", taxonomicLevelId: 2 },
      { name: "Outils de modélisation", taxonomicLevelId: 2 },
      { name: "Politiques liées à la sécurisation des applications", taxonomicLevelId: 2 },
      { name: "Infrastructures matérielles et logicielles", taxonomicLevelId: 2 },
      { name: "Principes fondamentaux de programmation", taxonomicLevelId: 3 },
    ],
    [
      "Les environnements de développement et de test respectent les contraintes de fonctionnalités et de sécurité",
      "Le module logiciel est débogué et sans erreur syntaxique",
      "Les composants logiciels sont développés et testés selon les spécifications",
      "La solution intégrée est testée conformément aux spécifications",
      "Le code est commenté et le logiciel documenté",
    ],
    [
      "Le travail est effectué selon les attentes de temps, quantité ou qualité",
      "Le travail en équipe est solidaire, avec contribution d'idées et d'efforts",
    ]
  );
  
  // C09 - INSTALLER LES ÉLÉMENTS D'UN SYSTÈME ÉLECTRONIQUE OU INFORMATIQUE
  addCompetency(
    "C09",
    "INSTALLER LES ÉLÉMENTS D'UN SYSTÈME ÉLECTRONIQUE OU INFORMATIQUE",
    "CC4 - Réaliser une installation ou une intervention",
    [
      { name: "Conception mécanique et architecturale en 2D et 3D", taxonomicLevelId: 3 },
      { name: "Schémas électriques, électroniques et de réseaux", taxonomicLevelId: 3 },
      { name: "Utilisation d'appareils de mesure (multimètre, oscilloscope, etc.)", taxonomicLevelId: 3 },
      { name: "Habilitation électrique niveau B1V", taxonomicLevelId: 3 },
      { name: "Utilisation d'outillage mécanique et spécifique", taxonomicLevelId: 3 },
      { name: "Certification AIPR (Autorisation d'Intervenir à Proximité des Réseaux)", taxonomicLevelId: 3 },
      { name: "Connaissances en éléments actifs", taxonomicLevelId: 3 },
    ],
    [
      "Vérification complète des éléments nécessaires à l'installation du système conformément au cahier des charges",
      "Installation et raccordement des éléments du système suivant une procédure définie",
      "Réalisation de la configuration",
      "Mise en service effectuée",
      "État de l'installation documenté de manière écrite ou orale",
      "Identifications des risques et adoption des mesures appropriées pour assurer la santé et la sécurité de tous",
    ],
    [
      "Préparation du travail afin de répondre aux exigences de qualité, d'efficacité et de conformité au calendrier",
      "Exécution du travail selon les attentes en termes de temps, quantité ou qualité",
      "Résolution réussie de problèmes nouveaux et imprévus en utilisant ses propres ressources conformément aux règles de la fonction",
      "Accomplissement de tâches variées dans différents domaines et contextes",
    ]
  );
  
  // C10 - EXPLOITER UN RÉSEAU INFORMATIQUE
  addCompetency(
    "C10",
    "EXPLOITER UN RÉSEAU INFORMATIQUE",
    "CC5 - Effectuer les opérations préalables",
    [
      { name: "Commandes d'équipements", taxonomicLevelId: 3 },
      { name: "Connexion à distance", taxonomicLevelId: 3 },
      { name: "Systèmes UNIX et Windows", taxonomicLevelId: 2 },
      { name: "Sécurité informatique", taxonomicLevelId: 2 },
    ],
    [
      "Alertes et problèmes signalés",
      "Éléments de réseau ou système identifiés sur un schéma",
      "Mise à jour des équipements effectuée (iOS, OS, logiciels, firmware)",
      "Optimisations nécessaires réalisées",
    ],
    [
      "Travail en équipe solidaire avec contribution d'idées et d'efforts",
      "Travail préparé pour satisfaire qualité, efficacité et échéancier",
    ]
  );
  
  // C11 - MAINTENIR UN SYSTÈME ÉLECTRONIQUE OU RÉSEAU INFORMATIQUE
  addCompetency(
    "C11",
    "MAINTENIR UN SYSTÈME ÉLECTRONIQUE OU RÉSEAU INFORMATIQUE",
    "CC7 - Réaliser une opération de maintenance",
    [
      { name: "Structures électroniques analogiques et numériques", taxonomicLevelId: 3 },
      { name: "Structures programmables", taxonomicLevelId: 2 },
      { name: "Caractérisation de signaux non complexes", taxonomicLevelId: 2 },
      { name: "Appareils de mesure (multimètre, oscilloscope, générateurs, etc.)", taxonomicLevelId: 3 },
      { name: "Formation à l'habilitation électrique BR", taxonomicLevelId: 2 },
      { name: "Économie de la maintenance (coûts de la maintenance)", taxonomicLevelId: 2 },
      { name: "Normes QSE", taxonomicLevelId: 1 },
      { name: "Différents types de maintenance", taxonomicLevelId: 2 },
      { name: "Normes IPC spécifiques à la réparation", taxonomicLevelId: 2 },
    ],
    [
      "L'intervention est préparée",
      "Le dysfonctionnement est constaté",
      "La maintenance ou la réparation est réalisée",
      "La fiche d'intervention est correctement renseignée",
      "Les risques d'une situation de travail sont identifiés et des mesures appropriées pour la santé et la sécurité de chacun sont adoptées",
    ],
    [
      "Un suivi attentif et constant du déroulement des tâches de travail est observé pour garantir le résultat attendu",
      "Des idées novatrices, des pratiques et des ressources inhabituelles sont introduites pour favoriser l'avancement de son propre travail ou de celui des autres",
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