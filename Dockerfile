# Usamos una imagen ligera de Node.js
FROM node:18-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos solo lo necesario para producción
RUN npm install --production

# Copiamos todo el código del backend
COPY . .

# Exponemos el puerto 3000 INTERNAMENTE
EXPOSE 3000

# Comando para arrancar
CMD ["node", "index.js"]