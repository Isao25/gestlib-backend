#!/bin/bash

echo "📝 Visualizador de logs del sistema"
echo ""
echo "Selecciona qué logs quieres ver:"
echo "1) Todos los servicios (tiempo real)"
echo "2) Solo backend (tiempo real)"
echo "3) Solo PostgreSQL (tiempo real)"
echo "4) Solo PgAdmin (tiempo real)"
echo "5) Backend - últimas 50 líneas"
echo "6) Estado de contenedores"
echo "7) Salir"
echo ""
read -p "Opción (1-7): " option

case $option in
    1)
        echo "📋 Mostrando logs de todos los servicios (Ctrl+C para salir)..."
        docker compose logs -f --timestamps
        ;;
    2)
        echo "📋 Mostrando logs del backend (Ctrl+C para salir)..."
        docker compose logs -f --timestamps backend
        ;;
    3)
        echo "📋 Mostrando logs de PostgreSQL (Ctrl+C para salir)..."
        docker compose logs -f --timestamps postgres
        ;;
    4)
        echo "📋 Mostrando logs de PgAdmin (Ctrl+C para salir)..."
        docker compose logs -f --timestamps pgadmin
        ;;
    5)
        echo "📋 Últimas 50 líneas del backend:"
        docker compose logs --tail=50 backend
        ;;
    6)
        echo "📋 Estado actual de contenedores:"
        docker compose ps
        echo ""
        echo "📊 Uso de recursos:"
        docker stats --no-stream
        ;;
    7)
        echo "👋 ¡Hasta luego!"
        exit 0
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac