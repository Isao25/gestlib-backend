import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BookStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
}

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  isbn: string;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'date' })
  publishedDate: Date;

  @Column({ type: 'int', default: 1 })
  totalCopies: number;

  @Column({ type: 'int', default: 1 })
  availableCopies: number;

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.AVAILABLE
  })
  status: BookStatus;

}
