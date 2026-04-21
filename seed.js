const mongoose = require('mongoose');
const Producto = require('./src/models/producto'); // ¡ESTA ES LA CLAVE!
require('dotenv').config();

const productosIniciales = [
  { nombre: "Leño de Carne Ahumada", precio: "$25.00", promo: "$19.99", categoria: "Leños rellenos", imagen: "https://images.pexels.com/photos/361184/pexels-photo-361184.jpeg" },
  { nombre: "Leño de Pollo al Pesto", precio: "$22.00", promo: "-", categoria: "Leños rellenos", imagen: "https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg" },
  { nombre: "Leño BBQ Texas", precio: "$28.00", promo: "$24.00", categoria: "Leños rellenos", imagen: "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg" },
  { nombre: "Leño Sabor Salchicha", precio: "$18.00", promo: "-", categoria: "Leños rellenos", imagen: "https://images.pexels.com/photos/929137/pexels-photo-929137.jpeg" },
  { nombre: "Leños Sabor Arrachera", precio: "$30.00", promo: "-", categoria: "Leños rellenos", imagen: "https://images.pexels.com/photos/618491/pexels-photo-618491.jpeg" },
  { nombre: "Leños Sabor Pollo", precio: "$20.00", promo: "-", categoria: "Leños rellenos", imagen: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a Atlas para poblar el menú...");
    
    // Limpiamos la colección de productos, no la de pedidos
    await Producto.deleteMany({}); 
    await Producto.insertMany(productosIniciales);
    
    console.log("✅ ¡Menú de Leños Rellenos actualizado en la nube!");
    process.exit();
  } catch (err) {
    console.error("❌ Error al poblar la DB:", err);
    process.exit(1);
  }
};

seedDB();