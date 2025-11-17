// Quick demo script to test the database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vavoy.db');

console.log('=== USUARIOS REGISTRADOS ===');
db.all('SELECT id, nombre, email, created_at FROM users', (err, users) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.table(users);
  }

  console.log('\n=== VIAJES PUBLICADOS ===');
  db.all(`
    SELECT rides.*, users.nombre as conductor
    FROM rides
    JOIN users ON rides.driver_id = users.id
    ORDER BY rides.fecha_salida
  `, (err, rides) => {
    if (err) {
      console.error('Error:', err);
    } else {
      if (rides.length === 0) {
        console.log('No hay viajes publicados todavía.');
      } else {
        console.table(rides);
      }
    }
    db.close();
  });
});
