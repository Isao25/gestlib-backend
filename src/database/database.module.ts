import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseSeederService } from './database-seeder.service';
import { BooksSeederService } from './books-seeder.service';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [UsersModule, BooksModule, ConfigModule],
  providers: [DatabaseSeederService, BooksSeederService],
  exports: [DatabaseSeederService, BooksSeederService],
})
export class DatabaseModule {}