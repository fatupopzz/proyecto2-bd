const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

// POST /auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });

  try {
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1 AND activo = TRUE",
      [username],
    );
    const user = rows[0];
    if (!user)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    const token = jwt.sign(
      { id: user.id_usuario, username: user.username, rol: user.rol },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "8h" },
    );
    res.json({ token, rol: user.rol, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
