import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, BookStatus } from '../books/entities/book.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BooksSeederService {
  private readonly logger = new Logger(BooksSeederService.name);

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async seedFromCSV(csvFilePath?: string): Promise<void> {
    try {
      // Verificar si ya existen libros
      const existingBooksCount = await this.bookRepository.count();
      if (existingBooksCount > 0) {
        this.logger.log(`✅ Ya existen ${existingBooksCount} libros en la base de datos`);
        return;
      }

      this.logger.log('📚 Iniciando seeding de libros desde CSV...');

      // Leer el archivo CSV
      const csvPath = csvFilePath || path.join(process.cwd(), 'src', 'database', 'data.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');

      // Parsear CSV
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');

      const books: Partial<Book>[] = [];

      for (let i = 1; i < lines.length && i <= 100; i++) {
        // Limitar a 100 libros para pruebas
        const values = this.parseCSVLine(lines[i]);

        if (values.length >= headers.length) {
          const totalCopies = Math.floor(Math.random() * 10) + 1; // Entre 1 y 10 copias
          const availableCopies = Math.floor(Math.random() * totalCopies) + 1; // Entre 1 y totalCopies

          const book: Partial<Book> = {
            title: this.cleanString(values[2]) || 'Título no disponible',
            description: this.cleanString(values[7]) || undefined,
            isbn: this.cleanString(values[0]) || this.generateRandomISBN(),
            author: this.cleanString(values[4]) || 'Autor desconocido',
            genre: this.cleanString(values[5]) || 'General',
            publishedDate: this.parseDate(values[8]),
            totalCopies,
            availableCopies,
            status: availableCopies > 0 ? BookStatus.AVAILABLE : BookStatus.BORROWED,
          };

          books.push(book);
        }
      }

      // Insertar libros en lotes
      const batchSize = 50;
      let inserted = 0;

      for (let i = 0; i < books.length; i += batchSize) {
        const batch = books.slice(i, i + batchSize);

        try {
          await this.bookRepository.save(batch);
          inserted += batch.length;
          this.logger.log(`📖 Insertados ${inserted}/${books.length} libros...`);
        } catch (error) {
          this.logger.error(`❌ Error insertando lote de libros: ${error.message}`);
          // Intentar insertar uno por uno en caso de error
          for (const book of batch) {
            try {
              await this.bookRepository.save(book);
              inserted++;
            } catch (individualError) {
              this.logger.warn(
                `⚠️ Error insertando libro "${book.title}": ${individualError.message}`,
              );
            }
          }
        }
      }

      this.logger.log(`✅ Seeding completado: ${inserted} libros insertados exitosamente`);
    } catch (error) {
      this.logger.error(`❌ Error en seeding de libros: ${error.message}`);
    }
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  }

  private cleanString(str: string): string | null {
    if (!str || str.trim() === '' || str.trim() === 'null' || str.trim() === 'undefined') {
      return null;
    }

    // Remover comillas al inicio y final si existen
    let cleaned = str.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }

    return cleaned.trim() || null;
  }

  private parseDate(dateStr: string): Date {
    const cleaned = this.cleanString(dateStr);
    if (!cleaned) {
      return new Date('2000-01-01'); // Fecha por defecto
    }

    // Intentar parsear el año
    const year = parseInt(cleaned);
    if (!isNaN(year) && year > 1000 && year <= new Date().getFullYear()) {
      return new Date(`${year}-01-01`);
    }

    // Si no es un año válido, usar fecha por defecto
    return new Date('2000-01-01');
  }

  private generateRandomISBN(): string {
    // Generar un ISBN-13 falso para pruebas
    const randomNum = Math.floor(Math.random() * 1000000000);
    return `978${randomNum.toString().padStart(10, '0')}`;
  }
}
