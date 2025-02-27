import { storage } from "../storage";
import { Taxonomy, TaxonomicLevel, InsertTaxonomy, InsertTaxonomicLevel } from "@shared/schema";

/**
 * Fonctions utilitaires pour gérer les taxonomies et les niveaux taxonomiques
 */
export const taxonomyUtils = {
  /**
   * Initialise les taxonomies par défaut si elles n'existent pas déjà
   */
  async initDefaultTaxonomies(): Promise<void> {
    // Vérifier si des taxonomies existent déjà
    const existingTaxonomies = await storage.getTaxonomies();
    if (existingTaxonomies.length > 0) {
      return; // Des taxonomies existent déjà, pas besoin d'initialiser
    }

    // Créer la taxonomie de Bloom
    const bloomTaxonomy: InsertTaxonomy = {
      name: "Taxonomie de Bloom",
      description: "Classification hiérarchique des objectifs d'apprentissage, du plus simple au plus complexe.",
      isDefault: true,
      teacherId: null, // null car c'est une taxonomie prédéfinie
    };

    const bloomTaxonomyId = await this.createTaxonomyWithLevels(bloomTaxonomy, [
      {
        name: "Connaître",
        description: "Se souvenir de faits et de concepts de base",
        level: 1,
      },
      {
        name: "Comprendre",
        description: "Expliquer des idées ou des concepts",
        level: 2,
      },
      {
        name: "Appliquer",
        description: "Utiliser des informations dans de nouvelles situations",
        level: 3,
      },
      {
        name: "Analyser",
        description: "Établir des liens entre les informations",
        level: 4,
      },
      {
        name: "Évaluer",
        description: "Justifier une position ou une décision",
        level: 5,
      },
      {
        name: "Créer",
        description: "Produire un travail original",
        level: 6,
      },
    ]);

    // Créer la taxonomie CIEL (conforme au référentiel BAC PRO CIEL)
    const cielTaxonomy: InsertTaxonomy = {
      name: "Référentiel BAC PRO CIEL",
      description: "Niveaux taxonomiques du référentiel BAC PRO CIEL pour l'enseignement professionnel",
      isDefault: true,
      teacherId: null,
    };

    const cielTaxonomyId = await this.createTaxonomyWithLevels(cielTaxonomy, [
      {
        name: "Niveau 1",
        description: "Niveau de l'information (Je sais de quoi il s'agit, je comprends)",
        level: 1,
      },
      {
        name: "Niveau 2",
        description: "Niveau de l'expression (Je sais en parler, je peux l'expliquer)",
        level: 2,
      },
      {
        name: "Niveau 3",
        description: "Niveau de la maîtrise d'outils (Je sais faire, je maîtrise les outils)",
        level: 3,
      },
      {
        name: "Niveau 4", 
        description: "Niveau de la maîtrise méthodologique (Je sais choisir les outils et la méthode adaptés)",
        level: 4,
      },
    ]);

    // Créer la taxonomie bipolaire (Savoir/Savoir-faire/Savoir-être)
    const bipolaireTaxonomy: InsertTaxonomy = {
      name: "Savoir / Savoir-faire / Savoir-être",
      description: "Classification tripartite des compétences",
      isDefault: true,
      teacherId: null,
    };

    const bipolaireTaxonomyId = await this.createTaxonomyWithLevels(bipolaireTaxonomy, [
      {
        name: "Savoir",
        description: "Connaissances théoriques, concepts, faits",
        level: 1,
      },
      {
        name: "Savoir-faire",
        description: "Capacités techniques, méthodologiques, opérationnelles",
        level: 2,
      },
      {
        name: "Savoir-être",
        description: "Attitudes, comportements, posture, communication",
        level: 3,
      },
    ]);
    
    // Créer la taxonomie pour les compétences du BAC PRO CIEL
    const competencesCielTaxonomy: InsertTaxonomy = {
      name: "Compétences BAC PRO CIEL",
      description: "Classification des compétences du BAC PRO CIEL (Communication, Analyse, Installation, etc.)",
      isDefault: true,
      teacherId: null,
    };
    
    const competencesCielTaxonomyId = await this.createTaxonomyWithLevels(competencesCielTaxonomy, [
      {
        name: "C01 - COMMUNIQUER EN SITUATION PROFESSIONNELLE (FRANÇAIS/ANGLAIS)",
        description: "CC8/CC9 - Renseigner les documents/Communiquer avec le client",
        level: 1,
      },
      {
        name: "C03 - PARTICIPER A UN PROJET",
        description: "CC2/CC1 - Organiser la réalisation ou l'intervention/S'informer sur l'intervention ou sur la réalisation",
        level: 2,
      },
      {
        name: "C04 - ANALYSER UNE STRUCTURE MATÉRIELLE ET LOGICIELLE",
        description: "CC3 - Analyser et exploiter les données",
        level: 3,
      },
      {
        name: "C06 - VALIDER LA CONFORMITÉ D'UNE INSTALLATION",
        description: "CC6 - Mettre en service",
        level: 4,
      },
      {
        name: "C07 - RÉALISER DES MAQUETTES ET PROTOTYPES",
        description: "CC4 - Réaliser une installation ou une intervention",
        level: 5,
      },
      {
        name: "C08 - CODER",
        description: "CC4 - Réaliser une installation ou une intervention",
        level: 6,
      },
      {
        name: "C09 - INSTALLER LES ÉLÉMENTS D'UN SYSTÈME ÉLECTRONIQUE OU INFORMATIQUE",
        description: "CC4 - Réaliser une installation ou une intervention",
        level: 7,
      },
      {
        name: "C10 - EXPLOITER UN RÉSEAU INFORMATIQUE",
        description: "CC5 - Effectuer les opérations préalables",
        level: 8,
      },
      {
        name: "C11 - MAINTENIR UN SYSTÈME ÉLECTRONIQUE OU RÉSEAU INFORMATIQUE",
        description: "CC7 - Réaliser une opération de maintenance",
        level: 9,
      },
    ]);

    console.log("Taxonomies par défaut initialisées avec succès");
  },

  /**
   * Crée une taxonomie avec ses niveaux taxonomiques
   */
  async createTaxonomyWithLevels(
    taxonomyData: InsertTaxonomy,
    levels: Array<{ name: string; description: string; level: number }>
  ): Promise<number> {
    // Créer la taxonomie
    const taxonomy = await storage.createTaxonomy(taxonomyData);

    // Créer les niveaux taxonomiques
    for (const levelData of levels) {
      await storage.createTaxonomicLevel({
        ...levelData,
        taxonomyId: taxonomy.id,
      });
    }

    return taxonomy.id;
  },

  /**
   * Récupère toutes les taxonomies disponibles
   */
  async getAllTaxonomies(): Promise<Taxonomy[]> {
    return await storage.getTaxonomies();
  },

  /**
   * Récupère les niveaux taxonomiques d'une taxonomie donnée
   */
  async getTaxonomicLevels(taxonomyId: number): Promise<TaxonomicLevel[]> {
    return await storage.getTaxonomicLevels(taxonomyId);
  },

  /**
   * Crée une nouvelle taxonomie personnalisée
   */
  async createCustomTaxonomy(
    taxonomyData: InsertTaxonomy,
    levels: Array<{ name: string; description: string; level: number }>
  ): Promise<Taxonomy> {
    const taxonomy = await storage.createTaxonomy({
      ...taxonomyData,
      isDefault: false, // Les taxonomies personnalisées ne sont jamais par défaut
    });

    // Créer les niveaux taxonomiques
    for (const levelData of levels) {
      await storage.createTaxonomicLevel({
        ...levelData,
        taxonomyId: taxonomy.id,
      });
    }

    return taxonomy;
  }
};