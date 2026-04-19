require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

//ruta de autenticacion
app.use("/auth", require("./routes/auth"));

//ruta de productos
app.use("/productos", require("./routes/productos"));

//rutas de ventas
app.use("/ventas", require("./routes/ventas"));

//rutas de cliente
app.use("/clientes", require("./routes/clientes"));

app.use("/categorias", require("./routes/categorias"));
app.use("/proveedores", require("./routes/proveedores"));
app.use("/empleados", require("./routes/empleados"));

//ruta de reportes
app.use("/reportes", require("./routes/reportes"));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
