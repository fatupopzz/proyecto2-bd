const router = require("express").Router();
const pool = require("../db/pool");
const { authMiddleware, requireAdmin } = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM clientes ORDER BY apellido, nombre",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM clientes WHERE id_cliente = $1",
      [req.params.id],
    );
    if (!rows[0])
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener cliente" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { nombre, apellido, email, telefono, direccion } = req.body;
  if (!nombre || !apellido)
    return res.status(400).json({ error: "Nombre y apellido son requeridos" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO clientes (nombre, apellido, email, telefono, direccion)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre, apellido, email, telefono, direccion],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "El email ya está registrado" });
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { nombre, apellido, email, telefono, direccion } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE clientes SET nombre=$1, apellido=$2, email=$3,
       telefono=$4, direccion=$5 WHERE id_cliente=$6 RETURNING *`,
      [nombre, apellido, email, telefono, direccion, req.params.id],
    );
    if (!rows[0])
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

router.delete("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM clientes WHERE id_cliente = $1",
      [req.params.id],
    );
    if (!rowCount)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
});

module.exports = router;
