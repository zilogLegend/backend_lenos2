const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function createUsuario({ email, password, nombre }) {
  // Encriptamos la contraseña (Ejercicio 2.1)
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Creamos el usuario usando email
  const usuario = new Usuario({ 
    email, 
    password: hashedPassword,
    nombre: nombre || 'Cliente Leños' 
  });
  
  return await usuario.save();
}

async function loginUsuario({ email, password }) {
  // Buscamos por email
  const usuario = await Usuario.findOne({ email });
  if (!usuario) throw new Error('Usuario no encontrado!');

  // Comparamos contraseñas con Bcrypt
  const isPasswordCorrect = await bcrypt.compare(password, usuario.password);
  if (!isPasswordCorrect) throw new Error('Contraseña inválida!');

  // Generamos el Token JWT (Ejercicio 2.2)
  const token = jwt.sign(
    { sub: usuario._id, email: usuario.email }, 
    process.env.JWT_SECRET || 'desweb', 
    { expiresIn: '24h' }
  );
  
  return token;
}

// Exportamos las funciones corregidas
module.exports = { createUsuario, loginUsuario };