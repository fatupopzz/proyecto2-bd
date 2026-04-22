-- CATEGORIAS
CREATE TABLE categorias (
    id_categoria  SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   TEXT
);

CREATE TABLE proveedores (
    id_proveedor  SERIAL PRIMARY KEY,
    nombre        VARCHAR(150) NOT NULL,
    contacto      VARCHAR(100),
    telefono      VARCHAR(20),
    email         VARCHAR(150)
);

CREATE TABLE clientes (
    id_cliente    SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE,
    telefono      VARCHAR(20),
    direccion     TEXT
);

CREATE TABLE empleados (
    id_empleado        SERIAL PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    apellido           VARCHAR(100) NOT NULL,
    puesto             VARCHAR(100),
    email              VARCHAR(150) UNIQUE,
    fecha_contratacion DATE
);

CREATE TABLE productos (
    id_producto   SERIAL PRIMARY KEY,
    nombre        VARCHAR(150) NOT NULL,
    descripcion   TEXT,
    precio        NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    id_categoria  INTEGER NOT NULL REFERENCES categorias(id_categoria),
    id_proveedor  INTEGER NOT NULL REFERENCES proveedores(id_proveedor)
);

CREATE TABLE ventas (
    id_venta     SERIAL PRIMARY KEY,
    id_cliente   INTEGER NOT NULL REFERENCES clientes(id_cliente),
    id_empleado  INTEGER NOT NULL REFERENCES empleados(id_empleado),
    fecha        TIMESTAMP NOT NULL DEFAULT NOW(),
    total        NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    estado       VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                 CHECK (estado IN ('pendiente','completada','cancelada'))
);

