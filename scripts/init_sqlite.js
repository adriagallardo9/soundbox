// Script per inicialitzar la base de dades SQLite (soundbox.db)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const schemaPath = path.join(rootDir, 'docs', 'bd', 'schema_sqlite.sql');
const dbPath = path.join(rootDir, 'soundbox.db');
const docsDbPath = path.join(rootDir, 'docs', 'bd', 'soundbox.db');

console.log('🔄 Inicialitzant base de dades SQLite SoundBoxd...');

if (!fs.existsSync(schemaPath)) {
  console.error(`❌ No s'ha trobat el fitxer d'esquema a ${schemaPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, 'utf8');

// Eliminar fitxer antic si es vol reiniciar de zero
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

// Crear connexió i executar DDL + Seed
const db = new DatabaseSync(dbPath);
db.exec(sql);

console.log('✅ Base de dades creada a:', dbPath);

// Comprovació de dades inserides
const tables = ['users', 'albums', 'reviews', 'playlists', 'playlist_albums', 'listenlist'];
console.log('\n📊 Taules i registres inicials:');
for (const table of tables) {
  const countRow = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
  console.log(` - ${table.padEnd(16)}: ${countRow.count} registres`);
}

// Copiar també a docs/bd/ per a documentació
fs.copyFileSync(dbPath, docsDbPath);
console.log('\n📁 Còpia sincronitzada a docs/bd/soundbox.db');
console.log('🎉 Inicialització completada amb èxit!');
db.close();
