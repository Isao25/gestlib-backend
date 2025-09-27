import { IsString, IsOptional, IsDateString, IsInt, Min, IsEnum, MinLength, MaxLength } from 'class-validator';
import { BookStatus } from '../entities/book.entity';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  isbn: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  author: string;

  @IsDateString()
  publishedDate: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalCopies?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  availableCopies?: number;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;
}
