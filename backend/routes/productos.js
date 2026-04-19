const router = require("express").Router();
const pool = require("../db/pool");
const { authMiddleware, requireAdmin } = require("../middleware/auth");

// GET /productos — JOIN con categoría y proveedor (JOIN 1)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
             c.nombre AS categoria, pr.nombre AS proveedor,
             p.id_categoria, p.id_proveedor
      FROM productos p
      JOIN categorias  c  ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor  = pr.id_proveedor
      ORDER BY c.nombre, p.nombre
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// GET /productos/bajo-stock — subquery scalar (Subquery 2)
router.get("/bajo-stock", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.nombre, p.stock, p.precio, c.nombre AS categoria
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE p.stock < (SELECT AVG(stock) FROM productos)
      ORDER BY p.stock ASC
    `);
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al obtener productos con bajo stock" });
  }
});

// GET /productos/:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor
       FROM productos p
       JOIN categorias  c  ON p.id_categoria = c.id_categoria
       JOIN proveedores pr ON p.id_proveedor  = pr.id_proveedor
       WHERE p.id_producto = $1`,
      [req.params.id],
    );
    if (!rows[0])
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

// POST /productos
router.post("/", authMiddleware, requireAdmin, async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria, id_proveedor } =
    req.body;
  if (
    !nombre ||
    precio == null ||
    stock == null ||
    !id_categoria ||
    !id_proveedor
  )
    return res.status(400).json({ error: "Faltan campos requeridos" });

  try {
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, id_proveedor)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, descripcion, precio, stock, id_categoria, id_proveedor],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// PUT /productos/:id
router.put("/:id", authMiddleware, requireAdmin, async (req, res) => {
  const { nombre, descripcion, precio, stock, id_categoria, id_proveedor } =
    req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE productos
       SET nombre=$1, descripcion=$2, precio=$3, stock=$4,
           id_categoria=$5, id_proveedor=$6
       WHERE id_producto=$7 RETURNING *`,
      [
        nombre,
        descripcion,
        precio,
        stock,
        id_categoria,
        id_proveedor,
        req.params.id,
      ],
    );
    if (!rows[0])
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// DELETE /productos/:id
router.delete("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM productos WHERE id_producto = $1",
      [req.params.id],
    );
    if (!rowCount)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

module.exports = router;
