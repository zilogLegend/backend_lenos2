const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
require('dotenv').config();

// 1. IMPORTAR RUTAS
const comentarioRoutes = require('./src/routes/comentarioRoutes');
const usuarioRoutes = require('./src/routes/usuarios'); // Nueva ruta de Práctica 2

// 2. INICIALIZAR APP
const app = express();

// ============ CONFIGURACIÓN DE SEGURIDAD ============

app.use(helmet());

const corsOptions = {
  origin: ['https://frontend-le-os-production.up.railway.app', 'http://localhost:5173'], // Añadido localhost para tus pruebas
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// ============ CONEXIÓN A BASE DE DATOS ============

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// ============ MODELOS EXISTENTES (Leños Rellenos) ============

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'client' },
  nombre: { type: String }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const pedidoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  telefono: { type: String },
  direccion: { type: String, required: true },
  items: [{
    lenoTipo: { type: String, required: true },
    cantidad: { type: Number, required: true }
  }],
  totalPagar: { type: Number, default: 0 },
  estado: { type: String, default: 'Pendiente' },
  userEmail: { type: String },
  fecha: { type: Date, default: Date.now }
});
const Pedido = mongoose.models.Pedido || mongoose.model('Pedido', pedidoSchema);

// ============ SEED DE USUARIOS ============
const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('12345', 10);
      await User.insertMany([
        { email: 'DBamino11@gmail.com', password: hashedPassword, role: 'client', nombre: 'Cliente' },
        { email: 'DBamino12@gmail.com', password: hashedPassword, role: 'admin', nombre: 'Administrador' }
      ]);
      console.log('✅ Usuarios de prueba creados');
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

mongoose.connection.once('open', () => {
  seedUsers();
});

// ============ RUTAS ============

// Nuevas rutas de la Práctica 2 (JWT & Usuarios)
app.use('/api/v1/usuario', usuarioRoutes); 

// Rutas de Leños Rellenos (Comentarios y Salud)
app.use('/api', comentarioRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Leños Rellenos API' });
});

// LOGIN ANTERIOR (Mantener por compatibilidad con el frontend actual)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ detail: 'Usuario no encontrado' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ detail: 'Contraseña incorrecta' });
    
    res.json({
      success: true,
      user: { email: user.email, role: user.role, nombre: user.nombre }
    });
  } catch (error) {
    res.status(500).json({ detail: 'Error del servidor' });
  }
});

// RUTAS DE PEDIDOS
app.post('/api/pedidos', async (req, res) => {
  try {
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();
    res.status(201).json({ id: nuevoPedido._id, ...nuevoPedido.toObject() });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fecha: -1 });
    res.json(pedidos.map(p => ({ id: p._id, ...p.toObject() })));
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// ============ ENCENDIDO DEL SERVIDOR ============

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en puerto ${PORT}`);
});