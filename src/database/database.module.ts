import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseSeederService } from './database-seeder.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, ConfigModule],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}