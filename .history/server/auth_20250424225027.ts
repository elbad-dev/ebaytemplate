import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import * as session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db, pool } from "./db";
import { users, User } from "@shared/schema";
import { eq } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";

const PostgresSessionStore = connectPgSimple(session);

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
  try {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

// Compare a supplied password with a stored hash+salt
async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format");
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

// Create session store
export function getSessionStore() {
  return new PostgresSessionStore({
    pool: pool,
    createTableIfMissing: true,
    tableName: 'session',
    schemaName: 'public',
  });
}

// Create test user function
export async function createTestUser() {
  try {
    console.log("Starting test user creation...");
    
    // Check if test user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, "testuser"));
    
    if (!existingUser) {
      console.log("Test user not found, creating new test user...");
      const hashedPassword = await hashPassword("password123");
      console.log("Password hashed successfully");
      
      const [user] = await db.insert(users).values({
        username: "testuser",
        email: "testuser@test.com",
        password: hashedPassword,
        role: "user",
        is_verified: true,
      }).returning();
      
      console.log("Test user created successfully:", user.username);
      return user;
    } else {
      console.log("Test user already exists");
      return existingUser;
    }
  } catch (error) {
    console.error("Error in createTestUser:", error);
    throw error;
  }
}

// Set up authentication
export function setupAuth(app: Express) {
  // Create test user
  createTestUser();

  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "template-editor-secret-key",
    resave: true,
    saveUninitialized: true,
    store: getSessionStore(),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // Set to false for all environments to fix cookie issues
      sameSite: "lax",
      path: "/",
      domain: undefined, // Allow cookies on localhost
    },
    name: 'connect.sid', // Use default session cookie name
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
        passReqToCallback: true,
      },
      async (req: Request, username: string, password: string, done: any) => {
        try {
          console.log("Authenticating user:", username);
          
          // Find user by username
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username));
          
          if (!user) {
            console.log("User not found:", username);
            return done(null, false, { message: "Incorrect username or password" });
          }
          
          // Verify password
          const passwordMatch = await comparePasswords(password, user.password);
          if (!passwordMatch) {
            console.log("Invalid password for user:", username);
            return done(null, false, { message: "Incorrect username or password" });
          }
          
          console.log("Authentication successful for user:", username);
          
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
          console.error("Authentication error:", error);
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

  // Login route with enhanced error handling
  app.post("/api/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Login attempt received for user:", req.body.username);

      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      passport.authenticate("local", (err: Error, user: Express.User, info: any) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (!user) {
          console.log("Login failed for user:", req.body.username);
          return res.status(401).json({ message: info?.message || "Login failed" });
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Session creation error:", loginErr);
            return res.status(500).json({ message: "Failed to create session" });
          }

          console.log("Login successful for user:", user.username);
          res.setHeader("Content-Type", "application/json");
          return res.status(200).json(user);
        });
      })(req, res, next);
    } catch (error) {
      console.error("Unexpected error in login route:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
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