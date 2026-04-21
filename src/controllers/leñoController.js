const Pedido = require('../models/leño');

exports.crearPedido = async (req, res) => {
    try {
        const nuevoPedido = new Pedido(req.body);
        await nuevoPedido.save();
        res.status(201).json(nuevoPedido);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

exports.obtenerPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find().sort({ fecha: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

exports.actualizarEstado = async (req, res) => {
    try {
        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            req.params.id, 
            { estado: 'Validado' }, // Cambia el estado al hacer clic
            { new: true }
        );
        res.json(pedidoActualizado);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

exports.borrarPedido = async (req, res) => {
    try {
        await Pedido.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Pedido eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};