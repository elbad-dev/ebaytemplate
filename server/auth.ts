import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db, pool } from "./db";
import { users, User } from "@shared/schema";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      role: string;
      is_verified?: boolean;
      isVerified?: boolean;
      created_at?: Date;
      updated_at?: Date;
      createdAt?: Date;
      updatedAt?: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Hash password with salt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a supplied password with a stored hash+salt
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Create session store
export function getSessionStore() {
  return new PostgresSessionStore({
    pool: pool,
    createTableIfMissing: true,
  });
}

// Set up authentication
export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "template-editor-secret-key", // Better to use env var in production
    resave: false,
    saveUninitialized: false,
    store: getSessionStore(),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: "lax",
      path: "/",
      domain: undefined // Allow cookies to work on localhost
    },
  };

  // Set up session and passport
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          // Find user by username
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username));
          
          if (!user) {
            return done(null, false, { message: "Incorrect username or password" });
          }
          
          // Verify password
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            return done(null, false, { message: "Incorrect username or password" });
          }
          
          // Convert to camelCase for frontend compatibility
          const userWithCamelCase = {
            ...user,
            isVerified: user.is_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          };
          
          // Remove password before returning
          const { password: _, ...userWithoutPassword } = userWithCamelCase;
          
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          is_verified: users.is_verified,
          created_at: users.created_at,
          updated_at: users.updated_at,
        })
        .from(users)
        .where(eq(users.id, id));
      
      if (user) {
        // Convert snake_case to camelCase for frontend compatibility
        const userWithCamelCase = {
          ...user,
          isVerified: user.is_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        };
        done(null, userWithCamelCase);
      } else {
        done(null, undefined);
      }
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error);
    }
  });

  // Authentication routes
  
  // Register new user
  app.post("/api/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const [user] = await db.insert(users).values({
        username,
        email,
        password: hashedPassword,
        role: "user",
        is_verified: true, // Auto-verify since we're skipping email verification
      }).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        is_verified: users.is_verified,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });
      
      // Convert to camelCase for frontend
      const userWithCamelCase = {
        ...user,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
      
      // Log user in
      req.login(userWithCamelCase, (err) => {
        if (err) return next(err);
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json(userWithCamelCase);
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: Error, user: Express.User, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message || "Login failed" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) return next(err);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Ensure we're returning a valid JSON object
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(req.user);
  });

  // Middleware to check if user is authenticated
  app.use("/api/protected", (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Authentication required" });
  });
}