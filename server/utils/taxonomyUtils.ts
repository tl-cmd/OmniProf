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

    // Créer la taxonomie CIEL (simplifiée)
    const cielTaxonomy: InsertTaxonomy = {
      name: "Référentiel CIEL (Compétences)",
      description: "Niveaux de maîtrise selon le référentiel CIEL pour l'enseignement professionnel",
      isDefault: true,
      teacherId: null,
    };

    const cielTaxonomyId = await this.createTaxonomyWithLevels(cielTaxonomy, [
      {
        name: "Information",
        description: "Je sais de quoi il s'agit, je comprends",
        level: 1,
      },
      {
        name: "Application",
        description: "Je sais faire en situation simple avec une aide",
        level: 2,
      },
      {
        name: "Maîtrise",
        description: "Je sais faire en situation complexe en autonomie",
        level: 3,
      },
      {
        name: "Expertise",
        description: "Je sais analyser et adapter ma méthode dans toutes situations",
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