# nextjs-biblioteca-bda

Sistema de dashboard para la gestión y visualización de reportes de una biblioteca. Se desarrolló como parte de la evaluación práctica de la materia Aplicaciones Web Orientadas a Servicios.

La solución integra Next.js con PostgreSQL mediante Docker Compose, donde los datos se exponen únicamente a través de VIEWS y se accede con un usuario de base de datos con permisos restringidos.

## Stack utilizado

- **Next.js 16** con App Router y TypeScript
- **PostgreSQL 15** con VIEWS, índices y roles
- **Docker Compose** para orquestar los servicios
- **Tailwind CSS** para los estilos
- **Zod** para validación de parámetros

## Instrucciones para ejecutar

Se requiere tener Docker Desktop instalado. Clonar el repositorio y ejecutar:
```bash
docker compose up --build
```

La aplicación estará disponible en: `http://localhost:3000`

## Estructura de archivos
```
├── db/
│   ├── schema.sql       # Definición de tablas y relaciones FK
│   ├── seed.sql         # Datos de prueba para los reportes
│   ├── reports_vw.sql   # 5 VIEWS con agregados y campos calculados
│   ├── indexes.sql      # Índices para optimizar las consultas
│   └── roles.sql        # Configuración del usuario app_user
├── src/
│   ├── app/
│   │   ├── page.tsx             # Dashboard con acceso a los 5 reportes
│   │   └── reports/             # Páginas individuales por reporte
│   └── lib/
│       └── db.ts                # Pool de conexión a PostgreSQL
├── docker-compose.yml
└── Dockerfile
```

## Reportes implementados

Se desarrollaron 5 pantallas, cada una conectada a una VIEW distinta:

- **/reports/libros-populares** — Ranking de libros con más préstamos, incluye búsqueda por título/autor y paginación
- **/reports/prestamos-vencidos** — Préstamos no devueltos con días de atraso y monto sugerido, filtrable por días mínimos
- **/reports/resumen-multas** — Resumen mensual de multas con montos pagados y pendientes, filtrable por rango de fechas
- **/reports/actividad-socios** — Socios con su nivel de actividad y tasa de atraso, filtrable por tipo de socio
- **/reports/inventario** — Estado del inventario agrupado por categoría

## Seguridad de base de datos

La aplicación se conecta mediante el usuario `app_user`, que únicamente tiene permiso SELECT sobre las VIEWS. No se otorgaron permisos sobre las tablas directamente.

Para verificarlo, se puede ejecutar dentro del contenedor:
```bash
docker exec -it biblioteca_db psql -U postgres -d biblioteca
```

Y luego intentar acceder como app_user a una tabla:
```sql
SET ROLE app_user;
SELECT * FROM members;
-- Resultado esperado: ERROR: permission denied for table members
```

## Índices y rendimiento

Se crearon índices en columnas frecuentemente usadas en filtros y joins:
```sql
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_loans_due_at ON loans(due_at);
CREATE INDEX idx_loans_member_id ON loans(member_id);
```

Evidencia con EXPLAIN:
```sql
-- Búsqueda por título
EXPLAIN SELECT * FROM vw_most_borrowed_books WHERE title ILIKE '%code%';
-- Usa: Index Scan using idx_books_title

-- Préstamos vencidos
EXPLAIN SELECT * FROM vw_overdue_loans WHERE dias_atraso >= 30;
-- Usa: Index Scan using idx_loans_due_at
```

## Variables de entorno

Se requiere un archivo `.env.local` en la raíz del proyecto con la siguiente variable:
```
DATABASE_URL=postgresql://<usuario>:<password>@<host>:<puerto>/<base_de_datos>
```

El archivo `.env.local` no se sube al repositorio por seguridad.