#!/bin/bash

echo "🚀 Iniciando sistema de gestión de biblioteca..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Parar contenedores anteriores (SIN eliminar datos)
echo "⏸️  Parando contenedores (conservando datos)..."
docker compose down 2>/dev/null || true

# Construir y levantar los servicios
echo "🔨 Construyendo y levantando servicios..."
docker compose up --build -d

# Verificar que los servicios estén corriendo
echo "⏳ Esperando que los servicios inicien..."
sleep 10

# Verificar estado de los contenedores
echo "📋 Estado de los servicios:"
docker compose ps

# Verificar logs del backend
echo "📝 Últimos logs del backend:"
docker compose logs backend --tail=20

echo ""
echo "✅ Sistema iniciado (MODO SEGURO - datos conservados)!"
echo "🌐 Backend: http://localhost:3000"
echo "🐘 PostgreSQL: localhost:5432"
echo "🔧 PgAdmin: http://localhost:5050"
echo ""
echo "📚 Credenciales PgAdmin:"
echo "Email: admin@gestlib.com"
echo "Password: PgAdmin_S3cur3_P4ss_2025!"
echo ""
echo "💡 Para reinicio completo: docker compose down -v && ./start.sh"