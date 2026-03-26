-- Socios
INSERT INTO members (name, email, member_type, joined_at) VALUES
('Ana García', 'ana.garcia@mail.com', 'estudiante', '2023-01-15'),
('Luis Martínez', 'luis.martinez@mail.com', 'docente', '2022-08-10'),
('María López', 'maria.lopez@mail.com', 'estudiante', '2023-03-20'),
('Carlos Pérez', 'carlos.perez@mail.com', 'externo', '2023-05-05'),
('Sofía Ramírez', 'sofia.ramirez@mail.com', 'estudiante', '2023-06-12'),
('Pedro Torres', 'pedro.torres@mail.com', 'docente', '2022-09-01'),
('Laura Díaz', 'laura.diaz@mail.com', 'estudiante', '2024-01-10'),
('Jorge Hernández', 'jorge.hernandez@mail.com', 'externo', '2024-02-14'),
('Valeria Cruz', 'valeria.cruz@mail.com', 'estudiante', '2024-03-01'),
('Roberto Flores', 'roberto.flores@mail.com', 'estudiante', '2024-03-15');

-- Libros
INSERT INTO books (title, author, category, isbn) VALUES
('Clean Code', 'Robert C. Martin', 'Programación', '978-0132350884'),
('El Quijote', 'Miguel de Cervantes', 'Literatura', '978-8424922580'),
('Introducción a Algoritmos', 'Cormen et al.', 'Programación', '978-0262033848'),
('Harry Potter y la Piedra Filosofal', 'J.K. Rowling', 'Ficción', '978-8478884452'),
('Sapiens', 'Yuval Noah Harari', 'Historia', '978-8499926223'),
('The Pragmatic Programmer', 'Hunt y Thomas', 'Programación', '978-0201616224'),
('Cien Años de Soledad', 'Gabriel García Márquez', 'Literatura', '978-8437604947'),
('Design Patterns', 'Gang of Four', 'Programación', '978-0201633610'),
('El Principito', 'Antoine de Saint-Exupéry', 'Ficción', '978-8498381498'),
('Estadística para Todos', 'Mario Triola', 'Ciencias', '978-6073238069');

-- Copias
INSERT INTO copies (book_id, barcode, status) VALUES
(1, 'BC001', 'prestado'), (1, 'BC002', 'disponible'),
(2, 'BC003', 'disponible'), (2, 'BC004', 'prestado'),
(3, 'BC005', 'prestado'), (3, 'BC006', 'disponible'),
(4, 'BC007', 'prestado'), (4, 'BC008', 'disponible'),
(5, 'BC009', 'disponible'), (5, 'BC010', 'perdido'),
(6, 'BC011', 'prestado'), (6, 'BC012', 'disponible'),
(7, 'BC013', 'disponible'), (7, 'BC014', 'prestado'),
(8, 'BC015', 'disponible'), (8, 'BC016', 'prestado'),
(9, 'BC017', 'disponible'), (9, 'BC018', 'disponible'),
(10, 'BC019', 'prestado'), (10, 'BC020', 'mantenimiento');

-- Préstamos (algunos vencidos)
INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
(1,  1, '2025-01-01', '2025-01-15', '2025-01-14'),
(3,  2, '2025-01-05', '2025-01-20', '2025-01-20'),
(5,  3, '2025-01-10', '2025-01-24', NULL),
(7,  4, '2025-01-12', '2025-01-26', NULL),
(11, 5, '2025-01-15', '2025-01-29', '2025-01-28'),
(14, 6, '2025-01-18', '2025-02-01', NULL),
(16, 7, '2025-01-20', '2025-02-03', '2025-02-02'),
(4,  8, '2025-02-01', '2025-02-15', NULL),
(19, 9, '2025-02-05', '2025-02-19', NULL),
(2,  10,'2025-02-10', '2025-02-24', '2025-02-23'),
(6,  1, '2025-02-15', '2025-03-01', NULL),
(8,  2, '2025-02-20', '2025-03-06', '2025-03-05'),
(12, 3, '2025-03-01', '2025-03-15', NULL),
(15, 4, '2025-03-05', '2025-03-19', NULL),
(17, 5, '2025-03-10', '2025-03-24', '2025-03-22'),
(18, 6, '2025-03-15', '2025-03-29', NULL),
(20, 7, '2024-12-01', '2024-12-15', NULL),
(9,  8, '2024-12-10', '2024-12-24', NULL),
(13, 9, '2024-11-01', '2024-11-15', NULL),
(1,  10,'2024-11-20', '2024-12-04', '2024-12-03');

-- Multas
INSERT INTO fines (loan_id, amount, paid_at) VALUES
(3,  25.00, NULL),
(4,  30.00, NULL),
(6,  15.00, '2025-02-05'),
(8,  20.00, NULL),
(9,  10.00, '2025-02-20'),
(11, 35.00, NULL),
(13, 25.00, NULL),
(14, 40.00, NULL),
(17, 80.00, NULL),
(18, 90.00, NULL),
(19, 120.00, '2024-12-01');