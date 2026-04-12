import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { HashService } from '../hash/hash.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as jwt from 'jsonwebtoken';

export interface TokenPayload {

  userId: number;
  login: string;
  role: string;
}

export interface AuthResponse {

  user: {
    id: number;
    login: string;
    role: string;
    fullName: string;
    position: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private hashService: HashService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(login: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByLogin(login);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.hashService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async auth(user: User): Promise<AuthResponse> {
    const tokens = this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        fullName: user.fullName,
        position: user.position,
      },
      ...tokens,
    };
  }

  async register(dto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
    const tokens = this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        fullName: user.fullName,
        position: user.position,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: TokenPayload;

    try {
      payload = jwt.verify(
        refreshToken,
        this.configService.get<string>('jwt.refreshSecret')!,
      ) as TokenPayload;
    } catch {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    const user = await this.usersService.findOne(payload.userId);

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Недействительный refresh token');
    }

    const tokens = this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async getCurrentUser(userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    const user = await this.usersService.findOne(userId);

    Object.assign(user, {
      lastName: dto.lastName ?? user.lastName,
      firstName: dto.firstName ?? user.firstName,
      middleName: dto.middleName !== undefined ? dto.middleName : user.middleName,
      email: dto.email !== undefined ? dto.email : user.email,
      phone: dto.phone !== undefined ? dto.phone : user.phone,
      position: dto.position !== undefined ? dto.position : user.position,
    });

    return this.usersService.update(userId, user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findOne(userId);

    const isCurrentPasswordValid = await this.hashService.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Неверный текущий пароль');
    }

    await this.usersService.update(userId, { password: dto.newPassword });
    await this.usersService.updateRefreshToken(userId, null);
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload: TokenPayload = {
      userId: user.id,
      login: user.login,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = jwt.sign(
      payload,
      this.configService.get<string>('jwt.refreshSecret')!,
      { expiresIn: this.configService.get('jwt.refreshExpiresIn') || '7d' } as jwt.SignOptions,
    );

    return { accessToken, refreshToken };
  }
}
