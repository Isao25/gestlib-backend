#!/bin/bash

echo "🛠️  Iniciando en modo DESARROLLO..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Parar contenedores anteriores (conservando datos)
echo "⏸️  Parando contenedores anteriores..."
docker compose down 2>/dev/null || true

# Solo levantar PostgreSQL y PgAdmin para desarrollo
echo "🐘 Levantando solo PostgreSQL y PgAdmin..."
docker compose up -d postgres pgadmin

echo "⏳ Esperando que PostgreSQL inicie..."
sleep 5

echo "✅ Base de datos lista!"
echo ""
echo "🔧 Ahora puedes ejecutar el backend localmente:"
echo "npm run start:dev"
echo ""
echo "🌐 Servicios disponibles:"
echo "🐘 PostgreSQL: localhost:5432"
echo "🔧 PgAdmin: http://localhost:5050"