-- Crear usuario app_user con contraseña
CREATE USER app_user WITH PASSWORD 'app123';

-- Dar permiso de conexión a la base de datos
GRANT CONNECT ON DATABASE biblioteca TO app_user;

-- Dar permiso de uso del schema public
GRANT USAGE ON SCHEMA public TO app_user;

-- Solo SELECT sobre las VIEWS (no sobre tablas directamente)
GRANT SELECT ON vw_most_borrowed_books TO app_user;
GRANT SELECT ON vw_overdue_loans TO app_user;
GRANT SELECT ON vw_fines_summary TO app_user;
GRANT SELECT ON vw_member_activity TO app_user;
GRANT SELECT ON vw_inventory_health TO app_user;