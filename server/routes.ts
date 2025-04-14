import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertTemplateSchema, 
  insertImageSchema, 
  insertTemplateStyleSchema,
  insertSvgIconSchema,
  templateDataSchema
} from "@shared/schema";
import { nanoid } from "nanoid";

// Add type for request with file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniquePrefix = nanoid(8);
      cb(null, `${uniquePrefix}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept HTML and image files
    if (
      file.mimetype === "text/html" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only HTML and images are allowed."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // API routes
  // Get all templates
  app.get("/api/templates", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const templates = await storage.getTemplates(userId);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get template by ID
  app.get("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create template
  app.post("/api/templates", async (req: Request, res: Response) => {
    try {
      const templateData = insertTemplateSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString(),
      });
      
      const newTemplate = await storage.createTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update template
  app.put("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const templateData = req.body;
      
      const updatedTemplate = await storage.updateTemplate(id, templateData);
      
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete template
  app.delete("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTemplate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload HTML file
  app.post("/api/upload/html", upload.single("file"), async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Read the HTML content
      const filePath = req.file.path;
      const htmlContent = fs.readFileSync(filePath, "utf-8");
      
      // Clean up the file after reading
      fs.unlinkSync(filePath);
      
      res.json({
        filename: req.file.originalname,
        content: htmlContent
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upload image
  app.post("/api/upload/image", upload.single("file"), async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Generate URL for the image
      const userId = req.body.userId || null;
      const serverUrl = `${req.protocol}://${req.get("host")}`;
      const relativePath = `/uploads/${req.file.filename}`;
      const imageUrl = `${serverUrl}${relativePath}`;
      
      // Save image to database
      const imageData = insertImageSchema.parse({
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        url: imageUrl,
        userId,
        uploadedAt: new Date().toISOString()
      });
      
      const newImage = await storage.createImage(imageData);
      res.status(201).json({ ...newImage });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all images
  app.get("/api/images", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const images = await storage.getImages(userId);
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // TEMPLATE STYLES API ROUTES
  // Get all template styles
  app.get("/api/template-styles", async (req: Request, res: Response) => {
    try {
      const styles = await storage.getTemplateStyles();
      res.json(styles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get template style by ID
  app.get("/api/template-styles/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const style = await storage.getTemplateStyle(id);
      
      if (!style) {
        return res.status(404).json({ message: "Template style not found" });
      }
      
      res.json(style);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create template style
  app.post("/api/template-styles", async (req: Request, res: Response) => {
    try {
      const styleData = insertTemplateStyleSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString(),
      });
      
      const newStyle = await storage.createTemplateStyle(styleData);
      res.status(201).json(newStyle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // SVG ICONS API ROUTES
  // Get all SVG icons, optionally filtered by category
  app.get("/api/svg-icons", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const icons = await storage.getSvgIcons(category);
      res.json(icons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get SVG icon by ID
  app.get("/api/svg-icons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const icon = await storage.getSvgIcon(id);
      
      if (!icon) {
        return res.status(404).json({ message: "SVG icon not found" });
      }
      
      res.json(icon);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create SVG icon
  app.post("/api/svg-icons", async (req: Request, res: Response) => {
    try {
      const iconData = insertSvgIconSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString(),
      });
      
      const newIcon = await storage.createSvgIcon(iconData);
      res.status(201).json(newIcon);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // TEMPLATE GENERATION API ROUTE
  // Generate a new template based on provided data and style
  app.post("/api/generate-template", async (req: Request, res: Response) => {
    try {
      // Validate the incoming template data
      const templateData = templateDataSchema.parse(req.body);
      
      // If a template style ID is provided, fetch that style
      let style = null;
      if (templateData.templateStyleId) {
        style = await storage.getTemplateStyle(templateData.templateStyleId);
        if (!style) {
          return res.status(404).json({ message: "Template style not found" });
        }
      }
      
      // Import the template generator functions
      const { generateStyledTemplate, generateDefaultTemplate } = await import("../client/src/utils/templateStyleGenerator");
      
      // Generate the HTML template
      let generatedHtml = '';
      
      if (style) {
        // Use the template style generator with the selected style
        generatedHtml = generateStyledTemplate(templateData, style);
      } else {
        // Use the default template generator
        generatedHtml = generateDefaultTemplate(templateData);
      }
      
      // Create the template in the database
      const templateName = templateData.title || "Generated Template";
      const userId = req.body.userId || null;
      
      const newTemplate = await storage.createTemplate({
        name: templateName,
        html: generatedHtml,
        userId,
        createdAt: new Date().toISOString(),
        styleId: templateData.templateStyleId || null
      });
      
      // Return both the template record and the generated HTML
      res.status(201).json({
        template: newTemplate,
        html: generatedHtml
      });
    } catch (error: any) {
      console.error("Template generation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
