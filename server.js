const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const pool = require("./db");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3000);

const sampleTrips = [
  {
    id: 1,
    title: "Escapada a Bariloche",
    destination: "Bariloche",
    start_date: "2026-03-10",
    end_date: "2026-03-15",
    seats: 30,
    price: 320000,
    image_url:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
    description: "Incluye traslado, hospedaje y actividades.",
  },
  {
    id: 2,
    title: "Aventura en Mendoza",
    destination: "Mendoza",
    start_date: "2026-04-05",
    end_date: "2026-04-09",
    seats: 24,
    price: 280000,
    image_url:
      "https://images.unsplash.com/photo-1710714310125-5fe6ce610ca7?auto=format&fit=crop&w=1200&q=80",
    description: "Experiencia de montaña y bodega para grupos.",
  },
];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/trips", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, destination, start_date, end_date, seats, price, image_url, description FROM trips WHERE start_date >= CURDATE() ORDER BY start_date ASC"
    );
    res.json(rows);
  } catch (_error) {
    res.json(sampleTrips);
  }
});

app.post("/api/register", async (req, res) => {
  const { fullName, email, password, confirmPassword, birthDate } = req.body;
  if (!fullName || !email || !password || !confirmPassword || !birthDate) {
    return res.status(400).json({ message: "Completá todos los campos." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Las contraseñas no coinciden." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Ya existe una cuenta con ese email." });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (full_name, email, password_hash, birth_date) VALUES (?, ?, ?, ?)",
      [fullName, email, hash, birthDate]
    );
    res.status(201).json({ message: "Registro exitoso." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo registrar el usuario.", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son obligatorios." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    res.json({
      message: "Inicio de sesión exitoso.",
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "No se pudo iniciar sesión.", error: error.message });
  }
});

app.post("/api/bookings/trip", async (req, res) => {
  const { userId, tripId, passengers, paymentMethod } = req.body;
  if (!userId || !tripId || !passengers || !paymentMethod) {
    return res.status(400).json({ message: "Faltan datos para reservar el viaje." });
  }

  try {
    await pool.query(
      "INSERT INTO trip_bookings (user_id, trip_id, passengers, payment_method) VALUES (?, ?, ?, ?)",
      [userId, tripId, passengers, paymentMethod]
    );
    res.status(201).json({ message: "Reserva de viaje creada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo reservar el viaje.", error: error.message });
  }
});

app.post("/api/bookings/venue", async (req, res) => {
  const { userId, eventDate, guests, venueType, notes, paymentMethod } = req.body;
  if (!userId || !eventDate || !guests || !venueType || !paymentMethod) {
    return res.status(400).json({ message: "Faltan datos para reservar quincho/salón." });
  }

  try {
    await pool.query(
      "INSERT INTO venue_bookings (user_id, event_date, guests, venue_type, notes, payment_method) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, eventDate, guests, venueType, notes || "", paymentMethod]
    );
    res.status(201).json({ message: "Reserva de quincho/salón creada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo crear la reserva.", error: error.message });
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Completá nombre, email y mensaje." });
  }

  try {
    await pool.query("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)", [
      name,
      email,
      message,
    ]);
    res.status(201).json({ message: "Mensaje enviado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "No se pudo enviar el mensaje.", error: error.message });
  }
});

app.get("/api/admin/summary", async (_req, res) => {
  try {
    const [[usersCount]] = await pool.query("SELECT COUNT(*) AS total FROM users");
    const [[tripBookingsCount]] = await pool.query("SELECT COUNT(*) AS total FROM trip_bookings");
    const [[venueBookingsCount]] = await pool.query("SELECT COUNT(*) AS total FROM venue_bookings");
    const [recentMessages] = await pool.query(
      "SELECT name, email, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 5"
    );

    res.json({
      totals: {
        users: usersCount.total,
        tripBookings: tripBookingsCount.total,
        venueBookings: venueBookingsCount.total,
      },
      recentMessages,
    });
  } catch (_error) {
    res.json({ totals: { users: 0, tripBookings: 0, venueBookings: 0 }, recentMessages: [] });
  }
});

app.listen(port, () => {
  console.log(`GNM Tour corriendo en http://localhost:${port}`);
});
