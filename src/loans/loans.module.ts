import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { Loan } from './entities/loan.entity';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';

@Module({
  controllers: [LoansController],
  providers: [LoansService],
  imports: [TypeOrmModule.forFeature([Loan, User, Book])],
  exports: [TypeOrmModule, LoansService]
})
export class LoansModule {}