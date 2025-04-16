import { 
  type Template, type InsertTemplate, templates,
  type Image, type InsertImage, images,
  type TemplateStyle, type InsertTemplateStyle, templateStyles,
  type SvgIcon, type InsertSvgIcon, svgIcons,
  type TemplateVersion, type InsertTemplateVersion, templateVersions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplates(userId?: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;
  
  // Template Version operations
  getTemplateVersion(id: number): Promise<TemplateVersion | undefined>;
  getTemplateVersions(templateId: number): Promise<TemplateVersion[]>;
  getLatestTemplateVersion(templateId: number): Promise<TemplateVersion | undefined>;
  createTemplateVersion(version: InsertTemplateVersion): Promise<TemplateVersion>;
  
  // Image operations
  getImage(id: number): Promise<Image | undefined>;
  getImages(userId?: string): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
  deleteImage(id: number): Promise<boolean>;
  
  // Template Style operations
  getTemplateStyle(id: number): Promise<TemplateStyle | undefined>;
  getTemplateStyles(): Promise<TemplateStyle[]>;
  createTemplateStyle(style: InsertTemplateStyle): Promise<TemplateStyle>;
  
  // SVG Icon operations
  getSvgIcon(id: number): Promise<SvgIcon | undefined>;
  getSvgIcons(category?: string): Promise<SvgIcon[]>;
  createSvgIcon(icon: InsertSvgIcon): Promise<SvgIcon>;
}

export class DatabaseStorage implements IStorage {
  // Template operations
  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));
    return template;
  }

  async getTemplates(userId?: string): Promise<Template[]> {
    if (userId) {
      return db
        .select()
        .from(templates)
        .where(eq(templates.user_id, userId))
        .orderBy(desc(templates.created_at));
    }
    return db
      .select()
      .from(templates)
      .orderBy(desc(templates.created_at));
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateTemplate(id: number, templateUpdate: Partial<InsertTemplate>): Promise<Template | undefined> {
    const [template] = await db
      .update(templates)
      .set(templateUpdate)
      .where(eq(templates.id, id))
      .returning();
    return template;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(templates)
      .where(eq(templates.id, id))
      .returning({ id: templates.id });
    return result.length > 0;
  }

  // Template Version operations
  async getTemplateVersion(id: number): Promise<TemplateVersion | undefined> {
    const [version] = await db
      .select()
      .from(templateVersions)
      .where(eq(templateVersions.id, id));
    return version;
  }

  async getTemplateVersions(templateId: number): Promise<TemplateVersion[]> {
    return db
      .select()
      .from(templateVersions)
      .where(eq(templateVersions.template_id, templateId))
      .orderBy(desc(templateVersions.version_number));
  }

  async getLatestTemplateVersion(templateId: number): Promise<TemplateVersion | undefined> {
    const [version] = await db
      .select()
      .from(templateVersions)
      .where(eq(templateVersions.template_id, templateId))
      .orderBy(desc(templateVersions.version_number))
      .limit(1);
    return version;
  }

  async createTemplateVersion(insertVersion: InsertTemplateVersion): Promise<TemplateVersion> {
    // Get the next version number
    const [highestVersion] = await db
      .select({ max: sql`MAX(${templateVersions.version_number})` })
      .from(templateVersions)
      .where(eq(templateVersions.template_id, insertVersion.template_id));
    
    // Calculate next version number
    const maxVersion = highestVersion?.max ? Number(highestVersion.max) : 0;
    const nextVersionNumber = maxVersion + 1;
    
    // Insert the new version with calculated version number
    const [version] = await db
      .insert(templateVersions)
      .values({
        ...insertVersion,
        version_number: nextVersionNumber
      })
      .returning();
    
    return version;
  }

  // Image operations
  async getImage(id: number): Promise<Image | undefined> {
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, id));
    return image;
  }

  async getImages(userId?: string): Promise<Image[]> {
    if (userId) {
      return db
        .select()
        .from(images)
        .where(eq(images.user_id, userId))
        .orderBy(desc(images.uploaded_at));
    }
    return db
      .select()
      .from(images)
      .orderBy(desc(images.uploaded_at));
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values(insertImage)
      .returning();
    return image;
  }

  async deleteImage(id: number): Promise<boolean> {
    const result = await db
      .delete(images)
      .where(eq(images.id, id))
      .returning({ id: images.id });
    return result.length > 0;
  }
  
  // Template Style operations
  async getTemplateStyle(id: number): Promise<TemplateStyle | undefined> {
    const [style] = await db
      .select()
      .from(templateStyles)
      .where(eq(templateStyles.id, id));
    return style;
  }

  async getTemplateStyles(): Promise<TemplateStyle[]> {
    return db
      .select()
      .from(templateStyles)
      .orderBy(asc(templateStyles.name));
  }

  async createTemplateStyle(insertStyle: InsertTemplateStyle): Promise<TemplateStyle> {
    const [style] = await db
      .insert(templateStyles)
      .values(insertStyle)
      .returning();
    return style;
  }
  
  // SVG Icon operations
  async getSvgIcon(id: number): Promise<SvgIcon | undefined> {
    const [icon] = await db
      .select()
      .from(svgIcons)
      .where(eq(svgIcons.id, id));
    return icon;
  }

  async getSvgIcons(category?: string): Promise<SvgIcon[]> {
    if (category) {
      return db
        .select()
        .from(svgIcons)
        .where(eq(svgIcons.category, category))
        .orderBy(asc(svgIcons.name));
    }
    return db
      .select()
      .from(svgIcons)
      .orderBy(asc(svgIcons.name));
  }

  async createSvgIcon(insertIcon: InsertSvgIcon): Promise<SvgIcon> {
    const [icon] = await db
      .insert(svgIcons)
      .values(insertIcon)
      .returning();
    return icon;
  }
}

