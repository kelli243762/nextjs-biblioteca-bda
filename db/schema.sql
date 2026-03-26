-- Tabla de socios
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    member_type VARCHAR(20) NOT NULL CHECK (member_type IN ('estudiante', 'docente', 'externo')),
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Tabla de libros
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL
);

-- Tabla de copias
CREATE TABLE copies (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id),
    barcode VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'prestado', 'perdido', 'mantenimiento'))
);

-- Tabla de préstamos
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    copy_id INTEGER NOT NULL REFERENCES copies(id),
    member_id INTEGER NOT NULL REFERENCES members(id),
    loaned_at DATE NOT NULL DEFAULT CURRENT_DATE,
    due_at DATE NOT NULL,
    returned_at DATE
);

-- Tabla de multas
CREATE TABLE fines (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES loans(id),
    amount NUMERIC(10,2) NOT NULL,
    paid_at DATE
);