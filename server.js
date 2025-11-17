// Main server file for VAVOY ride-sharing app
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');
const { geocodeLocation, calculateDistance } = require('./geoutils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'vavoy-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  if (date.toDateString() === today.toDateString()) {
    return `Hoy ${timeStr}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Mañana ${timeStr}`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Make formatDate available in all views
app.locals.formatDate = formatDate;

// Routes

// Landing page (public)
app.get('/', (req, res) => {
  // If already logged in, redirect to buscar
  if (req.session.userId) {
    return res.redirect('/buscar');
  }
  res.render('landing');
});

// Register page (public)
app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/buscar');
  }
  res.render('register', { error: null });
});

// Register POST
app.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  // Validate inputs
  if (!nombre || !email || !password) {
    return res.render('register', { error: 'Todos los campos son obligatorios' });
  }

  if (password.length < 6) {
    return res.render('register', { error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into database
    db.run(
      'INSERT INTO users (nombre, email, password_hash) VALUES (?, ?, ?)',
      [nombre, email.toLowerCase(), passwordHash],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.render('register', { error: 'Este email ya está registrado' });
          }
          console.error('Error creating user:', err);
          return res.render('register', { error: 'Error al crear la cuenta. Inténtalo de nuevo.' });
        }

        // Auto-login after registration
        req.session.userId = this.lastID;
        req.session.userName = nombre;
        res.redirect('/buscar');
      }
    );
  } catch (err) {
    console.error('Error in registration:', err);
    res.render('register', { error: 'Error al crear la cuenta. Inténtalo de nuevo.' });
  }
});

// Login page (public)
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/buscar');
  }
  res.render('login', { error: null });
});

