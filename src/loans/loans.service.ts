import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Loan, LoanStatus } from './entities/loan.entity';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async createLoan(userId: string, bookId: string, daysForLoan: number = 15): Promise<Loan> {
    try {
      // Verificar que el usuario existe
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      if (!user.isActive) {
        throw new BadRequestException('El usuario está inactivo');
      }

      // Verificar que el libro existe y está disponible
      const book = await this.bookRepository.findOne({ where: { id: bookId } });
      if (!book) {
        throw new NotFoundException('Libro no encontrado');
      }

      if (book.availableCopies <= 0) {
        throw new BadRequestException('No hay copias disponibles de este libro');
      }

      // Verificar que el usuario no tenga préstamos vencidos
      const overdueLoans = await this.loanRepository.count({
        where: {
          userId,
          status: LoanStatus.OVERDUE,
        },
      });

      if (overdueLoans > 0) {
        throw new BadRequestException('El usuario tiene préstamos vencidos pendientes');
      }

      // Calcular fechas
      const loanDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(loanDate.getDate() + daysForLoan);

      // Crear el préstamo
      const loan = this.loanRepository.create({
        userId,
        bookId,
        loanDate,
        dueDate,
        status: LoanStatus.ACTIVE,
      });

      // Reducir copias disponibles del libro
      await this.bookRepository.update(bookId, {
        availableCopies: book.availableCopies - 1,
      });

      return await this.loanRepository.save(loan);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    filters: { status?: string; userId?: string; search?: string } = {},
  ): Promise<PaginatedResponse<Loan>> {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      const { status, userId, search } = filters;

      const queryBuilder = this.loanRepository
        .createQueryBuilder('loan')
        .leftJoinAndSelect('loan.user', 'user')
        .leftJoinAndSelect('loan.book', 'book');

      // Aplicar filtros
      if (status) {
        queryBuilder.andWhere('loan.status = :status', { status });
      }

      if (userId) {
        queryBuilder.andWhere('loan.userId = :userId', { userId });
      }

      if (search) {
        queryBuilder.andWhere(
          '(user.name ILIKE :search OR user.surname ILIKE :search OR book.title ILIKE :search OR book.author ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Paginación
      const skip = (page - 1) * limit;
      queryBuilder.orderBy('loan.createdAt', 'DESC').skip(skip).take(limit);

      const [loans, total] = await queryBuilder.getManyAndCount();

      return new PaginatedResponse(loans, total, page, limit);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findByUserId(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Loan>> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    try {
      const { page = 1, limit = 10 } = paginationDto;

      const queryBuilder = this.loanRepository
        .createQueryBuilder('loan')
        .leftJoinAndSelect('loan.user', 'user')
        .leftJoinAndSelect('loan.book', 'book')
        .where('loan.userId = :userId', { userId })
        .orderBy('loan.createdAt', 'DESC');

      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [loans, total] = await queryBuilder.getManyAndCount();

      return new PaginatedResponse(loans, total, page, limit);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findActiveLoans(paginationDto: PaginationDto): Promise<PaginatedResponse<Loan>> {
    try {
      const { page = 1, limit = 10 } = paginationDto;

      const queryBuilder = this.loanRepository
        .createQueryBuilder('loan')
        .leftJoinAndSelect('loan.user', 'user')
        .leftJoinAndSelect('loan.book', 'book')
        .where('loan.status = :status', { status: LoanStatus.ACTIVE })
        .orderBy('loan.dueDate', 'ASC');

      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [loans, total] = await queryBuilder.getManyAndCount();

      return new PaginatedResponse(loans, total, page, limit);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOverdueLoans(paginationDto: PaginationDto): Promise<PaginatedResponse<Loan>> {
    try {
      // Actualizar préstamos vencidos primero
      await this.updateOverdueLoans();

      const { page = 1, limit = 10 } = paginationDto;

      const queryBuilder = this.loanRepository
        .createQueryBuilder('loan')
        .leftJoinAndSelect('loan.user', 'user')
        .leftJoinAndSelect('loan.book', 'book')
        .where('loan.status = :status', { status: LoanStatus.OVERDUE })
        .orderBy('loan.dueDate', 'ASC');

      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [loans, total] = await queryBuilder.getManyAndCount();

      return new PaginatedResponse(loans, total, page, limit);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async returnLoan(loanId: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['book'],
    });

    if (!loan) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    if (loan.status === LoanStatus.RETURNED) {
      throw new BadRequestException('Este préstamo ya fue devuelto');
    }

    try {
      // Marcar como devuelto
      loan.status = LoanStatus.RETURNED;
      loan.returnDate = new Date();

      // Incrementar copias disponibles del libro
      await this.bookRepository.update(loan.bookId, {
        availableCopies: loan.book.availableCopies + 1,
      });

      return await this.loanRepository.save(loan);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async renewLoan(loanId: string, additionalDays: number = 15): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException('Solo se pueden renovar préstamos activos');
    }

    try {
      // Extender fecha de vencimiento
      const newDueDate = new Date(loan.dueDate);
      newDueDate.setDate(newDueDate.getDate() + additionalDays);

      loan.dueDate = newDueDate;
      loan.status = LoanStatus.ACTIVE; // En caso de que estuviera vencido

      return await this.loanRepository.save(loan);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async getLoanStats(): Promise<any> {
    try {
      const totalLoans = await this.loanRepository.count();
      const activeLoans = await this.loanRepository.count({
        where: { status: LoanStatus.ACTIVE },
      });
      const overdueLoans = await this.loanRepository.count({
        where: { status: LoanStatus.OVERDUE },
      });
      const returnedLoans = await this.loanRepository.count({
        where: { status: LoanStatus.RETURNED },
      });

      return {
        totalLoans,
        activeLoans,
        overdueLoans,
        returnedLoans,
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private async updateOverdueLoans(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.loanRepository.update(
      {
        status: LoanStatus.ACTIVE,
        dueDate: LessThan(today),
      },
      { status: LoanStatus.OVERDUE },
    );
  }

  private handleDBErrors(error: any): never {
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }

    console.log(error);
    throw new InternalServerErrorException('Error interno del servidor');
  }
}
