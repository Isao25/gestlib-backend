import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { BooksSeederService } from './books-seeder.service';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly booksSeederService: BooksSeederService,
  ) {}

  async onApplicationBootstrap() {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log('🌱 Starting database seeding...');

      try {
        await this.seedUsers();
        await this.seedBooks();
        this.logger.log('✅ Database seeding completed successfully');
      } catch (error) {
        this.logger.error('❌ Database seeding failed:', error);
      }
    }
  }

  private async seedUsers() {
    try {
      // Check if admin user already exists
      const existingAdmin = await this.usersService.findByEmailSafe('admin@gestlib.com');
      if (existingAdmin) {
        this.logger.log('👤 Admin user already exists, skipping user seeding');
        return;
      }

      // Create admin user
      await this.usersService.create({
        name: 'Administrator',
        surname: 'System',
        email: 'admin@gestlib.com',
        password: 'Admin123!',
        role: ValidRoles.admin,
      });

      // Create regular user
      await this.usersService.create({
        name: 'Juan',
        surname: 'Pérez',
        email: 'juan.perez@student.unmsm.edu.pe',
        password: 'Student123!',
        role: ValidRoles.user,
      });

      // Create librarian user
      await this.usersService.create({
        name: 'María',
        surname: 'García',
        email: 'maria.garcia@unmsm.edu.pe',
        password: 'Librarian123!',
        role: ValidRoles.admin,
      });

      this.logger.log('👥 Users seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed users:', error);
      throw error;
    }
  }

  private async seedBooks() {
    try {
      await this.booksSeederService.seedFromCSV();
      this.logger.log('� Books seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed books:', error);
      throw error;
    }
  }
}
