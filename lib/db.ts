import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const pool = mysql.createPool({
  host: process.env.DINGTEE_DB_HOST || '127.0.0.1',
  port: Number(process.env.DINGTEE_DB_PORT || 3306),
  user: process.env.DINGTEE_DB_USER || 'root',
  password: process.env.DINGTEE_DB_PASS || '',
  database: process.env.DINGTEE_DB_NAME || 'dingtee',
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4',
});

export type DingteeUser = {
  id: number;
  email: string;
  name: string;
  password: string;
  created_at: string;
};

export async function findUserByEmail(email: string): Promise<DingteeUser | null> {
  const [rows] = await pool.query('SELECT id,email,name,password,created_at FROM dingtee_users WHERE email = ? LIMIT 1', [email]);
  const rs: any = rows as any;
  if (rs.length === 0) return null;
  return rs[0] as DingteeUser;
}

export async function createUser(email: string, name: string, passwordPlain: string): Promise<number> {
  const hash = await bcrypt.hash(passwordPlain, 10);
  const [res] = await pool.query('INSERT INTO dingtee_users (email,name,password) VALUES (?,?,?)', [email, name, hash]);
  // @ts-ignore
  return (res as any).insertId as number;
}

export async function verifyUserPassword(email: string, passwordPlain: string): Promise<DingteeUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(passwordPlain, user.password);
  return ok ? user : null;
}

export default pool;