// For backwards compatibility, we keep the MemStorage class
export class MemStorage implements IStorage {
  private templatesMap: Map<number, Template>;
  private imagesMap: Map<number, Image>;
  private styleMap: Map<number, TemplateStyle>;
  private iconMap: Map<number, SvgIcon>;
  private versionMap: Map<number, TemplateVersion>;
  private templateCurrentId: number;
  private imageCurrentId: number;
  private styleCurrentId: number;
  private iconCurrentId: number;
  private versionCurrentId: number;

  constructor() {
    this.templatesMap = new Map();
    this.imagesMap = new Map();
    this.styleMap = new Map();
    this.iconMap = new Map();
    this.versionMap = new Map();
    this.templateCurrentId = 1;
    this.imageCurrentId = 1;
    this.styleCurrentId = 1;
    this.iconCurrentId = 1;
    this.versionCurrentId = 1;
  }

  // Template operations
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templatesMap.get(id);
  }

  async getTemplates(userId?: string): Promise<Template[]> {
    const allTemplates = Array.from(this.templatesMap.values());
    if (userId) {
      return allTemplates.filter(template => template.user_id === userId);
    }
    return allTemplates;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.templateCurrentId++;
    const template: Template = { 
      ...insertTemplate, 
      id,
      user_id: insertTemplate.user_id || null,
      style_id: insertTemplate.style_id || null,
      description: insertTemplate.description || null,
      created_at: new Date()
    };
    this.templatesMap.set(id, template);
    return template;
  }

  async updateTemplate(id: number, templateUpdate: Partial<InsertTemplate>): Promise<Template | undefined> {
    const existingTemplate = this.templatesMap.get(id);
    if (!existingTemplate) {
      return undefined;
    }
    
    const updatedTemplate = { ...existingTemplate, ...templateUpdate };
    this.templatesMap.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templatesMap.delete(id);
  }
  
  // Template Version operations
  async getTemplateVersion(id: number): Promise<TemplateVersion | undefined> {
    return this.versionMap.get(id);
  }

  async getTemplateVersions(templateId: number): Promise<TemplateVersion[]> {
    const allVersions = Array.from(this.versionMap.values());
    return allVersions
      .filter(version => version.template_id === templateId)
      .sort((a, b) => b.version_number - a.version_number);
  }

  async getLatestTemplateVersion(templateId: number): Promise<TemplateVersion | undefined> {
    const versions = await this.getTemplateVersions(templateId);
    return versions.length > 0 ? versions[0] : undefined;
  }

  async createTemplateVersion(insertVersion: InsertTemplateVersion): Promise<TemplateVersion> {
    const id = this.versionCurrentId++;
    
    // Get highest version number for this template
    const versions = await this.getTemplateVersions(insertVersion.template_id);
    const nextVersionNumber = versions.length > 0 
      ? Math.max(...versions.map(v => v.version_number)) + 1 
      : 1;
    
    const version: TemplateVersion = {
      ...insertVersion,
      id,
      version_number: nextVersionNumber,
      description: insertVersion.description || null,
      user_id: insertVersion.user_id || null,
      version_type: insertVersion.version_type || "update",
      created_at: new Date(),
    };
    
    this.versionMap.set(id, version);
    return version;
  }

  // Image operations
  async getImage(id: number): Promise<Image | undefined> {
    return this.imagesMap.get(id);
  }

  async getImages(userId?: string): Promise<Image[]> {
    const allImages = Array.from(this.imagesMap.values());
    if (userId) {
      return allImages.filter(image => image.user_id === userId);
    }
    return allImages;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageCurrentId++;
    const image: Image = { 
      ...insertImage, 
      id, 
      user_id: insertImage.user_id || null,
      uploaded_at: new Date()
    };
    this.imagesMap.set(id, image);
    return image;
  }

  async deleteImage(id: number): Promise<boolean> {
    return this.imagesMap.delete(id);
  }
  
  // Template Style operations
  async getTemplateStyle(id: number): Promise<TemplateStyle | undefined> {
    return this.styleMap.get(id);
  }

  async getTemplateStyles(): Promise<TemplateStyle[]> {
    return Array.from(this.styleMap.values());
  }

  async createTemplateStyle(insertStyle: InsertTemplateStyle): Promise<TemplateStyle> {
    const id = this.styleCurrentId++;
    const style = { ...insertStyle, id } as TemplateStyle;
    this.styleMap.set(id, style);
    return style;
  }
  
  // SVG Icon operations
  async getSvgIcon(id: number): Promise<SvgIcon | undefined> {
    return this.iconMap.get(id);
  }

  async getSvgIcons(category?: string): Promise<SvgIcon[]> {
    const allIcons = Array.from(this.iconMap.values());
    if (category) {
      return allIcons.filter(icon => icon.category === category);
    }
    return allIcons;
  }

  async createSvgIcon(insertIcon: InsertSvgIcon): Promise<SvgIcon> {
    const id = this.iconCurrentId++;
    const icon = { ...insertIcon, id } as SvgIcon;
    this.iconMap.set(id, icon);
    return icon;
  }
}

// Switch to database storage
export const storage = new DatabaseStorage();
