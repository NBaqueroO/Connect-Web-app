import express from "express";
import dotenv from "dotenv";
import { db } from "./db";

dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.post("/usuarios", async (req, res) => {
  const {
    nombre_completo,
    correo,
    telefono,
    contrasena,
    rol,
    linkedin,
    fecha_nacimiento,
    edad,
    descripcion,
    intereses,
    embedding_facial,
  } = req.body;

  try {
    await db.query(
      `
      INSERT INTO usuarios 
      (nombre_completo, correo, telefono, contrasena, rol, linkedin, fecha_nacimiento, edad, descripcion, intereses, embedding_facial)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_completo,
        correo,
        telefono,
        contrasena,
        rol,
        linkedin,
        fecha_nacimiento,
        edad,
        descripcion,
        intereses,
        embedding_facial,
      ]
    );

    res.status(201).json({ message: "Usuario creado" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear usuario", details: error });
  }
});

app.post("/eventos", async (req, res) => {
  const { nombre, descripcion, fecha } = req.body;

  try {
    await db.query(
      "INSERT INTO eventos (nombre, descripcion, fecha) VALUES (?, ?, ?)",
      [nombre, descripcion, fecha]
    );
    res.status(201).json({ message: "Evento creado" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear evento", details: error });
  }
});

app.post("/usuarios/:usuarioId/eventos/:eventoId", async (req, res) => {
  const { usuarioId, eventoId } = req.params;

  try {
    await db.query(
      "INSERT INTO usuario_evento (usuario_id, evento_id) VALUES (?, ?)",
      [usuarioId, eventoId]
    );
    res.json({ message: "Usuario asociado al evento" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al asociar usuario y evento", details: error });
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    const [usuarios] = await db.query(`
      SELECT u.*, GROUP_CONCAT(e.nombre) AS eventos
      FROM usuarios u
      LEFT JOIN usuario_evento ue ON u.id = ue.usuario_id
      LEFT JOIN eventos e ON ue.evento_id = e.id
      GROUP BY u.id`);

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios", details: error });
  }
});

app.get("/eventos", async (req, res) => {
  try {
    const [eventos] = await db.query(`
      SELECT e.*, GROUP_CONCAT(u.nombre_completo) AS usuarios
      FROM eventos e
      LEFT JOIN usuario_evento ue ON e.id = ue.evento_id
      LEFT JOIN usuarios u ON ue.usuario_id = u.id
      GROUP BY e.id`);

    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener eventos", details: error });
  }
});


// Definición de rutas y middleware aquí

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  });
}

export default app;