import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Template model
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  html: text("html").notNull(),
  userId: text("user_id"),
  createdAt: text("created_at").notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  html: true,
  userId: true,
  createdAt: true,
});

// Image upload model
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  url: text("url").notNull(),
  userId: text("user_id"),
  uploadedAt: text("uploaded_at").notNull(),
});

export const insertImageSchema = createInsertSchema(images).pick({
  fileName: true,
  fileType: true,
  fileSize: true,
  url: true,
  userId: true,
  uploadedAt: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

// Custom types for the editor components
export const templateDataSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string()
  })),
  specs: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.string()
  })),
  companyInfo: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    svg: z.string()
  }))
});

export type TemplateData = z.infer<typeof templateDataSchema>;
