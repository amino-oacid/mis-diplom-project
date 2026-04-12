import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { HashService } from '../hash/hash.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private hashService: HashService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['doctor'],
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { login },
      relations: ['doctor'],
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByLogin(dto.login);
    if (existing) {
      throw new ConflictException('Пользователь с таким логином уже существует');
    }

    const passwordHash = await this.hashService.hash(dto.password);

    const user = this.userRepository.create({
      login: dto.login,
      passwordHash,
      role: dto.role || UserRole.DOCTOR,
      lastName: dto.lastName,
      firstName: dto.firstName,
      middleName: dto.middleName || null,
      email: dto.email || null,
      phone: dto.phone || null,
      position: dto.position || null,
    });

    await this.userRepository.save(user);

    // Если роль — врач, создаём профиль врача
    if (user.role === UserRole.DOCTOR) {
      const doctor = this.doctorRepository.create({
        userId: user.id,
        specialization: dto.specialization || 'Не указана',
      });
      await this.doctorRepository.save(doctor);
    }

    return this.findOne(user.id);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (dto.login && dto.login !== user.login) {
      const existing = await this.findByLogin(dto.login);
      if (existing) {
        throw new ConflictException('Пользователь с таким логином уже существует');
      }
    }

    if (dto.password) {
      user.passwordHash = await this.hashService.hash(dto.password);
    }

    Object.assign(user, { 
      login: dto.login ?? user.login,
      role: dto.role ?? user.role,
      lastName: dto.lastName ?? user.lastName,
      firstName: dto.firstName ?? user.firstName,
      middleName: dto.middleName !== undefined ? dto.middleName : user.middleName,
      email: dto.email !== undefined ? dto.email : user.email,
      phone: dto.phone !== undefined ? dto.phone : user.phone,
      position: dto.position !== undefined ? dto.position : user.position,
    });

    await this.userRepository.save(user);

    // Обновляем специализацию врача если есть
    if (dto.specialization && user.doctor) {
      user.doctor.specialization = dto.specialization;
      await this.doctorRepository.save(user.doctor);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }
}
