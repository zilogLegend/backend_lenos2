const express = require('express');
const router = express.Router();
const Comentario = require('../models/comentario');
const { body, validationResult } = require('express-validator'); // Para validación y sanitización
const rateLimit = require('express-rate-limit'); // Para limitar peticiones

// ==========================================
// 1.1 CONFIGURACIÓN DE RATE LIMIT (Punto 1.1)
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
    .trim()           
    .escape()         // Convierte <script> en texto seguro
    .notEmpty().withMessage('El comentario no puede estar vacío')
    .isLength({ max: 200 }).withMessage('El comentario no puede tener más de 200 caracteres')
];

// ==========================================
// RUTA CORREGIDA: POST /comentarios
// ==========================================
router.post('/', comentarioLimiter, validarComentario, async (req, res) => {
    console.log("📥 Petición recibida en /comentarios");

    // Verificar si las validaciones encontraron errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        console.log("❌ Error de validación:", errores.array());
        return res.status(400).json({ errors: errores.array() });
    }

    try {
        console.log("🧪 Texto sanitizado:", req.body.texto);

        const nuevoComentario = new Comentario({
            texto: req.body.texto
        });
        
        await nuevoComentario.save();
        
        console.log("✅ Comentario guardado en MongoDB Atlas");
        res.status(201).json(nuevoComentario);
    } catch (error) {
        console.error("❌ Error en DB:", error);
        res.status(500).json({ error: 'Error al guardar el comentario en la base de datos' });
    }
});

module.exports = router;