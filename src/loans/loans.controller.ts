import { Controller, Get, Post, Patch, Param, ParseUUIDPipe, Body, Query } from '@nestjs/common';
import { LoansService } from './loans.service';
import { FindLoansDto } from './dto/find-loans.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Post('create')
  createLoan(
    @Body('userId', ParseUUIDPipe) userId: string,
    @Body('bookId', ParseUUIDPipe) bookId: string,
    @Body('daysForLoan') daysForLoan?: number,
  ) {
    return this.loansService.createLoan(userId, bookId, daysForLoan);
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Get()
  findAll(@Query() findLoansDto: FindLoansDto) {
    const { page, limit, status, userId, search } = findLoansDto;
    return this.loansService.findAll({ page, limit }, { status, userId, search });
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Get('active')
  findActiveLoans(@Query() findLoansDto: FindLoansDto) {
    const { page, limit } = findLoansDto;
    return this.loansService.findActiveLoans({ page, limit });
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Get('overdue')
  findOverdueLoans(@Query() findLoansDto: FindLoansDto) {
    const { page, limit } = findLoansDto;
    return this.loansService.findOverdueLoans({ page, limit });
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Get('stats')
  getLoanStats() {
    return this.loansService.getLoanStats();
  }

  @Get('user/:userId')
  findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.loansService.findByUserId(userId, paginationDto);
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
    @Body('additionalDays') additionalDays?: number,
  ) {
    return this.loansService.renewLoan(loanId, additionalDays);
  }
}
