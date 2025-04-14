import { 
  type Template, type InsertTemplate, templates,
  type Image, type InsertImage, images
} from "@shared/schema";

export interface IStorage {
  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplates(userId?: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;
  
  // Image operations
  getImage(id: number): Promise<Image | undefined>;
  getImages(userId?: string): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
  deleteImage(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private templatesMap: Map<number, Template>;
  private imagesMap: Map<number, Image>;
  private templateCurrentId: number;
  private imageCurrentId: number;

  constructor() {
    this.templatesMap = new Map();
    this.imagesMap = new Map();
    this.templateCurrentId = 1;
    this.imageCurrentId = 1;
  }

  // Template operations
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templatesMap.get(id);
  }

  async getTemplates(userId?: string): Promise<Template[]> {
    const allTemplates = Array.from(this.templatesMap.values());
    if (userId) {
      return allTemplates.filter(template => template.userId === userId);
    }
    return allTemplates;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.templateCurrentId++;
    const template: Template = { 
      ...insertTemplate, 
      id,
      userId: insertTemplate.userId || null 
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

  // Image operations
  async getImage(id: number): Promise<Image | undefined> {
    return this.imagesMap.get(id);
  }

  async getImages(userId?: string): Promise<Image[]> {
    const allImages = Array.from(this.imagesMap.values());
    if (userId) {
      return allImages.filter(image => image.userId === userId);
    }
    return allImages;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageCurrentId++;
    const image: Image = { 
      ...insertImage, 
      id, 
      userId: insertImage.userId || null 
    };
    this.imagesMap.set(id, image);
    return image;
  }

  async deleteImage(id: number): Promise<boolean> {
    return this.imagesMap.delete(id);
  }
}

export const storage = new MemStorage();
