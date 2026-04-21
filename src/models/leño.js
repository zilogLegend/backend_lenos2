const mongoose = require('mongoose');

const leñoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellidos: { type: String, required: true },
    telefono: { type: String, required: true },
    direccion: { type: String, required: true },
    items: [{
        leñoTipo: { type: String, required: true },
        cantidad: { type: Number, required: true }
    }],
    totalPagar: { type: Number, default: 0 },
    // Campo necesario para que los botones de la tabla funcionen
    estado: { type: String, default: 'Nuevo' }, 
    fecha: { type: Date, default: Date.now }
});

// Evita errores de re-declaración en desarrollo
module.exports = mongoose.models.Pedido || mongoose.model('Pedido', leñoSchema);