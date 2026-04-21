const express = require('express');
const router = express.Router();
const leñoController = require('../controllers/leñoController');

router.post('/', leñoController.crearPedido);
router.get('/', leñoController.obtenerPedidos);
router.patch('/:id', leñoController.actualizarEstado);
router.delete('/:id', leñoController.borrarPedido);

module.exports = router;