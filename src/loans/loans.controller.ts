import { Controller, Get, Post, Patch, Param, ParseUUIDPipe, Body, Query } from '@nestjs/common';
import { LoansService } from './loans.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Post('create')
  createLoan(
    @Body('userId', ParseUUIDPipe) userId: string,
    @Body('bookId', ParseUUIDPipe) bookId: string,
    @Body('daysForLoan') daysForLoan?: number
  ) {
    return this.loansService.createLoan(userId, bookId, daysForLoan);
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Get()
  findAll() {
    return this.loansService.findAll();
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Get('active')
  findActiveLoans() {
    return this.loansService.findActiveLoans();
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Get('overdue')
  findOverdueLoans() {
    return this.loansService.findOverdueLoans();
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Get('stats')
  getLoanStats() {
    return this.loansService.getLoanStats();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.loansService.findByUserId(userId);
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Patch(':loanId/return')
  returnLoan(@Param('loanId', ParseUUIDPipe) loanId: string) {
    return this.loansService.returnLoan(loanId);
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Patch(':loanId/renew')
  renewLoan(
    @Param('loanId', ParseUUIDPipe) loanId: string,
    @Body('additionalDays') additionalDays?: number
  ) {
    return this.loansService.renewLoan(loanId, additionalDays);
  }
}