import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindBooksDto } from './dto/find-books.dto';
import { Public, Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Public()
  @Get()
  findAll(@Query() findBooksDto: FindBooksDto) {
    const { page, limit, search, available, author, category } = findBooksDto;
    return this.booksService.findAll(
      { page, limit },
      {
        search,
        available: available ? 'true' : undefined,
        genre: category,
        author,
      },
    );
  }

  @Public()
  @Get('available')
  findAvailable(@Query() findBooksDto: FindBooksDto) {
    const { page, limit } = findBooksDto;
    return this.booksService.findAvailable({ page, limit });
  }

  @Public()
  @Get('isbn/:isbn')
  findByISBN(@Param('isbn') isbn: string) {
    return this.booksService.findByISBN(isbn);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Patch(':id/borrow')
  borrowBook(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.borrowBook(id);
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Patch(':id/return')
  returnBook(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.returnBook(id);
  }

  @Auth(ValidRoles.admin, ValidRoles.librarian)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.remove(id);
  }
}
