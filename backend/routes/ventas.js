const router = require("express").Router();
const pool = require("../db/pool");
const { authMiddleware } = require("../middleware/auth");

// GET /ventas — JOIN cliente + empleado (JOIN 2)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT v.id_venta, v.fecha, v.total, v.estado,
             c.nombre || ' ' || c.apellido AS cliente,
             e.nombre || ' ' || e.apellido AS empleado,
             v.id_cliente, v.id_empleado
      FROM ventas v
      JOIN clientes  c ON v.id_cliente  = c.id_cliente
      JOIN empleados e ON v.id_empleado = e.id_empleado
      ORDER BY v.fecha DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener ventas" });
  }
});

// GET /ventas/:id/detalle — JOIN detalle + producto (JOIN 3)
router.get("/:id/detalle", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT dv.id_detalle, dv.cantidad, dv.precio_unitario, dv.subtotal,
             p.nombre AS producto, v.fecha AS fecha_venta, v.total, v.estado
      FROM detalle_venta dv
      JOIN productos p ON dv.id_producto = p.id_producto
      JOIN ventas    v ON dv.id_venta    = v.id_venta
      WHERE dv.id_venta = $1
    `,
      [req.params.id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener detalle" });
  }
});

// POST /ventas — TRANSACCIÓN EXPLÍCITA con ROLLBACK
router.post("/", authMiddleware, async (req, res) => {
  const { id_cliente, id_empleado, items } = req.body;
  if (!id_cliente || !id_empleado || !items?.length)
    return res.status(400).json({ error: "Faltan campos requeridos" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const itemsConPrecio = [];
    for (const item of items) {
      const { rows } = await client.query(
        "SELECT stock, precio FROM productos WHERE id_producto = $1 FOR UPDATE",
        [item.id_producto],
      );
      if (!rows[0]) throw new Error(`Producto ${item.id_producto} no existe`);
      if (rows[0].stock < item.cantidad)
        throw new Error(`Stock insuficiente para producto ${item.id_producto}`);
      itemsConPrecio.push({
        ...item,
        precio_unitario: parseFloat(rows[0].precio),
      });
    }

    const total = itemsConPrecio.reduce(
      (sum, i) => sum + i.cantidad * i.precio_unitario,
      0,
    );

    const { rows: ventaRows } = await client.query(
      `INSERT INTO ventas (id_cliente, id_empleado, total, estado)
       VALUES ($1, $2, $3, 'completada') RETURNING id_venta`,
      [id_cliente, id_empleado, total],
    );
    const id_venta = ventaRows[0].id_venta;

    for (const item of itemsConPrecio) {
      const subtotal = item.cantidad * item.precio_unitario;
      await client.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id_venta,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          subtotal,
        ],
      );
      await client.query(
        "UPDATE productos SET stock = stock - $1 WHERE id_producto = $2",
        [item.cantidad, item.id_producto],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ ok: true, id_venta, total });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ROLLBACK:", err.message);
    res.status(400).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