// Login POST
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Todos los campos son obligatorios' });
  }

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email.toLowerCase()],
    async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.render('login', { error: 'Error al iniciar sesión. Inténtalo de nuevo.' });
      }

      if (!user) {
        return res.render('login', { error: 'Email o contraseña incorrectos' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.render('login', { error: 'Email o contraseña incorrectos' });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userName = user.nombre;
      res.redirect('/buscar');
    }
  );
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Buscar viaje page (private)
app.get('/buscar', requireAuth, (req, res) => {
  const { origen, destino, extended } = req.query;
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  // Build query
  let query = `
    SELECT rides.*, users.nombre as conductor_nombre
    FROM rides
    JOIN users ON rides.driver_id = users.id
    WHERE rides.fecha_salida >= datetime('now')
  `;
  const params = [];

  if (origen) {
    query += ' AND LOWER(rides.origen) LIKE ?';
    params.push(`%${origen.toLowerCase()}%`);
  }

  if (destino) {
    query += ' AND LOWER(rides.destino) LIKE ?';
    params.push(`%${destino.toLowerCase()}%`);
  }

  query += ' ORDER BY rides.fecha_salida ASC';

  db.all(query, params, (err, rides) => {
    if (err) {
      console.error('Error fetching rides:', err);
      return res.render('buscar', {
        userName: req.session.userName,
        rides: [],
        filters: { origen, destino, extended },
        error: 'Error al buscar viajes',
        success: null
      });
    }

    let ridesWithDistance = rides || [];

    // Calculate distances if user location is available
    if (userLat && userLng && !isNaN(userLat) && !isNaN(userLng)) {
      ridesWithDistance = ridesWithDistance.map(ride => {
        const distance = calculateDistance(
          userLat,
          userLng,
          ride.lat_origen || 0,
          ride.lng_origen || 0
        );
        return { ...ride, distance };
      });

      // Filter by distance unless extended search is enabled
      const maxDistance = extended === 'true' ? 1000 : 20; // 20km default, 1000km for extended
      ridesWithDistance = ridesWithDistance.filter(ride =>
        ride.distance !== null && ride.distance <= maxDistance
      );

      // Sort by distance
      ridesWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    res.render('buscar', {
      userName: req.session.userName,
      rides: ridesWithDistance,
      filters: { origen, destino, extended },
      userLocation: { lat: userLat, lng: userLng },
      error: req.query.error || null,
      success: req.query.success || null
    });
  });
});

// Ofrecer viaje page (private)
app.get('/ofrecer', requireAuth, (req, res) => {
  res.render('ofrecer', {
    userName: req.session.userName,
    error: req.query.error || null,
    success: req.query.success || null
  });
});

// Dashboard (private) - redirect to buscar
app.get('/dashboard', requireAuth, (req, res) => {
  res.redirect('/buscar');
});

// Create ride POST
app.post('/rides/create', requireAuth, (req, res) => {
  const { origen, destino, fecha_salida, plazas_disponibles, notas } = req.body;

  // Validate inputs
  if (!origen || !destino || !fecha_salida || !plazas_disponibles) {
    return res.redirect('/ofrecer?error=Todos los campos obligatorios deben ser completados');
  }

  if (parseInt(plazas_disponibles) < 1 || parseInt(plazas_disponibles) > 8) {
    return res.redirect('/ofrecer?error=El número de plazas debe estar entre 1 y 8');
  }

  // Geocode locations
  const coordsOrigen = geocodeLocation(origen);
  const coordsDestino = geocodeLocation(destino);

  if (!coordsOrigen) {
    return res.redirect('/ofrecer?error=No se reconoce el origen. Prueba con: Villarcayo, Villaves, Soncillo, Medina de Pomar, etc.');
  }

  if (!coordsDestino) {
    return res.redirect('/ofrecer?error=No se reconoce el destino. Prueba con: Villarcayo, Villaves, Soncillo, Medina de Pomar, etc.');
  }

  db.run(
    `INSERT INTO rides (driver_id, origen, destino, lat_origen, lng_origen, lat_destino, lng_destino, fecha_salida, plazas_disponibles, notas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.session.userId,
      coordsOrigen.name,
      coordsDestino.name,
      coordsOrigen.lat,
      coordsOrigen.lng,
      coordsDestino.lat,
      coordsDestino.lng,
      fecha_salida,
      parseInt(plazas_disponibles),
      notas || null
    ],
    function(err) {
      if (err) {
        console.error('Error creating ride:', err);
        return res.redirect('/ofrecer?error=Error al crear el viaje');
      }

      res.redirect('/my-rides?success=Viaje publicado correctamente');
    }
  );
});

// My rides page (private)
app.get('/my-rides', requireAuth, (req, res) => {
  db.all(
    'SELECT * FROM rides WHERE driver_id = ? ORDER BY fecha_salida DESC',
    [req.session.userId],
    (err, rides) => {
      if (err) {
        console.error('Error fetching user rides:', err);
        return res.render('my-rides', {
          userName: req.session.userName,
          rides: [],
          error: 'Error al cargar tus viajes',
          success: null
        });
      }

      res.render('my-rides', {
        userName: req.session.userName,
        rides: rides || [],
        error: null,
        success: req.query.success || null
      });
    }
  );
});

// Delete ride
app.post('/rides/delete/:id', requireAuth, (req, res) => {
  const rideId = req.params.id;

  // First verify that the ride belongs to the current user
  db.get(
    'SELECT * FROM rides WHERE id = ? AND driver_id = ?',
    [rideId, req.session.userId],
    (err, ride) => {
      if (err) {
        console.error('Error checking ride ownership:', err);
        return res.redirect('/my-rides?error=Error al eliminar el viaje');
      }

      if (!ride) {
        return res.redirect('/my-rides?error=No tienes permiso para eliminar este viaje');
      }

      // Delete the ride
      db.run('DELETE FROM rides WHERE id = ?', [rideId], (err) => {
        if (err) {
          console.error('Error deleting ride:', err);
          return res.redirect('/my-rides?error=Error al eliminar el viaje');
        }

        res.redirect('/my-rides?success=Viaje eliminado correctamente');
      });
    }
  );
});

// Edit ride page
app.get('/rides/edit/:id', requireAuth, (req, res) => {
  const rideId = req.params.id;

  db.get(
    'SELECT * FROM rides WHERE id = ? AND driver_id = ?',
    [rideId, req.session.userId],
    (err, ride) => {
      if (err) {
        console.error('Error fetching ride:', err);
        return res.redirect('/my-rides?error=Error al cargar el viaje');
      }

      if (!ride) {
        return res.redirect('/my-rides?error=No tienes permiso para editar este viaje');
      }

      res.render('edit-ride', {
        userName: req.session.userName,
        ride: ride,
        error: null,
        success: null
      });
    }
  );
});

// Update ride POST
app.post('/rides/edit/:id', requireAuth, (req, res) => {
  const rideId = req.params.id;
  const { origen, destino, fecha_salida, plazas_disponibles, notas } = req.body;

  // Validate inputs
  if (!origen || !destino || !fecha_salida || !plazas_disponibles) {
    return res.redirect(`/rides/edit/${rideId}?error=Todos los campos obligatorios deben ser completados`);
  }

  if (parseInt(plazas_disponibles) < 1 || parseInt(plazas_disponibles) > 8) {
    return res.redirect(`/rides/edit/${rideId}?error=El número de plazas debe estar entre 1 y 8`);
  }

  // Geocode locations
  const coordsOrigen = geocodeLocation(origen);
  const coordsDestino = geocodeLocation(destino);

  if (!coordsOrigen) {
    return res.redirect(`/rides/edit/${rideId}?error=No se reconoce el origen. Prueba con: Villarcayo, Villaves, Soncillo, Medina de Pomar, etc.`);
  }

  if (!coordsDestino) {
    return res.redirect(`/rides/edit/${rideId}?error=No se reconoce el destino. Prueba con: Villarcayo, Villaves, Soncillo, Medina de Pomar, etc.`);
  }

  // First verify ownership
  db.get(
    'SELECT * FROM rides WHERE id = ? AND driver_id = ?',
    [rideId, req.session.userId],
    (err, ride) => {
      if (err) {
        console.error('Error checking ride ownership:', err);
        return res.redirect('/my-rides?error=Error al actualizar el viaje');
      }

      if (!ride) {
        return res.redirect('/my-rides?error=No tienes permiso para editar este viaje');
      }

      // Update the ride
      db.run(
        `UPDATE rides
         SET origen = ?, destino = ?, lat_origen = ?, lng_origen = ?, lat_destino = ?, lng_destino = ?,
             fecha_salida = ?, plazas_disponibles = ?, notas = ?
         WHERE id = ?`,
        [
          coordsOrigen.name,
          coordsDestino.name,
          coordsOrigen.lat,
          coordsOrigen.lng,
          coordsDestino.lat,
          coordsDestino.lng,
          fecha_salida,
          parseInt(plazas_disponibles),
          notas || null,
          rideId
        ],
        (err) => {
          if (err) {
            console.error('Error updating ride:', err);
            return res.redirect(`/rides/edit/${rideId}?error=Error al actualizar el viaje`);
          }

          res.redirect('/my-rides?success=Viaje actualizado correctamente');
        }
      );
    }
  );
});

// Placeholder for booking a ride (not fully implemented yet)
app.post('/rides/book/:id', requireAuth, (req, res) => {
  const rideId = req.params.id;

  // TODO: Implement booking logic here
  // - Check if ride exists and has available seats
  // - Create a booking record in a bookings table
  // - Decrease available seats count
  // - Send confirmation

  res.redirect('/dashboard?success=Función de reserva en desarrollo. Próximamente podrás reservar plazas.');
});

// Start server
app.listen(PORT, () => {
  console.log(`VAVOY server running on http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop`);
});
