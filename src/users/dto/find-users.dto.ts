import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ValidRoles } from '../../auth/interfaces/valid-roles';

export class FindUsersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ValidRoles)
  role?: ValidRoles;

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsString()
  search?: string;
}