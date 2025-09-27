# Usa una imagen base de Node.js
FROM node:20-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci && npm cache clean --force

# Copia el resto del código fuente
COPY . .

# Construye la aplicación
RUN npm run build

# Elimina devDependencies después del build para reducir tamaño
RUN npm prune --production

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD ["npm", "run", "start:prod"]