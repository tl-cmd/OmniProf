import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { parseIcalToEvents, generateIcalFromEvents } from "./utils/ical";
import { z } from "zod";
import { 
  insertClassSchema,
  insertStudentSchema,
  insertCompetencyFrameworkSchema,
  insertCompetencySchema,
  insertCompetencyAssessmentSchema,
  insertSequenceSchema,
  insertResourceSchema,
  insertEventSchema,
  InsertEvent
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    next();
  };

  // Classes routes
  app.get("/api/classes", requireAuth, async (req, res) => {
    const teacherId = (req.user as any).id;
    const classes = await storage.getClasses(teacherId);
    res.json(classes);
  });

  app.get("/api/classes/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const cls = await storage.getClass(id);
    
    if (!cls) {
      return res.status(404).json({ message: "Classe non trouvée" });
    }
    
    // Check if user owns this class
    if (cls.teacherId !== (req.user as any).id) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    
    res.json(cls);
  });

  app.post("/api/classes", requireAuth, async (req, res) => {
    try {
      const teacherId = (req.user as any).id;
      const validatedData = insertClassSchema.parse({
        ...req.body,
        teacherId
      });
      
      const newClass = await storage.createClass(validatedData);
      res.status(201).json(newClass);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  app.put("/api/classes/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cls = await storage.getClass(id);
      
      if (!cls) {
        return res.status(404).json({ message: "Classe non trouvée" });
      }
      
      // Check if user owns this class
      if (cls.teacherId !== (req.user as any).id) {
        return res.status(403).json({ message: "Accès refusé" });
      }
      
      // Validate partial data
      const validatedData = insertClassSchema.partial().parse(req.body);
      
      const updatedClass = await storage.updateClass(id, validatedData);
      res.json(updatedClass);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  app.delete("/api/classes/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const cls = await storage.getClass(id);
    
    if (!cls) {
      return res.status(404).json({ message: "Classe non trouvée" });
    }
    
    // Check if user owns this class
    if (cls.teacherId !== (req.user as any).id) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    
    await storage.deleteClass(id);
    res.status(204).end();
  });

  // Students routes
  app.get("/api/classes/:classId/students", requireAuth, async (req, res) => {
    const classId = parseInt(req.params.classId);
    const cls = await storage.getClass(classId);
    
    if (!cls) {
      return res.status(404).json({ message: "Classe non trouvée" });
    }
    
    // Check if user owns this class
    if (cls.teacherId !== (req.user as any).id) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    
    const students = await storage.getStudents(classId);
    res.json(students);
  });

  app.post("/api/students", requireAuth, async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      
      // Check if user owns the class
      const cls = await storage.getClass(validatedData.classId);
      if (!cls || cls.teacherId !== (req.user as any).id) {
        return res.status(403).json({ message: "Accès refusé" });
      }
      
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  // Competency Framework routes
  app.get("/api/competency-frameworks", requireAuth, async (req, res) => {
    const teacherId = (req.user as any).id;
    const frameworks = await storage.getCompetencyFrameworks(teacherId);
    res.json(frameworks);
  });

  app.post("/api/competency-frameworks", requireAuth, async (req, res) => {
    try {
      const teacherId = (req.user as any).id;
      const validatedData = insertCompetencyFrameworkSchema.parse({
        ...req.body,
        teacherId
      });
      
      const framework = await storage.createCompetencyFramework(validatedData);
      res.status(201).json(framework);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  // Competencies routes
  app.get("/api/competency-frameworks/:frameworkId/competencies", requireAuth, async (req, res) => {
    const frameworkId = parseInt(req.params.frameworkId);
    const framework = await storage.getCompetencyFramework(frameworkId);
    
    if (!framework) {
      return res.status(404).json({ message: "Référentiel non trouvé" });
    }
    
    // Check if user owns this framework
    if (framework.teacherId !== (req.user as any).id) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    
    const competencies = await storage.getCompetencies(frameworkId);
    res.json(competencies);
  });

  app.post("/api/competencies", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCompetencySchema.parse(req.body);
      
      // Check if user owns the framework
      const framework = await storage.getCompetencyFramework(validatedData.frameworkId);
      if (!framework || framework.teacherId !== (req.user as any).id) {
        return res.status(403).json({ message: "Accès refusé" });
      }
      
      const competency = await storage.createCompetency(validatedData);
      res.status(201).json(competency);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  // Competency Assessments routes
  app.get("/api/competency-assessments", requireAuth, async (req, res) => {
    const teacherId = (req.user as any).id;
    const { classId, studentId, competencyId } = req.query;
    
    const params: { teacherId: number, classId?: number, studentId?: number, competencyId?: number } = { 
      teacherId 
    };
    
    if (classId) params.classId = parseInt(classId as string);
    if (studentId) params.studentId = parseInt(studentId as string);
    if (competencyId) params.competencyId = parseInt(competencyId as string);
    
    const assessments = await storage.getCompetencyAssessments(params);
    res.json(assessments);
  });

  app.post("/api/competency-assessments", requireAuth, async (req, res) => {
    try {
      const teacherId = (req.user as any).id;
      const validatedData = insertCompetencyAssessmentSchema.parse({
        ...req.body,
        teacherId
      });
      
      // Check if user owns the class
      const cls = await storage.getClass(validatedData.classId);
      if (!cls || cls.teacherId !== teacherId) {
        return res.status(403).json({ message: "Accès refusé" });
      }
      
      const assessment = await storage.createCompetencyAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  // Sequences routes
  app.get("/api/sequences", requireAuth, async (req, res) => {
    const teacherId = (req.user as any).id;
    const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
    
    const sequences = await storage.getSequences(teacherId, classId);
    res.json(sequences);
  });

  app.post("/api/sequences", requireAuth, async (req, res) => {
    try {
      const teacherId = (req.user as any).id;
      const validatedData = insertSequenceSchema.parse({
        ...req.body,
        teacherId
      });
      
      // Check if user owns the class
      const cls = await storage.getClass(validatedData.classId);
      if (!cls || cls.teacherId !== teacherId) {
        return res.status(403).json({ message: "Accès refusé" });
      }
      
      const sequence = await storage.createSequence(validatedData);
      res.status(201).json(sequence);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  // Resources routes
  app.get("/api/resources", requireAuth, async (req, res) => {
    const teacherId = (req.user as any).id;
    const sequenceId = req.query.sequenceId ? parseInt(req.query.sequenceId as string) : undefined;
    
    const resources = await storage.getResources(teacherId, sequenceId);
    res.json(resources);
  });

  app.post("/api/resources", requireAuth, async (req, res) => {
    try {
      const teacherId = (req.user as any).id;
      const validatedData = insertResourceSchema.parse({
        ...req.body,
        teacherId
      });
      
      // If sequence is provided, check ownership
      if (validatedData.sequenceId) {
        const sequence = await storage.getSequence(validatedData.sequenceId);
        if (!sequence || sequence.teacherId !== teacherId) {
          return res.status(403).json({ message: "Accès refusé" });
        }
      }
      
      const resource = await storage.createResource(validatedData);
      res.status(201).json(resource);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  // Events/Schedule routes
  app.get("/api/events", requireAuth, async (req, res) => {
    const teacherId = (req.user as any).id;
    const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
    
    const events = await storage.getEvents(teacherId, classId);
    res.json(events);
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const teacherId = (req.user as any).id;
      const validatedData = insertEventSchema.parse({
        ...req.body,
        teacherId
      });
      
      // If class is provided, check ownership
      if (validatedData.classId) {
        const cls = await storage.getClass(validatedData.classId);
        if (!cls || cls.teacherId !== teacherId) {
          return res.status(403).json({ message: "Accès refusé" });
        }
      }
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: err.errors });
      }
      throw err;
    }
  });

  // iCal import/export
  app.post("/api/import-ical", requireAuth, async (req, res) => {
    try {
      const teacherId = (req.user as any).id;
      
      if (!req.body.icalData) {
        return res.status(400).json({ message: "Données iCal manquantes" });
      }
      
      const events = parseIcalToEvents(req.body.icalData, teacherId);
      
      // Save the events to the database
      const savedEvents = [];
      for (const event of events) {
        savedEvents.push(await storage.createEvent(event));
      }
      
      res.status(201).json({ message: `${savedEvents.length} événements importés`, events: savedEvents });
    } catch (err) {
      res.status(400).json({ message: "Erreur lors de l'analyse du fichier iCal", error: err });
    }
  });

  app.get("/api/export-ical", requireAuth, async (req, res) => {
    const teacherId = (req.user as any).id;
    const events = await storage.getEvents(teacherId);
    
    const icalData = generateIcalFromEvents(events);
    
    res.set("Content-Type", "text/calendar");
    res.set("Content-Disposition", "attachment; filename=omniprof-events.ics");
    res.send(icalData);
  });

  const httpServer = createServer(app);

  return httpServer;
}
