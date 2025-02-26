import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  subject: true,
});

// Classes (groups of students)
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  subject: text("subject").notNull(),
  studentCount: integer("student_count").notNull(),
  teacherId: integer("teacher_id").notNull(),
  nextSessionDate: timestamp("next_session_date"),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClassSchema = createInsertSchema(classes).pick({
  name: true,
  level: true,
  subject: true,
  studentCount: true,
  teacherId: true,
  nextSessionDate: true,
  progress: true,
});

// Students
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  classId: integer("class_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  firstName: true,
  lastName: true,
  classId: true,
});

// Competency Frameworks
export const competencyFrameworks = pgTable("competency_frameworks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  teacherId: integer("teacher_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompetencyFrameworkSchema = createInsertSchema(competencyFrameworks).pick({
  name: true,
  description: true,
  teacherId: true,
});

// Competencies
export const competencies = pgTable("competencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  code: text("code"), // Ex: C01, C02, etc.
  frameworkId: integer("framework_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompetencySchema = createInsertSchema(competencies).pick({
  name: true,
  description: true,
  code: true,
  frameworkId: true,
});

// Knowledge associated with competencies
export const knowledge = pgTable("knowledge", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  taxonomicLevel: integer("taxonomic_level"), // Niveau taxonomique (1, 2, 3)
  competencyId: integer("competency_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertKnowledgeSchema = createInsertSchema(knowledge).pick({
  name: true,
  taxonomicLevel: true,
  competencyId: true,
});

// Evaluation criteria for competencies
export const evaluationCriteria = pgTable("evaluation_criteria", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  competencyId: integer("competency_id").notNull(),
  type: text("type").notNull(), // 'technical' ou 'behavior'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEvaluationCriteriaSchema = createInsertSchema(evaluationCriteria).pick({
  description: true,
  competencyId: true,
  type: true,
});

// Competency Assessments
export const competencyAssessments = pgTable("competency_assessments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  competencyId: integer("competency_id").notNull(),
  score: integer("score").notNull(), // 0-100
  date: timestamp("date").defaultNow().notNull(),
  classId: integer("class_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  notes: text("notes"),
});

export const insertCompetencyAssessmentSchema = createInsertSchema(competencyAssessments).pick({
  studentId: true,
  competencyId: true,
  score: true,
  date: true,
  classId: true,
  teacherId: true,
  notes: true,
});

// Pedagogical Sequences
export const sequences = pgTable("sequences", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  classId: integer("class_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("draft").notNull(), // draft, active, completed
  competencyIds: json("competency_ids").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSequenceSchema = createInsertSchema(sequences).pick({
  title: true,
  description: true,
  classId: true,
  teacherId: true,
  startDate: true,
  endDate: true,
  status: true,
  competencyIds: true,
});

// Resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // document, link, exercise, etc.
  url: text("url"),
  content: text("content"),
  teacherId: integer("teacher_id").notNull(),
  sequenceId: integer("sequence_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  name: true,
  type: true,
  url: true,
  content: true,
  teacherId: true,
  sequenceId: true,
});

// Events/Schedule
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  classId: integer("class_id"),
  teacherId: integer("teacher_id").notNull(),
  type: text("type").notNull(), // class, assessment, meeting, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  classId: true,
  teacherId: true,
  type: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type CompetencyFramework = typeof competencyFrameworks.$inferSelect;
export type InsertCompetencyFramework = z.infer<typeof insertCompetencyFrameworkSchema>;

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = z.infer<typeof insertCompetencySchema>;

export type CompetencyAssessment = typeof competencyAssessments.$inferSelect;
export type InsertCompetencyAssessment = z.infer<typeof insertCompetencyAssessmentSchema>;

export type Sequence = typeof sequences.$inferSelect;
export type InsertSequence = z.infer<typeof insertSequenceSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Knowledge = typeof knowledge.$inferSelect;
export type InsertKnowledge = z.infer<typeof insertKnowledgeSchema>;

export type EvaluationCriteria = typeof evaluationCriteria.$inferSelect;
export type InsertEvaluationCriteria = z.infer<typeof insertEvaluationCriteriaSchema>;
