import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertTemplateSchema, insertImageSchema } from "@shared/schema";
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

  return httpServer;
}
