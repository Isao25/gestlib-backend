# Usa una imagen base de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm ci --only=production && npm cache clean --force

# Copia el resto del código fuente
COPY . .

# Construye la aplicación
RUN npm run build

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD ["npm", "run", "start:prod"]