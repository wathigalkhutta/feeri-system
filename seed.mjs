/**
 * Seed script - creates demo users with hashed passwords
 * Run: node seed.mjs
 */
import { createConnection } from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

// Parse DATABASE_URL: mysql://user:password@host:port/dbname
const url = new URL(DATABASE_URL);
const connection = await createConnection({
  host: url.hostname,
  port: parseInt(url.port || "3306"),
  user: url.username,
  password: url.password,
  database: url.pathname.replace("/", ""),
  ssl: false,
});

console.log("✅ Connected to database");

const demoUsers = [
  {
    name: "Sabri Garza ",
    email: "owner@feeri.com",
    password: "owner123",
    role: "owner",
  },
  {
    name: "المدير",
    email: "manager@feeri.com",
    password: "manager123",
    role: "manager",
  },
  {
    name: "الموظف",
    email: "employee@feeri.com",
    password: "employee123",
    role: "employee",
  },
];

for (const u of demoUsers) {
  // Check if user already exists
  const [rows] = await connection.execute(
    "SELECT id FROM users WHERE email = ?",
    [u.email]
  );

  if (rows.length > 0) {
    console.log(`⚠️  User already exists: ${u.email} — skipping`);
    continue;
  }

  const passwordHash = await bcrypt.hash(u.password, 12);
  await connection.execute(
    `INSERT INTO users (name, email, passwordHash, loginMethod, role, lastSignedIn, createdAt, updatedAt)
     VALUES (?, ?, ?, 'local', ?, NOW(), NOW(), NOW())`,
    [u.name, u.email, passwordHash, u.role]
  );
  console.log(`✅ Created user: ${u.email} (${u.role})`);
}

await connection.end();
console.log("\n🎉 Seed complete! Demo credentials:");
console.log("   owner@feeri.com    / owner123");
console.log("   manager@feeri.com  / manager123");
console.log("   employee@feeri.com / employee123");
