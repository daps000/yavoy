// Script to seed dummy data for VAVOY
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./vavoy.db');

async function seedData() {
  console.log('Starting data seeding...');

  // First, create tables
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else {
        console.log('✓ Users table created');
        resolve();
      }
    });
  });

  await new Promise((resolve, reject) => {
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
      if (err) reject(err);
      else {
        console.log('✓ Rides table created');
        resolve();
      }
    });
  });

  try {
    // Create test user if doesn't exist
    const passwordHash = await bcrypt.hash('test123', 10);

    db.run(
      'INSERT OR IGNORE INTO users (id, nombre, email, password_hash) VALUES (?, ?, ?, ?)',
      [999, 'Usuario de Prueba', 'test@vavoy.com', passwordHash],
      (err) => {
        if (err && !err.message.includes('UNIQUE')) {
          console.error('Error creating test user:', err);
        } else {
          console.log('✓ Test user created (test@vavoy.com / test123)');
        }
      }
    );

    // Wait a bit for user creation
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create dummy rides
    const rides = [
      {
        driver_id: 999,
        origen: 'Villarcayo',
        destino: 'Villaves',
        lat_origen: 42.9390,
        lng_origen: -3.5720,
        lat_destino: 42.9700,
        lng_destino: -3.7192,
        fecha_salida: getDateString(1, 10, 0), // Tomorrow at 10:00
        plazas_disponibles: 3,
        notas: 'Tengo que hacer recados y volveré en 1 hora aprox.'
      },
      {
        driver_id: 999,
        origen: 'Villaves',
        destino: 'Soncillo',
        lat_origen: 42.9700,
        lng_origen: -3.7192,
        lat_destino: 42.9700,
        lng_destino: -3.7856,
        fecha_salida: getDateString(1, 15, 30), // Tomorrow at 15:30
        plazas_disponibles: 2,
        notas: 'Voy directamente, no paro en el camino'
      },
      {
        driver_id: 999,
        origen: 'Villarcayo',
        destino: 'Medina de Pomar',
        lat_origen: 42.9390,
        lng_origen: -3.5720,
        lat_destino: 42.9333,
        lng_destino: -3.4833,
        fecha_salida: getDateString(2, 9, 0), // Day after tomorrow at 9:00
        plazas_disponibles: 4,
        notas: 'Salgo desde la plaza del pueblo. Tengo que hacer recados y volveré en 1 hora aprox.'
      },
      {
        driver_id: 999,
        origen: 'Soncillo',
        destino: 'Villarcayo',
        lat_origen: 42.9700,
        lng_origen: -3.7856,
        lat_destino: 42.9390,
        lng_destino: -3.5720,
        fecha_salida: getDateString(2, 18, 0), // Day after tomorrow at 18:00
        plazas_disponibles: 3,
        notas: 'Vuelta del trabajo, puntual a las 18:00'
      },
      {
        driver_id: 999,
        origen: 'Medina de Pomar',
        destino: 'Burgos',
        lat_origen: 42.9333,
        lng_origen: -3.4833,
        lat_destino: 42.3439,
        lng_destino: -3.6970,
        fecha_salida: getDateString(3, 8, 30), // In 3 days at 8:30
        plazas_disponibles: 2,
        notas: 'Voy a Burgos por trabajo. Puedo dejar en el centro.'
      }
    ];

    // Insert rides
    let inserted = 0;
    rides.forEach((ride, index) => {
      db.run(
        `INSERT INTO rides (driver_id, origen, destino, lat_origen, lng_origen, lat_destino, lng_destino, fecha_salida, plazas_disponibles, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ride.driver_id,
          ride.origen,
          ride.destino,
          ride.lat_origen,
          ride.lng_origen,
          ride.lat_destino,
          ride.lng_destino,
          ride.fecha_salida,
          ride.plazas_disponibles,
          ride.notas
        ],
        function(err) {
          if (err) {
            console.error(`Error inserting ride ${index + 1}:`, err);
          } else {
            inserted++;
            console.log(`✓ Ride ${index + 1}: ${ride.origen} → ${ride.destino}`);
          }

          // Close DB after last insert
          if (index === rides.length - 1) {
            setTimeout(() => {
              db.close(() => {
                console.log(`\nSeeding complete! ${inserted}/${rides.length} rides created.`);
                console.log('\nYou can now login with:');
                console.log('  Email: test@vavoy.com');
                console.log('  Password: test123');
              });
            }, 200);
          }
        }
      );
    });

  } catch (err) {
    console.error('Error seeding data:', err);
    db.close();
  }
}

// Helper function to get date string for N days from now at specific time
function getDateString(daysFromNow, hours, minutes) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);

  // Format as ISO 8601 without timezone (SQLite format)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

// Run the seeding
seedData();
