# Sistema de Gestión de Inventario y Ventas
**CC3088 Bases de Datos 1 | Universidad del Valle de Guatemala | Ciclo 1, 2026**

## Stack
- **Backend:** Node.js + Express + pg (SQL explícito, sin ORM)
- **Frontend:** React (Create React App)
- **Base de datos:** PostgreSQL 16
- **Deploy:** Docker + docker-compose

## Requisitos
- Docker Desktop instalado y corriendo

## Levantar el proyecto

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd proyecto2
```

### 2. Crear el archivo .env
```bash
cp .env.example .env
```

### 3. Levantar todo
```bash
docker compose up
```

Eso es todo. Docker levanta los 3 servicios automáticamente:
1. `proy2_db` — PostgreSQL con DDL + seed aplicado automáticamente
2. `proy2_backend` — Express en puerto 4000
3. `proy2_frontend` — React en puerto 3000

### Acceder a la app
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/health
- **Usuario:** admin
- **Contraseña:** password

## Credenciales de base de datos
- **Usuario:** proy2
- **Contraseña:** secret
- **Base de datos:** tienda_db

## Estructura del proyecto

## Funcionalidades

### I. Diseño de BD (40pts)
- 8 tablas: categorias, proveedores, productos, clientes, empleados, ventas, detalle_venta, usuarios
- Normalización justificada hasta 3FN
- DDL completo con PK, FK, NOT NULL, CHECK
- 25+ registros de seed por tabla principal
- 3 índices justificados

### II. SQL (50pts)
- 3 JOINs multi-tabla visibles en la UI
- 2 subqueries (EXISTS + scalar subquery)
- GROUP BY + HAVING + funciones de agregación
- CTE con RANK()
- VIEW `reporte_ventas_diarias`
- Transacción explícita BEGIN/COMMIT/ROLLBACK en POST /ventas

### III. App web (35pts)
- CRUD completo de Productos y Clientes
- Reportes: ventas diarias, inventario por categoría, ranking empleados, clientes activos
- Manejo de errores visible al usuario
- README con instrucciones

### IV. Avanzado (15pts)
- Autenticación JWT con roles admin/empleado
- Export CSV desde la UI
