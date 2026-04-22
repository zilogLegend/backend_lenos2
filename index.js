const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
require('dotenv').config();

// 1. IMPORTAR RUTAS
const comentarioRoutes = require('./src/routes/comentarioRoutes');
const usuarioRoutes = require('./src/routes/usuarios');

// 2. INICIALIZAR APP
const app = express();

// ============ CONFIGURACIÓN DE SEGURIDAD (Capa 1) ============
app.use(helmet());

// AJUSTE DE CORS: Aseguramos que el Frontend tenga permiso de hablar con el Backend
const corsOptions = {
  origin: [
    'https://frontend-le-os-production.up.railway.app', 
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// ============ MIDDLEWARE API KEY (Capa 2 - Ejercicio 4.4) ============
const apiKeyMiddleware = (req, res, next) => {
  const clientApiKey = req.header('x-api-key');
  const masterApiKey = process.env.API_KEY_SECRET;

  if (clientApiKey && clientApiKey === masterApiKey) {
    next();
  } else {
    res.status(403).json({ 
      error: 'Acceso denegado', 
      detail: 'API Key inválida o ausente en los encabezados.' 
    });
  }
};

// ============ CONEXIÓN A BASE DE DATOS (Nube) ============
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Conectado (Cloud)'))
  .catch(err => console.error('❌ Error MongoDB Cloud:', err));

// ============ MODELOS ============
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

// Ruta pública de salud (Sin prefijo /api para prueba rápida)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Leños Rellenos API Cloud' });
});

// Rutas protegidas por API KEY (Simplificadas para producción)
app.use('/usuario', apiKeyMiddleware, usuarioRoutes); 
app.use('/comentarios', apiKeyMiddleware, comentarioRoutes);
app.use('/pedidos', apiKeyMiddleware, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fecha: -1 });
    res.json(pedidos.map(p => ({ id: p._id, ...p.toObject() })));
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Rutas específicas con protección
app.post('/auth/login', async (req, res) => {
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

// ============ ENCENDIDO DEL SERVIDOR ============
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor resiliente activo en puerto ${PORT}`);
});