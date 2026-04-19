const router = require("express").Router();
const pool = require("../db/pool");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM proveedores ORDER BY nombre",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
});

module.exports = router;
