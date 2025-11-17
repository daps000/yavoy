// Database setup and initialization
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open database file
const dbPath = path.join(__dirname, 'vavoy.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready');
    }
  });

  // Create rides table (updated schema with geolocation, removed precio)
  db.run(`
    CREATE TABLE IF NOT EXISTS rides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      origen TEXT NOT NULL,
      destino TEXT NOT NULL,
      lat_origen REAL,
      lng_origen REAL,
      lat_destino REAL,
      lng_destino REAL,
      fecha_salida DATETIME NOT NULL,
      plazas_disponibles INTEGER NOT NULL,
      notas TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating rides table:', err.message);
    } else {
      console.log('Rides table ready');
      migrateDatabase();
    }
  });
}

// Migrate existing database to add geolocation columns and remove precio
function migrateDatabase() {
  // Check if lat_origen column exists
  db.all("PRAGMA table_info(rides)", (err, columns) => {
    if (err) {
      console.error('Error checking table schema:', err.message);
      return;
    }

    const hasLatOrigen = columns.some(col => col.name === 'lat_origen');
    const hasPrecio = columns.some(col => col.name === 'precio');

    // Add geolocation columns if they don't exist
    if (!hasLatOrigen) {
      db.run('ALTER TABLE rides ADD COLUMN lat_origen REAL', (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('Error adding lat_origen:', err.message);
        } else {
          console.log('Added lat_origen column');
        }
      });

      db.run('ALTER TABLE rides ADD COLUMN lng_origen REAL', (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('Error adding lng_origen:', err.message);
        } else {
          console.log('Added lng_origen column');
        }
      });

      db.run('ALTER TABLE rides ADD COLUMN lat_destino REAL', (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('Error adding lat_destino:', err.message);
        } else {
          console.log('Added lat_destino column');
        }
      });

      db.run('ALTER TABLE rides ADD COLUMN lng_destino REAL', (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.error('Error adding lng_destino:', err.message);
        } else {
          console.log('Added lng_destino column');
        }
      });
    }

    // Note: SQLite doesn't support DROP COLUMN directly
    // precio column will remain but won't be used
    if (hasPrecio) {
      console.log('Note: precio column exists but will not be used (SQLite limitation)');
    }
  });
}

module.exports = db;
