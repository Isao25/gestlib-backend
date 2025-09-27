import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ParseBoolPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('role') role?: ValidRoles, @Query('active') active?: string) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    if (active === 'true') {
      return this.usersService.findActiveUsers();
    }
    return this.usersService.findAll();
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean
  ) {
    return this.usersService.changeUserStatus(id, isActive);
  }

  @Patch(':id/role')
  changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: ValidRoles
  ) {
    return this.usersService.changeUserRole(id, role);
  }

  @Patch(':id/reset-password')
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.usersService.resetPassword(id, newPassword);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
