const express = require('express');
const router = express.Router();
const Comentario = require('../models/comentario');
const { body, validationResult } = require('express-validator'); // Para validación y sanitización
const rateLimit = require('express-rate-limit'); // Para limitar peticiones

// ==========================================
// 1.1 CONFIGURACIÓN DE RATE LIMIT (Punto 1.1)
// Limita a 10 peticiones por minuto por dirección IP
// ==========================================
const comentarioLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, 
  message: { error: 'Demasiados comentarios. Por favor, intenta de nuevo en un minuto.' }
});

// ==========================================
// 1.2 & 1.3 VALIDACIÓN Y SANITIZACIÓN (Puntos 1.2 y 1.3)
// ==========================================
const validarComentario = [
  body('texto')
    .trim()           // Elimina espacios vacíos al inicio y final
    .escape()         // SANITIZACIÓN: Convierte caracteres peligrosos en texto seguro
    .notEmpty().withMessage('El comentario no puede estar vacío')
    .isLength({ max: 200 }).withMessage('El comentario no puede tener más de 200 caracteres')
];

// ==========================================
// RUTA CORREGIDA: Se usa '/' porque el prefijo
// '/comentarios' ya viene desde el index.js
// ==========================================
router.post('/', comentarioLimiter, validarComentario, async (req, res) => {
    // Verificar si las validaciones encontraron errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errors: errores.array() });
    }

    try {
        const nuevoComentario = new Comentario({
            texto: req.body.texto
        });
        await nuevoComentario.save();
        
        // Enviamos el objeto guardado de vuelta al frontend
        res.status(201).json(nuevoComentario);
    } catch (error) {
        console.error("Error en DB:", error);
        res.status(500).json({ error: 'Error al guardar el comentario en la base de datos' });
    }
});

module.exports = router;