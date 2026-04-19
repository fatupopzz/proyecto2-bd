const router = require("express").Router();
const pool = require("../db/pool");
const { authMiddleware } = require("../middleware/auth");

// GET /reportes/clientes-activos — EXISTS (Subquery 1)
router.get("/clientes-activos", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id_cliente, c.nombre, c.apellido, c.email
      FROM clientes c
      WHERE EXISTS (
        SELECT 1 FROM ventas v
        WHERE v.id_cliente = c.id_cliente
          AND v.estado = 'completada'
      )
      ORDER BY c.apellido
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener clientes activos" });
  }
});

// GET /reportes/inventario-categorias — GROUP BY + HAVING + agregación
router.get("/inventario-categorias", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.nombre AS categoria,
             COUNT(p.id_producto)         AS total_productos,
             SUM(p.stock)                 AS stock_total,
             AVG(p.precio)::NUMERIC(10,2) AS precio_promedio,
             MAX(p.precio)                AS precio_max,
             MIN(p.precio)                AS precio_min
      FROM categorias c
      LEFT JOIN productos p ON c.id_categoria = p.id_categoria
      GROUP BY c.id_categoria, c.nombre
      HAVING COUNT(p.id_producto) > 0
      ORDER BY stock_total DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener inventario" });
  }
});

// GET /reportes/ranking-empleados — CTE con RANK()
router.get("/ranking-empleados", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH ventas_por_empleado AS (
        SELECT e.id_empleado,
               e.nombre || ' ' || e.apellido AS empleado,
               COUNT(v.id_venta)             AS total_ventas,
               COALESCE(SUM(v.total), 0)     AS monto_total
        FROM empleados e
        LEFT JOIN ventas v ON e.id_empleado = v.id_empleado
                           AND v.estado = 'completada'
        GROUP BY e.id_empleado, e.nombre, e.apellido
      )
      SELECT empleado, total_ventas, monto_total,
             RANK() OVER (ORDER BY monto_total DESC) AS ranking
      FROM ventas_por_empleado
      ORDER BY ranking
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ranking" });
  }
});

// GET /reportes/ventas-diarias — usa el VIEW
router.get("/ventas-diarias", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM reporte_ventas_diarias LIMIT 30",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ventas diarias" });
  }
});

// GET /reportes/ventas-diarias/csv — Export CSV
router.get("/ventas-diarias/csv", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM reporte_ventas_diarias LIMIT 30",
    );
    if (!rows.length) return res.status(404).json({ error: "Sin datos" });

    const headers = Object.keys(rows[0]);
    const lines = rows.map((r) => headers.map((h) => r[h] ?? "").join(","));
    const csv = [headers.join(","), ...lines].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ventas_diarias.csv"',
    );
    res.send("\uFEFF" + csv);
  } catch (err) {
    res.status(500).json({ error: "Error al generar CSV" });
  }
});

module.exports = router;
