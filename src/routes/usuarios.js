const express = require('express');
const router = express.Router();
const { createUsuario, loginUsuario } = require('../services/usuarios');

// Ruta para registro (Punto 4.1 de la rúbrica)
router.post('/signup', async (req, res) => {
  try {
    const usuario = await createUsuario(req.body);
    res.status(201).json({ username: usuario.username });
  } catch (err) {
    res.status(400).json({ error: 'Fallo al crear el usuario' });
  }
});

// Ruta para login (Punto 4.1 de la rúbrica)
router.post('/login', async (req, res) => {
  try {
    const token = await loginUsuario(req.body);
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Login Falló' });
  }
});

module.exports = router;