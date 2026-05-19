const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  });

  const dbName = process.env.DB_NAME || 'agil_db';
  await conn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`✓ Database '${dbName}' created (or already exists).`);
  await conn.end();
}

main().catch(err => {
  console.error('Failed:', err.message);
  console.error('→ Check DB_USER and DB_PASS in your .env file');
  process.exit(1);
});