CREATE TABLE detalle_venta (
    id_detalle      SERIAL PRIMARY KEY,
    id_venta        INTEGER NOT NULL REFERENCES ventas(id_venta),
    id_producto     INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE usuarios (
    id_usuario    SERIAL PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol           VARCHAR(20) NOT NULL DEFAULT 'empleado'
                  CHECK (rol IN ('admin', 'empleado')),
    id_empleado   INTEGER REFERENCES empleados(id_empleado),
    activo        BOOLEAN NOT NULL DEFAULT TRUE
);

-- ÍNDICES
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_ventas_cliente      ON ventas(id_cliente);
CREATE INDEX idx_ventas_fecha        ON ventas(fecha);

-- VIEW
CREATE OR REPLACE VIEW reporte_ventas_diarias AS
SELECT
    DATE(v.fecha)                       AS dia,
    COUNT(v.id_venta)                   AS total_ventas,
    SUM(v.total)                        AS ingresos_totales,
    AVG(v.total)::NUMERIC(10,2)         AS ticket_promedio,
    COUNT(DISTINCT v.id_cliente)        AS clientes_unicos
FROM ventas v
WHERE v.estado = 'completada'
GROUP BY DATE(v.fecha)
ORDER BY dia DESC;

-- SEED
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Electrónica',  'Dispositivos y accesorios electrónicos'),
  ('Ropa',         'Prendas de vestir para todo público'),
  ('Alimentos',    'Productos alimenticios y bebidas'),
  ('Hogar',        'Artículos para el hogar y decoración'),
  ('Deportes',     'Equipos y ropa deportiva');

INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
  ('TechSupply GT',         'Mario López',  '22334455', 'mario@techsupply.gt'),
  ('Textiles del Sur',      'Ana García',   '55667788', 'ana@textilesdelsur.com'),
  ('Distribuidora Central', 'Pedro Pérez',  '33445566', 'pedro@distcentral.gt'),
  ('HogarPlus',             'Lucía Ramírez','44556677', 'lucia@hogarplus.gt'),
  ('SportZone',             'Carlos Díaz',  '66778899', 'carlos@sportzone.gt');

INSERT INTO empleados (nombre, apellido, puesto, email, fecha_contratacion) VALUES
  ('Roberto',  'Lima',    'Vendedor', 'roberto.l@tienda.gt',  '2022-01-15'),
  ('Patricia', 'Muñoz',   'Vendedor', 'patricia.m@tienda.gt', '2022-03-01'),
  ('Héctor',   'Cabrera', 'Gerente',  'hector.c@tienda.gt',   '2020-11-01');

INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES
  ('Carlos',   'Mendoza', 'carlos.m@email.com', '50001001', 'Zona 1, Guatemala'),
  ('María',    'López',   'maria.l@email.com',  '50001002', 'Zona 10, Guatemala'),
  ('Juan',     'Pérez',   'juan.p@email.com',   '50001003', 'Zona 4, Guatemala'),
  ('Ana',      'García',  'ana.g@email.com',    '50001004', 'Mixco, Guatemala'),
  ('Luis',     'Ramírez', 'luis.r@email.com',   '50001005', 'Villa Nueva');

INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, id_proveedor) VALUES
  ('Laptop 15"',        'Laptop core i5 8GB RAM',         4500.00, 15, 1, 1),
  ('Mouse inalámbrico', 'Mouse ergonómico USB',             120.00, 50, 1, 1),
  ('Teclado mecánico',  'Teclado RGB switches azules',      350.00, 30, 1, 1),
  ('Monitor 24"',       'Monitor Full HD IPS',             1800.00, 20, 1, 1),
  ('Audífonos BT',      'Audífonos bluetooth',              650.00, 25, 1, 1),
  ('Camiseta M',        'Camiseta algodón 100%',             45.00,200, 2, 2),
  ('Camiseta L',        'Camiseta algodón 100%',             45.00,180, 2, 2),
  ('Jeans slim',        'Pantalón denim corte slim',         185.00,100, 2, 2),
  ('Sudadera hoodie',   'Sudadera con capucha unisex',       220.00, 80, 2, 2),
  ('Calcetines pack 3', 'Pack 3 pares calcetines',           55.00,300, 2, 2),
  ('Arroz 5lb',         'Arroz blanco grano largo',          22.50,500, 3, 3),
  ('Frijoles 2lb',      'Frijoles negros secos',             18.00,400, 3, 3),
  ('Aceite 1L',         'Aceite vegetal de girasol',         32.00,300, 3, 3),
  ('Pasta 500g',        'Espagueti de trigo',                12.00,600, 3, 3),
  ('Salsa de tomate',   'Salsa de tomate natural 400g',      15.00,450, 3, 3),
  ('Lámpara de mesa',   'Lámpara LED regulable',            280.00, 40, 4, 4),
  ('Cojín decorativo',  'Cojín 40x40cm',                    65.00,120, 4, 4),
  ('Set de toallas',    'Set 3 toallas de baño',            150.00, 60, 4, 4),
  ('Olla 24cm',         'Olla de aluminio antiadherente',   320.00, 35, 4, 4),
  ('Cortinas blackout', 'Par de cortinas oscurecedoras',    420.00, 25, 4, 4),
  ('Pelota fútbol',     'Pelota oficial tamaño 5',          180.00, 70, 5, 5),
  ('Guantes boxeo',     'Guantes 12oz cuero sintético',     250.00, 45, 5, 5),
  ('Malla deportiva',   'Short deportivo dri-fit',           95.00,110, 5, 5),
  ('Botella 1L',        'Botella deportiva acero inox.',     85.00,150, 5, 5),
  ('Pesas 5kg par',     'Par de mancuernas 5kg',            380.00, 30, 5, 5);

INSERT INTO ventas (id_cliente, id_empleado, fecha, total, estado) VALUES
  (1, 1, '2026-04-01 10:30:00', 4620.00, 'completada'),
  (2, 2, '2026-04-05 11:00:00',  390.00, 'completada'),
  (3, 1, '2026-04-10 14:15:00',  185.00, 'completada'),
  (4, 2, '2026-04-15 09:45:00',  650.00, 'completada'),
  (5, 3, '2026-04-20 16:20:00',  560.00, 'completada');

INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
  (1, 1, 1, 4500.00, 4500.00),
  (1, 2, 1,  120.00,  120.00),
  (2, 6, 3,   45.00,  135.00),
  (2, 9, 1,  220.00,  220.00),
  (3, 8, 1,  185.00,  185.00),
  (4, 5, 1,  650.00,  650.00),
  (5, 3, 1,  350.00,  350.00),
  (5, 9, 1,  220.00,  220.00);

INSERT INTO usuarios (username, password_hash, rol, id_empleado) VALUES
  ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 3);
