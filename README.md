# VAVOY - Ride-Sharing App

A minimal but functional hyper-local ride-sharing web application for Valle de Benasque (Spain) and Merindades de Burgos.

## Features

- **User Registration & Login**: Secure authentication with bcrypt password hashing
- **Offer Rides**: Create ride offers with origin, destination, price, and available seats
- **Search Rides**: Filter and browse available rides in real-time
- **Manage Rides**: View and delete your own ride offers
- **Mobile-First Design**: Responsive, modern UI optimized for all devices

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (file-based)
- **Template Engine**: EJS
- **Frontend**: HTML + CSS + Vanilla JavaScript
- **Authentication**: express-session + bcryptjs

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Register**: Create an account with your name, email, and password
2. **Login**: Sign in with your credentials
3. **Search Rides**: Browse available rides using the search filters
4. **Offer a Ride**: Create a new ride offer with all the details
5. **Manage Your Rides**: View and delete rides you've created in "Mis viajes"

## Project Structure

```
vavoy/
├── server.js          # Main Express server and routes
├── db.js              # SQLite database setup
├── package.json       # Project dependencies
├── public/
│   └── styles.css     # CSS styles
└── views/             # EJS templates
    ├── landing.ejs    # Landing page
    ├── register.ejs   # Registration page
    ├── login.ejs      # Login page
    ├── dashboard.ejs  # Main app dashboard
    └── my-rides.ejs   # User's ride management
```

## Database Schema

### Users Table
- `id`: Primary key
- `nombre`: User's full name
- `email`: Unique email address
- `password_hash`: Hashed password
- `created_at`: Registration timestamp

### Rides Table
- `id`: Primary key
- `driver_id`: Foreign key to users table
- `origen`: Starting location
- `destino`: Destination
- `fecha_salida`: Departure date and time
- `precio`: Price per seat (in euros)
- `plazas_disponibles`: Available seats
- `notas`: Optional notes
- `created_at`: Creation timestamp

## Development

For development with auto-reload:
```bash
npm run dev
```

## Security Notes

- Passwords are hashed using bcrypt
- SQL injection protection via parameterized queries
- Session-based authentication
- CSRF protection should be added for production

## Future Enhancements

- Full booking system implementation
- Email notifications
- User profiles and ratings
- Real-time chat between drivers and passengers
- Payment integration
- Mobile app

## License

ISC
