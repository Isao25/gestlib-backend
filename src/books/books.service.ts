import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookStatus } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      // Verificar si ya existe un libro con el mismo ISBN
      const existingBook = await this.bookRepository.findOne({
        where: { isbn: createBookDto.isbn }
      });

      if (existingBook) {
        throw new BadRequestException('Ya existe un libro con este ISBN');
      }

      // Si no se especifican las copias, usar valores por defecto
      const bookData = {
        ...createBookDto,
        publishedDate: new Date(createBookDto.publishedDate),
        totalCopies: createBookDto.totalCopies || 1,
        availableCopies: createBookDto.availableCopies || createBookDto.totalCopies || 1,
        status: createBookDto.status || BookStatus.AVAILABLE
      };

      const book = this.bookRepository.create(bookData);
      return await this.bookRepository.save(book);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(): Promise<Book[]> {
    try {
      return await this.bookRepository.find({
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id }
    });

    if (!book) {
      throw new NotFoundException(`Libro con ID "${id}" no encontrado`);
    }

    return book;
  }

  async findByISBN(isbn: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { isbn }
    });

    if (!book) {
      throw new NotFoundException(`Libro con ISBN "${isbn}" no encontrado`);
    }

    return book;
  }

  async findAvailable(): Promise<Book[]> {
    return await this.bookRepository.find({
      where: { 
        status: BookStatus.AVAILABLE,
        availableCopies: MoreThan(0)
      },
      order: { title: 'ASC' }
    });
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    try {
      // Si se actualiza el ISBN, verificar que no exista otro libro con ese ISBN
      if (updateBookDto.isbn && updateBookDto.isbn !== book.isbn) {
        const existingBook = await this.bookRepository.findOne({
          where: { isbn: updateBookDto.isbn }
        });

        if (existingBook) {
          throw new BadRequestException('Ya existe un libro con este ISBN');
        }
      }

      // Si se actualiza la fecha, convertir a Date
      const updateData = {
        ...updateBookDto,
        ...(updateBookDto.publishedDate && { publishedDate: new Date(updateBookDto.publishedDate) })
      };

      await this.bookRepository.update(id, updateData);
      return await this.findOne(id);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);

    try {
      await this.bookRepository.remove(book);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async borrowBook(id: string): Promise<Book> {
    const book = await this.findOne(id);

    if (book.availableCopies <= 0) {
      throw new BadRequestException('No hay copias disponibles para préstamo');
    }

    book.availableCopies -= 1;
    
    // Si no quedan copias disponibles, cambiar estado
    if (book.availableCopies === 0) {
      book.status = BookStatus.BORROWED;
    }

    return await this.bookRepository.save(book);
  }

  async returnBook(id: string): Promise<Book> {
    const book = await this.findOne(id);

    if (book.availableCopies >= book.totalCopies) {
      throw new BadRequestException('Todas las copias ya están disponibles');
    }

    book.availableCopies += 1;
    book.status = BookStatus.AVAILABLE;

    return await this.bookRepository.save(book);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    throw new InternalServerErrorException('Error interno del servidor');
  }
}
