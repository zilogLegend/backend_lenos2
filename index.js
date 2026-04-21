const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const helmet = require('helmet'); // Importado para seguridad de cabeceras
require('dotenv').config();
const comentarioRoutes = require('./src/routes/comentarioRoutes');
app.use('/api', comentarioRoutes);
const app = express();

// ============ CONFIGURACIÓN DE SEGURIDAD ============

// 1. Helmet: Protege la app configurando varias cabeceras HTTP (oculta que usas Express, evita XSS, etc.)
app.use(helmet());

// 2. CORS Restringido: Solo permite peticiones desde tu frontend de Railway
const corsOptions = {
  origin: 'https://frontend-le-os-production.up.railway.app', // Tu URL de producción
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// ============ CONEXIÓN A BASE DE DATOS ============

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

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
        {
          email: 'DBamino11@gmail.com',
          password: hashedPassword,
          role: 'client',
          nombre: 'Cliente'
        },
        {
          email: 'DBamino12@gmail.com',
          password: hashedPassword,
          role: 'admin',
          nombre: 'Administrador'
        }
      ]);
      console.log('✅ Usuarios creados');
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

mongoose.connection.once('open', () => {
  seedUsers();
});

// ============ RUTAS ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Leños Rellenos API' });
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ detail: 'Usuario no encontrado' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ detail: 'Contraseña incorrecta' });
    }
    res.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        nombre: user.nombre
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Error del servidor' });
  }
});

// CREAR PEDIDO
app.post('/api/pedidos', async (req, res) => {
  try {
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();
    res.status(201).json({
      id: nuevoPedido._id,
      ...nuevoPedido.toObject()
    });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// OBTENER TODOS LOS PEDIDOS
app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fecha: -1 });
    const result = pedidos.map(p => ({
      id: p._id,
      nombre: p.nombre,
      apellidos: p.apellidos,
      telefono: p.telefono,
      direccion: p.direccion,
      items: p.items,
      totalPagar: p.totalPagar,
      estado: p.estado,
      userEmail: p.userEmail,
      fecha: p.fecha
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// OBTENER PEDIDO POR ID
app.get('/api/pedidos/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.json({
      id: pedido._id,
      nombre: pedido.nombre,
      apellidos: pedido.apellidos,
      telefono: pedido.telefono,
      direccion: pedido.direccion,
      items: pedido.items,
      totalPagar: pedido.totalPagar,
      estado: pedido.estado,
      userEmail: pedido.userEmail,
      fecha: pedido.fecha
    });
  } catch (error) {
    res.status(400).json({ mensaje: 'ID inválido' });
  }
});

// ACTUALIZAR ESTADO DEL PEDIDO
app.patch('/api/pedidos/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.json({
      id: pedido._id,
      nombre: pedido.nombre,
      apellidos: pedido.apellidos,
      telefono: pedido.telefono,
      direccion: pedido.direccion,
      items: pedido.items,
      totalPagar: pedido.totalPagar,
      estado: pedido.estado,
      userEmail: pedido.userEmail,
      fecha: pedido.fecha
    });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// ELIMINAR PEDIDO
app.delete('/api/pedidos/:id', async (req, res) => {
  try {
    const result = await Pedido.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.json({ mensaje: 'Pedido eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Endpoint Seguro para Comentarios
app.post('/comentarios', (req, res) => {
  const { texto } = req.body;
  console.log("Comentario recibido:", texto);
  res.json({ texto }); // Lo regresamos para probar el saneamiento en el frontend
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor con Helmet y CORS seguro en puerto ${PORT}`));