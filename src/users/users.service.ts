import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email }
      });

      if (existingUser) {
        throw new BadRequestException('Ya existe un usuario con este email');
      }

      // Crear usuario con contraseña hasheada
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true
      });

      await this.userRepository.save(user);
      
      // Retornar usuario sin contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true, name: true, surname: true, role: true, isActive: true }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email "${email}" no encontrado`);
    }

    return user;
  }

  async findByEmailSafe(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true, name: true, surname: true, role: true, isActive: true }
    });
  }

  async findByRole(role: ValidRoles): Promise<User[]> {
    return await this.userRepository.find({
      where: { role, isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    try {
      // Si se actualiza el email, verificar que no exista otro usuario con ese email
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email }
        });

        if (existingUser) {
          throw new BadRequestException('Ya existe un usuario con este email');
        }
      }

      // Si se actualiza la contraseña, hashearla
      const updateData = { ...updateUserDto };
      if (updateUserDto.password) {
        updateData.password = bcrypt.hashSync(updateUserDto.password, 10);
      }

      await this.userRepository.update(id, updateData);
      return await this.findOne(id);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async changeUserStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findOne(id);

    await this.userRepository.update(id, { isActive });
    return await this.findOne(id);
  }

  async changeUserRole(id: string, role: ValidRoles): Promise<User> {
    const user = await this.findOne(id);

    await this.userRepository.update(id, { role });
    return await this.findOne(id);
  }

  async resetPassword(id: string, newPassword: string): Promise<User> {
    const user = await this.findOne(id);

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await this.userRepository.update(id, { password: hashedPassword });
    
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    try {
      await this.userRepository.remove(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }

    console.log(error);
    throw new InternalServerErrorException('Error interno del servidor');
  }
}
