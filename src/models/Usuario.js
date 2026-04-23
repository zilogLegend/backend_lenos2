const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, // Convierte todo a minúsculas automáticamente
    trim: true      // Quita espacios en blanco accidentales
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'client' 
  },
  nombre: { 
    type: String 
  }
});

// Forzamos a que el modelo use la colección 'usuarios' (en plural) para evitar conflictos
module.exports = mongoose.model('Usuario', userSchema, 'usuarios');