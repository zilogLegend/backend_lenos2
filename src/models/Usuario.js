const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
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

// Nota: El modelo se llama 'usuario' para que coincida con tu base de datos actual
module.exports = mongoose.model('usuario', userSchema);