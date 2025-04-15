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
import { setupAuth } from "./auth";
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
  // Set up authentication
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // API routes
  // Get all templates (filtered by access control)
  app.get("/api/templates", async (req: Request, res: Response) => {
    try {
      let userId: string | undefined;
      
      // If a specific user's templates were requested in the query
      const requestedUserId = req.query.userId as string | undefined;
      
      if (requestedUserId) {
        // If specific user's templates were requested, use that ID
        userId = requestedUserId;
      } else if (req.isAuthenticated()) {
        // Otherwise, if user is authenticated, get their templates
        userId = (req.user as Express.User).id.toString();
      }
      
      // Get templates - showing only public templates or those owned by the requested/authenticated user
      const templates = await storage.getTemplates(userId);
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get template by ID (with access control)
  app.get("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // If template has an owner (user_id is not null), check if the current user is the owner
      if (template.user_id !== null && (!req.isAuthenticated() || template.user_id !== (req.user as Express.User).id)) {
        // For non-public templates, verify the user has access
        return res.status(403).json({ message: "You don't have permission to access this template" });
      }
      
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create template (requires authentication)
  app.post("/api/templates", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Add the authenticated user's ID to the template data
      const userId = (req.user as Express.User).id;
      const templateData = insertTemplateSchema.parse({
        ...req.body,
        user_id: userId,
      });
      
      const newTemplate = await storage.createTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update template (requires authentication and ownership)
  app.put("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      
      // Get the template to check ownership
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the authenticated user
      const userId = (req.user as Express.User).id;
      if (template.user_id !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this template" });
      }
      
      const templateData = req.body;
      const updatedTemplate = await storage.updateTemplate(id, templateData);
      
      res.json(updatedTemplate);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete template (requires authentication and ownership)
  app.delete("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      
      // Get the template to check ownership
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Check if the template belongs to the authenticated user
      const userId = (req.user as Express.User).id;
      if (template.user_id !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this template" });
      }
      
      const success = await storage.deleteTemplate(id);
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

  // Upload image (requires authentication)
  app.post("/api/upload/image", upload.single("file"), async (req: MulterRequest, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get the authenticated user's ID
      const userId = (req.user as Express.User).id;
      const serverUrl = `${req.protocol}://${req.get("host")}`;
      const relativePath = `/uploads/${req.file.filename}`;
      const imageUrl = `${serverUrl}${relativePath}`;
      
      // Create a Date object for upload timestamp
      const uploadDate = new Date();
      
      // Save image to database with proper typing
      const imageData = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        url: imageUrl,
        user_id: userId
        // uploadedAt will be set to now() by the database
      };
      
      console.log("Saving image with data:", imageData);
      const newImage = await storage.createImage(imageData);
      res.status(201).json(newImage);
    } catch (error: any) {
      console.error("Image upload error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get all images (filtered by access control)
  app.get("/api/images", async (req: Request, res: Response) => {
    try {
      let userId: string | undefined;
      
      // If a specific user's images were requested in the query
      const requestedUserId = req.query.userId as string | undefined;
      
      if (requestedUserId) {
        // If specific user's images were requested, use that ID
        userId = requestedUserId;
      } else if (req.isAuthenticated()) {
        // Otherwise, if user is authenticated, get their images
        userId = (req.user as Express.User).id.toString();
      }
      
      // Get images - showing only those owned by the requested/authenticated user
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

  // Create template style (requires authentication)
  app.post("/api/template-styles", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const styleData = insertTemplateStyleSchema.parse(req.body);
      
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

  // Create SVG icon (requires authentication)
  app.post("/api/svg-icons", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const iconData = insertSvgIconSchema.parse(req.body);
      
      const newIcon = await storage.createSvgIcon(iconData);
      res.status(201).json(newIcon);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI TEMPLATE SUGGESTIONS API ROUTE
  // Get AI-powered template suggestions based on company name, description and logo
  app.post("/api/suggest-template", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { companyName, description, logoUrl } = req.body;
      
      if (!companyName) {
        return res.status(400).json({ message: "Company name is required" });
      }
      
      // Import the AI analysis function
      const { analyzeTemplateText } = await import("./openai");
      
      // Get AI suggestions
      const result = await analyzeTemplateText(companyName, description, logoUrl);
      
      res.json(result);
    } catch (error: any) {
      console.error("Template suggestion error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // TEMPLATE GENERATION API ROUTE
  // Generate a new template based on provided data and style (requires authentication)
  app.post("/api/generate-template", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Validate the incoming template data
      const templateData = templateDataSchema.parse(req.body);
      
      // If a template style ID is provided, fetch that style
      let style = null;
      if (templateData.template_style_id) {
        style = await storage.getTemplateStyle(templateData.template_style_id);
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
      
      // Create the template in the database with the authenticated user's ID
      const templateName = templateData.title || "Generated Template";
      const userId = (req.user as Express.User).id;
      
      const newTemplate = await storage.createTemplate({
        name: templateName,
        html: generatedHtml,
        user_id: userId,
        style_id: templateData.template_style_id
        // Don't set created_at - it will be automatically set to now() by the database
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
