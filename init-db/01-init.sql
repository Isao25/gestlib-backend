-- Script de inicialización de la base de datos
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tablas básicas (puedes modificar según tus necesidades)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    description TEXT,
    published_date DATE,
    pages INTEGER,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO users (email, username, password, first_name, last_name) VALUES
('admin@gestlib.com', 'admin', '$2b$10$example.hash.here', 'Admin', 'User'),
('user@gestlib.com', 'user', '$2b$10$example.hash.here', 'Test', 'User')
ON CONFLICT (email) DO NOTHING;

INSERT INTO books (title, author, isbn, description, pages) VALUES
('Clean Code', 'Robert C. Martin', '9780132350884', 'A handbook of agile software craftsmanship', 464),
('The Clean Coder', 'Robert C. Martin', '9780137081073', 'A code of conduct for professional programmers', 256),
('Design Patterns', 'Gang of Four', '9780201633610', 'Elements of reusable object-oriented software', 395)
ON CONFLICT (isbn) DO NOTHING;