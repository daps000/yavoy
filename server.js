// Main server file for VAVOY ride-sharing app
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

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
  // If already logged in, redirect to dashboard
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('landing');
});

// Register page (public)
app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
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
        res.redirect('/dashboard');
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
    return res.redirect('/dashboard');
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
      res.redirect('/dashboard');
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

// Dashboard (private)
app.get('/dashboard', requireAuth, (req, res) => {
  // Get search parameters
  const { origen, destino, fecha_minima } = req.query;

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

  if (fecha_minima) {
    query += ' AND rides.fecha_salida >= ?';
    params.push(fecha_minima);
  }

  query += ' ORDER BY rides.fecha_salida ASC LIMIT 50';

  db.all(query, params, (err, rides) => {
    if (err) {
      console.error('Error fetching rides:', err);
      return res.render('dashboard', {
        userName: req.session.userName,
        rides: [],
        filters: { origen, destino, fecha_minima },
        error: 'Error al buscar viajes',
        success: null
      });
    }

    res.render('dashboard', {
      userName: req.session.userName,
      rides: rides || [],
      filters: { origen, destino, fecha_minima },
      error: null,
      success: req.query.success || null
    });
  });
});

// Create ride POST
app.post('/rides/create', requireAuth, (req, res) => {
  const { origen, destino, fecha_salida, precio, plazas_disponibles, notas } = req.body;

  // Validate inputs
  if (!origen || !destino || !fecha_salida || !precio || !plazas_disponibles) {
    return res.redirect('/dashboard?error=Todos los campos obligatorios deben ser completados');
  }

  if (parseInt(plazas_disponibles) < 1 || parseInt(plazas_disponibles) > 8) {
    return res.redirect('/dashboard?error=El número de plazas debe estar entre 1 y 8');
  }

  if (parseFloat(precio) < 0) {
    return res.redirect('/dashboard?error=El precio no puede ser negativo');
  }

  db.run(
    `INSERT INTO rides (driver_id, origen, destino, fecha_salida, precio, plazas_disponibles, notas)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.session.userId, origen, destino, fecha_salida, parseFloat(precio), parseInt(plazas_disponibles), notas || null],
    function(err) {
      if (err) {
        console.error('Error creating ride:', err);
        return res.redirect('/dashboard?error=Error al crear el viaje');
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
