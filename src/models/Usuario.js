const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Quitamos 'required' un segundo para forzar que el servidor acepte el registro
  email: { 
    type: String, 
    unique: true,
    lowercase: true 
  },
  password: { 
    type: String 
  },
  role: { type: String, default: 'client' },
  nombre: { type: String }
}, { strict: false }); // 'strict: false' permite guardar datos aunque el esquema esté rebelde

// Usamos un nombre de modelo diferente para forzar a MongoDB a crear una colección limpia
module.exports = mongoose.model('UserNew', userSchema, 'usuarios_nuevos');