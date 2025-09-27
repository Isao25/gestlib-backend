import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('🌱 Iniciando seeder de base de datos...');
    await this.seedUsers();
  }

  private async seedUsers() {
    try {
      // Verificar si ya existe el usuario admin
      const adminEmail = this.configService.get('ADMIN_EMAIL') || 'admin@biblioteca.com';
      const existingAdmin = await this.usersService.findByEmailSafe(adminEmail);

      if (existingAdmin) {
        this.logger.log('✅ Los usuarios ya existen en la base de datos');
        return;
      }

      this.logger.log('👥 Creando usuarios iniciales...');

      // Crear usuario admin
      await this.usersService.create({
        name: this.configService.get('ADMIN_NAME') || 'Admin',
        surname: this.configService.get('ADMIN_SURNAME') || 'Sistema',
        email: this.configService.get('ADMIN_EMAIL') || 'admin@biblioteca.com',
        password: this.configService.get('ADMIN_PASSWORD') || 'Admin123!',
        role: ValidRoles.admin,
        phone: '555-1001',
      });

      // Crear bibliotecario
      await this.usersService.create({
        name: this.configService.get('LIBRARIAN_NAME') || 'Bibliotecario',
        surname: this.configService.get('LIBRARIAN_SURNAME') || 'Principal',
        email: this.configService.get('LIBRARIAN_EMAIL') || 'bibliotecario@biblioteca.com',
        password: this.configService.get('LIBRARIAN_PASSWORD') || 'Librarian123!',
        role: ValidRoles.librarian,
        phone: '555-2001',
      });

      // Crear usuario normal
      await this.usersService.create({
        name: this.configService.get('USER_NAME') || 'Usuario',
        surname: this.configService.get('USER_SURNAME') || 'Prueba',
        email: this.configService.get('USER_EMAIL') || 'usuario@biblioteca.com',
        password: this.configService.get('USER_PASSWORD') || 'User123!',
        role: ValidRoles.user,
        phone: '555-3001',
      });

      this.logger.log('✅ Usuarios creados exitosamente:');
      this.logger.log(`👑 Admin: ${this.configService.get('ADMIN_EMAIL')}`);
      this.logger.log(`📚 Bibliotecario: ${this.configService.get('LIBRARIAN_EMAIL')}`);
      this.logger.log(`👤 Usuario: ${this.configService.get('USER_EMAIL')}`);

    } catch (error) {
      this.logger.error('❌ Error creando usuarios iniciales:', error.message);
    }
  }
}