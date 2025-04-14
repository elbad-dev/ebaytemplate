import { pgTable, text, serial, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for template style categorization
export const templateTypeEnum = pgEnum("template_type", ["product", "service", "portfolio", "company"]);
export const templateStyleEnum = pgEnum("template_style", ["modern", "classic", "minimalist", "bold", "elegant"]);
export const templateColorSchemeEnum = pgEnum("color_scheme", ["light", "dark", "colorful", "monochrome", "custom"]);

// Template model
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  html: text("html").notNull(),
  userId: text("user_id"),
  createdAt: text("created_at").notNull(),
  // New field to reference the style used
  styleId: integer("style_id"),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  html: true,
  userId: true,
  createdAt: true,
  styleId: true,
});

// New table for template styles/designs
export const templateStyles = pgTable("template_styles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail").notNull(), // URL to preview image
  type: templateTypeEnum("type").notNull(),
  style: templateStyleEnum("style").notNull(),
  colorScheme: templateColorSchemeEnum("color_scheme").notNull(),
  htmlStructure: text("html_structure").notNull(), // Base HTML with placeholders
  cssStyles: text("css_styles").notNull(), // CSS for this template style
  jsInteractions: text("js_interactions"), // Optional JavaScript for interactive elements
  createdAt: text("created_at").notNull(),
});

export const insertTemplateStyleSchema = createInsertSchema(templateStyles).pick({
  name: true,
  description: true,
  thumbnail: true,
  type: true,
  style: true,
  colorScheme: true,
  htmlStructure: true, 
  cssStyles: true,
  jsInteractions: true,
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

// Definitions for SVG icons library
export const svgIcons = pgTable("svg_icons", {
  id: serial("id").primaryKey(), 
  name: text("name").notNull(),
  category: text("category").notNull(), // Like "business", "tech", "commerce", etc.
  svg: text("svg").notNull(), // SVG content
  tags: text("tags").array(), // Array of search tags
  createdAt: text("created_at").notNull(),
});

export const insertSvgIconSchema = createInsertSchema(svgIcons).pick({
  name: true,
  category: true,
  svg: true,
  tags: true,
  createdAt: true,
});

// Type exports
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertTemplateStyle = z.infer<typeof insertTemplateStyleSchema>;
export type TemplateStyle = typeof templateStyles.$inferSelect;
export type InsertSvgIcon = z.infer<typeof insertSvgIconSchema>;
export type SvgIcon = typeof svgIcons.$inferSelect;

// Custom types for the editor components
export const templateDataSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
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
  })),
  rawHtml: z.string().optional(),
  // New fields for template generation and customization
  templateStyleId: z.number().optional(), // ID of the template style to use
  colorPrimary: z.string().optional(), // Primary brand color
  colorSecondary: z.string().optional(), // Secondary brand color
  colorAccent: z.string().optional(), // Accent color
  colorBackground: z.string().optional(), // Background color
  colorText: z.string().optional(), // Text color
  fontHeading: z.string().optional(), // Font for headings
  fontBody: z.string().optional(), // Font for body text
  layout: z.string().optional(), // Layout style (centered, split, etc.)
});

export type TemplateData = z.infer<typeof templateDataSchema>;

// Editor section props interface
export interface EditorSectionProps {
  data: TemplateData;
  onUpdate: (updatedData: Partial<TemplateData>) => void;
}

// Preview mode type
export type PreviewMode = "desktop" | "tablet" | "mobile";
