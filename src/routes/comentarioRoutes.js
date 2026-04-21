const express = require('express');
const router = express.Router();
const Comentario = require('../models/comentario');

// Ruta para recibir el comentario
router.post('/comentarios', async (req, res) => {
    try {
        const nuevoComentario = new Comentario({
            texto: req.body.texto
        });
        await nuevoComentario.save();
        res.status(201).json(nuevoComentario);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el comentario' });
    }
});

module.exports = router;