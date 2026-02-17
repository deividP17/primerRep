CREATE DATABASE IF NOT EXISTS gnm_tour;
USE gnm_tour;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  role ENUM('cliente', 'admin') DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  destination VARCHAR(150) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  seats INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  trip_id INT NOT NULL,
  passengers INT NOT NULL,
  payment_method ENUM('mercadopago','transferencia','debito','credito') NOT NULL,
  status ENUM('pendiente','confirmada') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id)
);

CREATE TABLE IF NOT EXISTS venue_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_date DATE NOT NULL,
  guests INT NOT NULL,
  venue_type ENUM('quincho','salon') NOT NULL,
  notes TEXT,
  payment_method ENUM('mercadopago','transferencia','debito','credito') NOT NULL,
  status ENUM('pendiente','confirmada') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO trips (title, destination, start_date, end_date, seats, price, image_url, description)
SELECT * FROM (
  SELECT 'Escapada a Bariloche', 'Bariloche', '2026-03-10', '2026-03-15', 30, 320000.00,
    'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    'Incluye traslado, hospedaje y actividades.'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE title = 'Escapada a Bariloche');

INSERT INTO trips (title, destination, start_date, end_date, seats, price, image_url, description)
SELECT * FROM (
  SELECT 'Aventura en Mendoza', 'Mendoza', '2026-04-05', '2026-04-09', 24, 280000.00,
    'https://images.unsplash.com/photo-1710714310125-5fe6ce610ca7?auto=format&fit=crop&w=1200&q=80',
    'Experiencia de montaña y bodega para grupos.'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE title = 'Aventura en Mendoza');
