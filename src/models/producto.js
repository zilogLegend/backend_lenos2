const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: String, required: true },
    promo: { type: String },
    categoria: { type: String },
    imagen: { type: String }
});

module.exports = mongoose.models.Producto || mongoose.model('Producto', productoSchema);