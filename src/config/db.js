const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // Cambiamos el mensaje para saber si es Atlas o Local
        const url = `${mongoose.connection.host}:${mongoose.connection.port}`;
        console.log(`✅ MongoDB Conectado en: ${url}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = conectarDB;