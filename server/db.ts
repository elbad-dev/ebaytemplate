import dotenv from "dotenv";
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

export const pool = new Pool({ 
  host: 'localhost',
  port: 5432,
  database: 'ebay_templates',
  user: 'postgres', 
  password: 'sa',
  ssl: false
});

// Test the database connection
pool.connect()
  .then(client => {
    console.log("Successfully connected to database");
    client.release();
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });

export const db = drizzle(pool, { schema });