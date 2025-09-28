<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 📚 Sistema de Gestión de Biblioteca - Backend

API REST desarrollada con NestJS para gestión completa de biblioteca con autenticación JWT y sistema de préstamos.

## 🚀 Características

- ✅ **Autenticación JWT** con roles (admin, bibliotecario, usuario)
- 📖 **Gestión de libros** con inventario automático
- 👥 **Gestión de usuarios** con diferentes roles
- 📋 **Sistema de préstamos** con control automático de inventario
- 🐘 **PostgreSQL 17** con TypeORM
- 🐳 **Dockerizado** con docker-compose
- 🌱 **Seeder automático** para usuarios iniciales
- 🔒 **Seguridad** con variables de entorno

## 🛠️ Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd gestlib-backend
```

2. **Iniciar el sistema**
```bash
./start.sh
```

El sistema creará automáticamente:
- Base de datos PostgreSQL
- Backend NestJS
- Usuarios iniciales
- Interfaz PgAdmin

## 🌐 Acceso al Sistema

- **Backend API**: http://localhost:3000
- **PgAdmin**: http://localhost:5050
- **Base de datos**: localhost:5432

## 👤 Usuarios Iniciales

El sistema crea automáticamente estos usuarios:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Usuario | usuario@biblioteca.com | User123! |

## 📖 Desarrollo

```bash
# Modo desarrollo (con hot reload)
./dev.sh

# Ver logs interactivamente
./logs.sh
```

## 📝 Visualización de Logs

### Opciones rápidas de logs:
```bash
# Ver logs de todos los servicios en tiempo real
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Ver logs con timestamps
docker compose logs -f --timestamps backend

# Ver últimas 50 líneas
docker compose logs --tail=50 backend
```

### Script interactivo:
```bash
./logs.sh
```

El script `logs.sh` te permite elegir entre diferentes opciones de visualización de logs de forma interactiva.

## 🔧 Comandos Útiles

```bash
# Parar servicios (conservando datos)
docker compose down

# Reinicio completo (elimina todos los datos)
docker compose down -v && ./start.sh

# Ver estado de contenedores
docker compose ps

# Conectar a PostgreSQL directamente
docker compose exec postgres psql -U biblioteca_admin -d biblioteca_sistema_db
```

## 📋 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PATCH /api/users/:id` - Actualizar usuario

### Libros
- `GET /api/books` - Listar libros
- `POST /api/books` - Crear libro
- `GET /api/books/:id` - Obtener libro
- `PATCH /api/books/:id` - Actualizar libro

### Préstamos
- `GET /api/loans` - Listar préstamos
- `POST /api/loans/create` - Crear préstamo
- `PATCH /api/loans/:id/return` - Devolver libro
- `GET /api/loans/overdue` - Préstamos vencidos

## 🏗️ Arquitectura

```
src/
├── auth/           # Autenticación JWT
├── users/          # Gestión de usuarios
├── books/          # Gestión de libros
├── loans/          # Sistema de préstamos
└── database/       # Seeder automático
```

## 🔒 Variables de Entorno

El archivo `.env` contiene todas las configuraciones necesarias:
- Credenciales de base de datos
- Configuración JWT
- Usuarios iniciales
- PgAdmin credentials

## 📚 Tecnologías

- **NestJS 11** - Framework backend
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL 17** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **Docker** - Containerización
