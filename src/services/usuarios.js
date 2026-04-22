const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function createUsuario({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const usuario = new Usuario({ username, password: hashedPassword });
  return await usuario.save();
}

async function loginUsuario({ username, password }) {
  const usuario = await Usuario.findOne({ username });
  if (!usuario) throw new Error('Nombre de Usuario Incorrecto!');

  const isPasswordCorrect = await bcrypt.compare(password, usuario.password);
  if (!isPasswordCorrect) throw new Error('Contraseña invalida!');

  const token = jwt.sign({ sub: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
  
  return token;
}

// ESTA LINEA ES LA MÁS IMPORTANTE PARA QUE NO DE ERROR
module.exports = { createUsuario, loginUsuario };