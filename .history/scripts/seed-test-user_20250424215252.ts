import { db } from '../server/db';
import { users } from '../shared/schema';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const username = 'testuser';
  const email = 'testuser@example.com';
  const password = 'password123';
  const role = 'user';
  const is_verified = true;

  // Check if user already exists
  const existing = await db.select().from(users).where(users.username.eq(username));
  if (existing.length > 0) {
    console.log('Test user already exists.');
    process.exit(0);
  }

  const hashedPassword = await hashPassword(password);
  await db.insert(users).values({
    username,
    email,
    password: hashedPassword,
    role,
    is_verified,
  });
  console.log('Test user created:', username);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error seeding test user:', err);
  process.exit(1);
});