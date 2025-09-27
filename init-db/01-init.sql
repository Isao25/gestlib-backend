-- Script de inicialización de la base de datos
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear enum types
CREATE TYPE valid_roles AS ENUM ('admin', 'librarian', 'user');
CREATE TYPE book_status AS ENUM ('available', 'borrowed');
CREATE TYPE loan_status AS ENUM ('active', 'returned', 'overdue');

-- Crear tablas básicas según las entidades TypeORM
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role valid_roles DEFAULT 'user',
    "isActive" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    author VARCHAR(255) NOT NULL,
    "publishedDate" DATE NOT NULL,
    "totalCopies" INTEGER DEFAULT 1,
    "availableCopies" INTEGER DEFAULT 1,
    status book_status DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "loanDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "returnDate" DATE,
    status loan_status DEFAULT 'active',
    notes TEXT,
    "userId" UUID NOT NULL,
    "bookId" UUID NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("bookId") REFERENCES books(id) ON DELETE CASCADE
);

-- Insertar usuarios de ejemplo
-- Contraseña hasheada para 'password123' usando bcrypt
INSERT INTO users (name, surname, email, password, role, phone) VALUES
('Admin', 'Sistema', 'admin@gestlib.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '555-0001'),
('Usuario', 'Prueba', 'user@gestlib.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', '555-0002')
ON CONFLICT (email) DO NOTHING;