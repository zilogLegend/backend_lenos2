const express = require('express');
const router = express.Router();
// Importamos las funciones del servicio
const { createUsuario, loginUsuario } = require('../services/usuarios');

/**
 * RUTA PARA REGISTRO (Signup)
 * Punto 4.1 de la rúbrica
 */
router.post('/signup', async (req, res) => {
    try {
        // createUsuario ahora espera un objeto con { email, password, ... }
        const usuario = await createUsuario(req.body);
        res.status(201).json({ 
            mensaje: 'Usuario creado exitosamente',
            email: usuario.email 
        });
    } catch (err) {
        res.status(400).json({ 
            error: 'Fallo al crear el usuario',
            detalle: err.message 
        });
    }
});

/**
 * RUTA PARA LOGIN
 * Punto 4.1 de la rúbrica - Aquí se genera el TOKEN
 */
router.post('/login', async (req, res) => {
    try {
        // Enviamos el req.body que debe traer { email, password }
        const token = await loginUsuario(req.body);
        
        // Si el login es correcto, devolvemos el token JWT
        res.status(200).json({ 
            token: token 
        });
    } catch (err) {
        // Si hay error en Bcrypt o el usuario no existe
        res.status(400).json({ 
            error: 'Login Falló',
            detalle: 'Credenciales inválidas' 
        });
    }
});

module.exports = router;