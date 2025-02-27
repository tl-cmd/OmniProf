import session from "express-session";
import createMemoryStore from "memorystore";
import {
  User, InsertUser,
  Class, InsertClass,
  Student, InsertStudent,
  CompetencyFramework, InsertCompetencyFramework,
  Competency, InsertCompetency,
  Knowledge, InsertKnowledge,
  EvaluationCriteria, InsertEvaluationCriteria,
  CompetencyAssessment, InsertCompetencyAssessment,
  Sequence, InsertSequence,
  Resource, InsertResource,
  Event, InsertEvent
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Class methods
  getClasses(teacherId: number): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: number): Promise<boolean>;
  
  // Student methods
  getStudents(classId: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Competency Framework methods
  getCompetencyFrameworks(teacherId: number): Promise<CompetencyFramework[]>;
  getCompetencyFramework(id: number): Promise<CompetencyFramework | undefined>;
  createCompetencyFramework(framework: InsertCompetencyFramework): Promise<CompetencyFramework>;
  updateCompetencyFramework(id: number, framework: Partial<InsertCompetencyFramework>): Promise<CompetencyFramework | undefined>;
  deleteCompetencyFramework(id: number): Promise<boolean>;
  
  // Competency methods
  getCompetencies(frameworkId: number): Promise<Competency[]>;
  getCompetency(id: number): Promise<Competency | undefined>;
  createCompetency(competency: InsertCompetency): Promise<Competency>;
  updateCompetency(id: number, competency: Partial<InsertCompetency>): Promise<Competency | undefined>;
  deleteCompetency(id: number): Promise<boolean>;
  
  // Knowledge methods
  getKnowledge(competencyId: number): Promise<Knowledge[]>;
  getKnowledgeItem(id: number): Promise<Knowledge | undefined>;
  createKnowledge(knowledge: InsertKnowledge): Promise<Knowledge>;
  updateKnowledge(id: number, knowledge: Partial<InsertKnowledge>): Promise<Knowledge | undefined>;
  deleteKnowledge(id: number): Promise<boolean>;
  
  // Evaluation Criteria methods
  getEvaluationCriteria(competencyId: number): Promise<EvaluationCriteria[]>;
  getEvaluationCriteriaItem(id: number): Promise<EvaluationCriteria | undefined>;
  createEvaluationCriteria(criteria: InsertEvaluationCriteria): Promise<EvaluationCriteria>;
  updateEvaluationCriteria(id: number, criteria: Partial<InsertEvaluationCriteria>): Promise<EvaluationCriteria | undefined>;
  deleteEvaluationCriteria(id: number): Promise<boolean>;
  
  // Taxonomy methods
  getTaxonomies(teacherId?: number): Promise<Taxonomy[]>;
  getTaxonomy(id: number): Promise<Taxonomy | undefined>;
  createTaxonomy(taxonomy: InsertTaxonomy): Promise<Taxonomy>;
  updateTaxonomy(id: number, taxonomy: Partial<InsertTaxonomy>): Promise<Taxonomy | undefined>;
  deleteTaxonomy(id: number): Promise<boolean>;
  
  // Taxonomic Level methods
  getTaxonomicLevels(taxonomyId: number): Promise<TaxonomicLevel[]>;
  getTaxonomicLevel(id: number): Promise<TaxonomicLevel | undefined>;
  createTaxonomicLevel(level: InsertTaxonomicLevel): Promise<TaxonomicLevel>;
  updateTaxonomicLevel(id: number, level: Partial<InsertTaxonomicLevel>): Promise<TaxonomicLevel | undefined>;
  deleteTaxonomicLevel(id: number): Promise<boolean>;
  
  // Competency Assessment methods
  getCompetencyAssessments(params: { classId?: number, studentId?: number, competencyId?: number, teacherId?: number }): Promise<CompetencyAssessment[]>;
  getCompetencyAssessment(id: number): Promise<CompetencyAssessment | undefined>;
  createCompetencyAssessment(assessment: InsertCompetencyAssessment): Promise<CompetencyAssessment>;
  updateCompetencyAssessment(id: number, assessment: Partial<InsertCompetencyAssessment>): Promise<CompetencyAssessment | undefined>;
  deleteCompetencyAssessment(id: number): Promise<boolean>;
  
  // Sequence methods
  getSequences(teacherId: number, classId?: number): Promise<Sequence[]>;
  getSequence(id: number): Promise<Sequence | undefined>;
  createSequence(sequence: InsertSequence): Promise<Sequence>;
  updateSequence(id: number, sequence: Partial<InsertSequence>): Promise<Sequence | undefined>;
  deleteSequence(id: number): Promise<boolean>;
  
  // Resource methods
  getResources(teacherId: number, sequenceId?: number): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Event methods
  getEvents(teacherId: number, classId?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private classes: Map<number, Class>;
  private students: Map<number, Student>;
  private competencyFrameworks: Map<number, CompetencyFramework>;
  private competencies: Map<number, Competency>;
  private knowledge: Map<number, Knowledge>;
  private evaluationCriteria: Map<number, EvaluationCriteria>;
  private competencyAssessments: Map<number, CompetencyAssessment>;
  private sequences: Map<number, Sequence>;
  private resources: Map<number, Resource>;
  private events: Map<number, Event>;
  private taxonomies: Map<number, Taxonomy>;
  private taxonomicLevels: Map<number, TaxonomicLevel>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number = 1;
  private classIdCounter: number = 1;
  private studentIdCounter: number = 1;
  private frameworkIdCounter: number = 1;
  private competencyIdCounter: number = 1;
  private knowledgeIdCounter: number = 1;
  private criteriaIdCounter: number = 1;
  private assessmentIdCounter: number = 1;
  private sequenceIdCounter: number = 1;
  private resourceIdCounter: number = 1;
  private eventIdCounter: number = 1;
  private taxonomyIdCounter: number = 1;
  private taxonomicLevelIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.students = new Map();
    this.competencyFrameworks = new Map();
    this.competencies = new Map();
    this.knowledge = new Map();
    this.evaluationCriteria = new Map();
    this.competencyAssessments = new Map();
    this.sequences = new Map();
    this.resources = new Map();
    this.events = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Class methods
  async getClasses(teacherId: number): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(
      (cls) => cls.teacherId === teacherId
    );
  }

  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = this.classIdCounter++;
    const now = new Date();
    const newClass: Class = { ...classData, id, createdAt: now };
    this.classes.set(id, newClass);
    return newClass;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const existingClass = this.classes.get(id);
    if (!existingClass) return undefined;
    
    const updatedClass = { ...existingClass, ...classData };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  async deleteClass(id: number): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Student methods
  async getStudents(classId: number): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.classId === classId
    );
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const now = new Date();
    const newStudent: Student = { ...student, id, createdAt: now };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) return undefined;
    
    const updatedStudent = { ...existingStudent, ...studentData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }

  // Competency Framework methods
  async getCompetencyFrameworks(teacherId: number): Promise<CompetencyFramework[]> {
    return Array.from(this.competencyFrameworks.values()).filter(
      (framework) => framework.teacherId === teacherId
    );
  }

  async getCompetencyFramework(id: number): Promise<CompetencyFramework | undefined> {
    return this.competencyFrameworks.get(id);
  }

  async createCompetencyFramework(framework: InsertCompetencyFramework): Promise<CompetencyFramework> {
    const id = this.frameworkIdCounter++;
    const now = new Date();
    const newFramework: CompetencyFramework = { ...framework, id, createdAt: now };
    this.competencyFrameworks.set(id, newFramework);
    return newFramework;
  }

  async updateCompetencyFramework(id: number, frameworkData: Partial<InsertCompetencyFramework>): Promise<CompetencyFramework | undefined> {
    const existingFramework = this.competencyFrameworks.get(id);
    if (!existingFramework) return undefined;
    
    const updatedFramework = { ...existingFramework, ...frameworkData };
    this.competencyFrameworks.set(id, updatedFramework);
    return updatedFramework;
  }

  async deleteCompetencyFramework(id: number): Promise<boolean> {
    return this.competencyFrameworks.delete(id);
  }

  // Competency methods
  async getCompetencies(frameworkId: number): Promise<Competency[]> {
    return Array.from(this.competencies.values()).filter(
      (competency) => competency.frameworkId === frameworkId
    );
  }

  async getCompetency(id: number): Promise<Competency | undefined> {
    return this.competencies.get(id);
  }

  async createCompetency(competency: InsertCompetency): Promise<Competency> {
    const id = this.competencyIdCounter++;
    const now = new Date();
    const newCompetency: Competency = { ...competency, id, createdAt: now };
    this.competencies.set(id, newCompetency);
    return newCompetency;
  }

  async updateCompetency(id: number, competencyData: Partial<InsertCompetency>): Promise<Competency | undefined> {
    const existingCompetency = this.competencies.get(id);
    if (!existingCompetency) return undefined;
    
    const updatedCompetency = { ...existingCompetency, ...competencyData };
    this.competencies.set(id, updatedCompetency);
    return updatedCompetency;
  }

  async deleteCompetency(id: number): Promise<boolean> {
    return this.competencies.delete(id);
  }

  // Knowledge methods
  async getKnowledge(competencyId: number): Promise<Knowledge[]> {
    return Array.from(this.knowledge.values()).filter(
      (item) => item.competencyId === competencyId
    );
  }

  async getKnowledgeItem(id: number): Promise<Knowledge | undefined> {
    return this.knowledge.get(id);
  }

  async createKnowledge(knowledge: InsertKnowledge): Promise<Knowledge> {
    const id = this.knowledgeIdCounter++;
    const now = new Date();
    const newKnowledge: Knowledge = { ...knowledge, id, createdAt: now };
    this.knowledge.set(id, newKnowledge);
    return newKnowledge;
  }

  async updateKnowledge(id: number, knowledgeData: Partial<InsertKnowledge>): Promise<Knowledge | undefined> {
    const existingKnowledge = this.knowledge.get(id);
    if (!existingKnowledge) return undefined;
    
    const updatedKnowledge = { ...existingKnowledge, ...knowledgeData };
    this.knowledge.set(id, updatedKnowledge);
    return updatedKnowledge;
  }

  async deleteKnowledge(id: number): Promise<boolean> {
    return this.knowledge.delete(id);
  }

  // Evaluation Criteria methods
  async getEvaluationCriteria(competencyId: number): Promise<EvaluationCriteria[]> {
    return Array.from(this.evaluationCriteria.values()).filter(
      (criteria) => criteria.competencyId === competencyId
    );
  }

  async getEvaluationCriteriaItem(id: number): Promise<EvaluationCriteria | undefined> {
    return this.evaluationCriteria.get(id);
  }

  async createEvaluationCriteria(criteria: InsertEvaluationCriteria): Promise<EvaluationCriteria> {
    const id = this.criteriaIdCounter++;
    const now = new Date();
    const newCriteria: EvaluationCriteria = { ...criteria, id, createdAt: now };
    this.evaluationCriteria.set(id, newCriteria);
    return newCriteria;
  }

  async updateEvaluationCriteria(id: number, criteriaData: Partial<InsertEvaluationCriteria>): Promise<EvaluationCriteria | undefined> {
    const existingCriteria = this.evaluationCriteria.get(id);
    if (!existingCriteria) return undefined;
    
    const updatedCriteria = { ...existingCriteria, ...criteriaData };
    this.evaluationCriteria.set(id, updatedCriteria);
    return updatedCriteria;
  }

  async deleteEvaluationCriteria(id: number): Promise<boolean> {
    return this.evaluationCriteria.delete(id);
  }

  // Competency Assessment methods
  async getCompetencyAssessments(params: { classId?: number, studentId?: number, competencyId?: number, teacherId?: number }): Promise<CompetencyAssessment[]> {
    return Array.from(this.competencyAssessments.values()).filter(assessment => {
      if (params.classId && assessment.classId !== params.classId) return false;
      if (params.studentId && assessment.studentId !== params.studentId) return false;
      if (params.competencyId && assessment.competencyId !== params.competencyId) return false;
      if (params.teacherId && assessment.teacherId !== params.teacherId) return false;
      return true;
    });
  }

  async getCompetencyAssessment(id: number): Promise<CompetencyAssessment | undefined> {
    return this.competencyAssessments.get(id);
  }

  async createCompetencyAssessment(assessment: InsertCompetencyAssessment): Promise<CompetencyAssessment> {
    const id = this.assessmentIdCounter++;
    const newAssessment: CompetencyAssessment = { ...assessment, id };
    this.competencyAssessments.set(id, newAssessment);
    return newAssessment;
  }

  async updateCompetencyAssessment(id: number, assessmentData: Partial<InsertCompetencyAssessment>): Promise<CompetencyAssessment | undefined> {
    const existingAssessment = this.competencyAssessments.get(id);
    if (!existingAssessment) return undefined;
    
    const updatedAssessment = { ...existingAssessment, ...assessmentData };
    this.competencyAssessments.set(id, updatedAssessment);
    return updatedAssessment;
  }

  async deleteCompetencyAssessment(id: number): Promise<boolean> {
    return this.competencyAssessments.delete(id);
  }

  // Sequence methods
  async getSequences(teacherId: number, classId?: number): Promise<Sequence[]> {
    return Array.from(this.sequences.values()).filter(sequence => {
      if (sequence.teacherId !== teacherId) return false;
      if (classId && sequence.classId !== classId) return false;
      return true;
    });
  }

  async getSequence(id: number): Promise<Sequence | undefined> {
    return this.sequences.get(id);
  }

  async createSequence(sequence: InsertSequence): Promise<Sequence> {
    const id = this.sequenceIdCounter++;
    const now = new Date();
    const newSequence: Sequence = { ...sequence, id, createdAt: now };
    this.sequences.set(id, newSequence);
    return newSequence;
  }

  async updateSequence(id: number, sequenceData: Partial<InsertSequence>): Promise<Sequence | undefined> {
    const existingSequence = this.sequences.get(id);
    if (!existingSequence) return undefined;
    
    const updatedSequence = { ...existingSequence, ...sequenceData };
    this.sequences.set(id, updatedSequence);
    return updatedSequence;
  }

  async deleteSequence(id: number): Promise<boolean> {
    return this.sequences.delete(id);
  }

  // Resource methods
  async getResources(teacherId: number, sequenceId?: number): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(resource => {
      if (resource.teacherId !== teacherId) return false;
      if (sequenceId && resource.sequenceId !== sequenceId) return false;
      return true;
    });
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceIdCounter++;
    const now = new Date();
    const newResource: Resource = { ...resource, id, createdAt: now };
    this.resources.set(id, newResource);
    return newResource;
  }

  async updateResource(id: number, resourceData: Partial<InsertResource>): Promise<Resource | undefined> {
    const existingResource = this.resources.get(id);
    if (!existingResource) return undefined;
    
    const updatedResource = { ...existingResource, ...resourceData };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }

  // Event methods
  async getEvents(teacherId: number, classId?: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => {
      if (event.teacherId !== teacherId) return false;
      if (classId && event.classId !== classId) return false;
      return true;
    });
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const now = new Date();
    const newEvent: Event = { ...event, id, createdAt: now };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = { ...existingEvent, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
}

export const storage = new MemStorage();
