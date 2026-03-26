-- ============================================================
-- VIEW: vw_most_borrowed_books
-- Qué devuelve: ranking de libros más prestados
-- Grain: un registro por libro
-- Métricas: total_prestamos, ranking
-- VERIFY: SELECT * FROM vw_most_borrowed_books LIMIT 10;
-- VERIFY: SELECT * FROM vw_most_borrowed_books WHERE title ILIKE '%code%';
-- ============================================================
CREATE OR REPLACE VIEW vw_most_borrowed_books AS
SELECT
    b.id                                        AS book_id,
    b.title                                     AS title,
    b.author                                    AS author,
    b.category                                  AS category,
    COUNT(l.id)                                 AS total_prestamos,
    RANK() OVER (ORDER BY COUNT(l.id) DESC)     AS ranking
FROM books b
LEFT JOIN copies c ON c.book_id = b.id
LEFT JOIN loans l  ON l.copy_id = c.id
GROUP BY b.id, b.title, b.author, b.category;

-- ============================================================
-- VIEW: vw_overdue_loans
-- Qué devuelve: préstamos vencidos con días de atraso y monto sugerido
-- Grain: un registro por préstamo vencido
-- Métricas: dias_atraso, monto_sugerido
-- VERIFY: SELECT * FROM vw_overdue_loans;
-- VERIFY: SELECT * FROM vw_overdue_loans WHERE dias_atraso >= 30;
-- ============================================================
CREATE OR REPLACE VIEW vw_overdue_loans AS
WITH prestamos_vencidos AS (
    SELECT
        l.id                                        AS loan_id,
        m.name                                      AS member_name,
        m.email                                     AS member_email,
        b.title                                     AS book_title,
        b.author                                    AS book_author,
        l.loaned_at,
        l.due_at,
        CURRENT_DATE - l.due_at                     AS dias_atraso
    FROM loans l
    JOIN copies c  ON c.id = l.copy_id
    JOIN books b   ON b.id = c.book_id
    JOIN members m ON m.id = l.member_id
    WHERE l.returned_at IS NULL
      AND l.due_at < CURRENT_DATE
)
SELECT
    loan_id,
    member_name,
    member_email,
    book_title,
    book_author,
    loaned_at,
    due_at,
    dias_atraso,
    CASE
        WHEN dias_atraso <= 7  THEN ROUND(dias_atraso * 5.00, 2)
        WHEN dias_atraso <= 30 THEN ROUND(dias_atraso * 8.00, 2)
        ELSE                        ROUND(dias_atraso * 12.00, 2)
    END AS monto_sugerido
FROM prestamos_vencidos;

-- ============================================================
-- VIEW: vw_fines_summary
-- Qué devuelve: resumen mensual de multas pagadas y pendientes
-- Grain: un registro por mes
-- Métricas: total_multas, monto_pagado, monto_pendiente
-- VERIFY: SELECT * FROM vw_fines_summary;
-- VERIFY: SELECT * FROM vw_fines_summary WHERE mes >= '2025-01-01';
-- ============================================================
CREATE OR REPLACE VIEW vw_fines_summary AS
SELECT
    DATE_TRUNC('month', l.loaned_at)            AS mes,
    COUNT(f.id)                                 AS total_multas,
    SUM(f.amount)                               AS monto_total,
    SUM(CASE WHEN f.paid_at IS NOT NULL
             THEN f.amount ELSE 0 END)          AS monto_pagado,
    SUM(CASE WHEN f.paid_at IS NULL
             THEN f.amount ELSE 0 END)          AS monto_pendiente,
    ROUND(
        SUM(CASE WHEN f.paid_at IS NOT NULL
                 THEN f.amount ELSE 0 END)
        / NULLIF(SUM(f.amount), 0) * 100, 2
    )                                           AS porcentaje_cobrado
FROM fines f
JOIN loans l ON l.id = f.loan_id
GROUP BY DATE_TRUNC('month', l.loaned_at)
HAVING COUNT(f.id) > 0
ORDER BY mes;

-- ============================================================
-- VIEW: vw_member_activity
-- Qué devuelve: actividad de socios con tasa de atraso
-- Grain: un registro por socio
-- Métricas: total_prestamos, prestamos_atrasados, tasa_atraso
-- VERIFY: SELECT * FROM vw_member_activity ORDER BY total_prestamos DESC;
-- VERIFY: SELECT * FROM vw_member_activity WHERE tasa_atraso > 50;
-- ============================================================
CREATE OR REPLACE VIEW vw_member_activity AS
SELECT
    m.id                                        AS member_id,
    m.name                                      AS member_name,
    m.email                                     AS member_email,
    m.member_type,
    COUNT(l.id)                                 AS total_prestamos,
    SUM(CASE WHEN l.returned_at IS NULL
             AND l.due_at < CURRENT_DATE
             THEN 1 ELSE 0 END)                 AS prestamos_atrasados,
    COALESCE(
        ROUND(
            SUM(CASE WHEN l.returned_at IS NULL
                     AND l.due_at < CURRENT_DATE
                     THEN 1 ELSE 0 END)::NUMERIC
            / NULLIF(COUNT(l.id), 0) * 100, 2
        ), 0
    )                                           AS tasa_atraso,
    CASE
        WHEN COUNT(l.id) = 0             THEN 'sin actividad'
        WHEN COUNT(l.id) BETWEEN 1 AND 3 THEN 'poco activo'
        WHEN COUNT(l.id) BETWEEN 4 AND 7 THEN 'activo'
        ELSE                                  'muy activo'
    END                                         AS nivel_actividad
FROM members m
LEFT JOIN loans l ON l.member_id = m.id
GROUP BY m.id, m.name, m.email, m.member_type
HAVING COUNT(l.id) >= 0;

-- ============================================================
-- VIEW: vw_inventory_health
-- Qué devuelve: salud del inventario por categoría
-- Grain: un registro por categoría
-- Métricas: total_copias, disponibles, prestadas, perdidas
-- VERIFY: SELECT * FROM vw_inventory_health;
-- VERIFY: SELECT * FROM vw_inventory_health WHERE porcentaje_disponible < 50;
-- ============================================================
CREATE OR REPLACE VIEW vw_inventory_health AS
SELECT
    b.category                                  AS category,
    COUNT(c.id)                                 AS total_copias,
    SUM(CASE WHEN c.status = 'disponible'
             THEN 1 ELSE 0 END)                 AS disponibles,
    SUM(CASE WHEN c.status = 'prestado'
             THEN 1 ELSE 0 END)                 AS prestadas,
    SUM(CASE WHEN c.status = 'perdido'
             THEN 1 ELSE 0 END)                 AS perdidas,
    SUM(CASE WHEN c.status = 'mantenimiento'
             THEN 1 ELSE 0 END)                 AS en_mantenimiento,
    COALESCE(
        ROUND(
            SUM(CASE WHEN c.status = 'disponible'
                     THEN 1 ELSE 0 END)::NUMERIC
            / NULLIF(COUNT(c.id), 0) * 100, 2
        ), 0
    )                                           AS porcentaje_disponible
FROM books b
JOIN copies c ON c.book_id = b.id
GROUP BY b.category;