import { pgTable, pgEnum, text, serial, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const templateTypeEnum = pgEnum("template_type", ["product", "service", "portfolio", "company"]);
export const templateStyleEnum = pgEnum("template_style", ["modern", "classic", "minimalist", "bold", "elegant"]);
export const templateColorSchemeEnum = pgEnum("color_scheme", ["light", "dark", "colorful", "monochrome", "custom"]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Templates table
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  style_id: integer("style_id"),
  user_id: text("user_id"), // Changed to text to match database
  html: text("html").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Template styles table
export const templateStyles = pgTable("template_styles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  thumbnail: varchar("thumbnail", { length: 255 }),
  type: templateTypeEnum("type").default("product").notNull(),
  style: templateStyleEnum("style").default("modern").notNull(),
  color_scheme: templateColorSchemeEnum("color_scheme").default("light").notNull(),
  html_structure: text("html_structure").notNull(),
  css_styles: text("css_styles"),
  js_interactions: text("js_interactions"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Images table
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: integer("file_size").notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  user_id: text("user_id"), // Changed to text to match database
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
});

// SVG icons table
export const svgIcons = pgTable("svg_icons", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).default("general").notNull(),
  svg: text("svg").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Verification tokens table
export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  isVerified: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  description: true,
  html: true,
  user_id: true,
  style_id: true,
});

export const insertTemplateStyleSchema = createInsertSchema(templateStyles).pick({
  name: true,
  description: true,
  thumbnail: true,
  type: true,
  style: true,
  color_scheme: true,
  html_structure: true,
  css_styles: true,
  js_interactions: true,
});

export const insertImageSchema = createInsertSchema(images).pick({
  fileName: true,
  fileType: true,
  fileSize: true,
  url: true,
  user_id: true,
  uploaded_at: true,
});

export const insertSvgIconSchema = createInsertSchema(svgIcons).pick({
  name: true,
  category: true,
  svg: true,
});

export const insertVerificationTokenSchema = createInsertSchema(verificationTokens).pick({
  user_id: true,
  token: true,
  expires: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
export type InsertTemplateStyle = z.infer<typeof insertTemplateStyleSchema>;
export type TemplateStyle = typeof templateStyles.$inferSelect;
export type InsertSvgIcon = z.infer<typeof insertSvgIconSchema>;
export type SvgIcon = typeof svgIcons.$inferSelect;
export type InsertVerificationToken = z.infer<typeof insertVerificationTokenSchema>;
export type VerificationToken = typeof verificationTokens.$inferSelect;

// Template data schema (used in the frontend)
export const templateDataSchema = z.object({
  title: z.string(),
  company_name: z.string().optional(),
  subtitle: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
    })
  ),
  specs: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.string(),
    })
  ),
  companyInfo: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      svg: z.string(),
    })
  ),
  // Color scheme properties
  color_primary: z.string().optional(),
  color_secondary: z.string().optional(),
  color_accent: z.string().optional(),
  color_background: z.string().optional(),
  color_text: z.string().optional(),
  // Font properties
  font_heading: z.string().optional(),
  font_body: z.string().optional(),
  // Template style ID for the selected style
  template_style_id: z.number().optional(),
  // Raw HTML content
  rawHtml: z.string().optional(),
});

export type TemplateData = z.infer<typeof templateDataSchema>;

// UI component props types
export interface EditorSectionProps {
  data: TemplateData;
  onUpdate: (updatedData: Partial<TemplateData>) => void;
}

export type PreviewMode = "desktop" | "tablet" | "mobile";