const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
    texto: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comentario', comentarioSchema);