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

export type DingteeRelationshipItem = {
  item_id: number;
  item_code: string;
  item_name: string;
  item_slug: string;
  item_image?: string | null;
  item_price?: number | null;
  rel_type: string;
};

function normalizeItemSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function getRelationshipItemsBySlug(slug: string): Promise<DingteeRelationshipItem[]> {
  const normalizedSlug = normalizeItemSlug(slug);
  const [rows] = await pool.query(
    `SELECT
       i.id AS item_id,
       i.item_code,
       i.item_name,
       COALESCE(NULLIF(TRIM(i.item_slug), ''), NULLIF(TRIM(i.slug), ''), NULLIF(TRIM(i.url_slug), ''), NULLIF(TRIM(i.item_code), '')) AS item_slug,
       i.item_image,
       i.item_price,
       ir.rel_type
     FROM itemrelationship ir
     INNER JOIN items i ON i.id = ir.related_item_id
     WHERE ir.rel_type = 'MKT_RELATED'
       AND (
         LOWER(TRIM(ir.item_slug)) = ?
         OR LOWER(TRIM(ir.item_code)) = ?
         OR LOWER(TRIM(ir.item_name)) = ?
       )
     ORDER BY ir.id DESC`,
    [normalizedSlug, normalizedSlug, normalizedSlug]
  );

  const rs: any = rows as any;
  return rs.map((row: any) => ({
    ...row,
    item_slug: normalizeItemSlug(String(row.item_slug ?? row.item_code ?? '')),
  })) as DingteeRelationshipItem[];
}

export default pool;
