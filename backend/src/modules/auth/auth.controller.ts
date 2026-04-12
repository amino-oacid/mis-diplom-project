import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest, UserRequest } from '../../common/types/request.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: UserRequest) {
    return {
      success: true,
      message: 'Успешный вход в систему',
      data: await this.authService.auth(req.user),
    };
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return {
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: await this.authService.register(dto),
    };
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return {
      success: true,
      message: 'Токены успешно обновлены',
      data: await this.authService.refreshTokens(dto.refreshToken),
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthenticatedRequest) {
    await this.authService.logout(req.user.userId);
    return {
      success: true,
      message: 'Успешный выход из системы',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.getCurrentUser(req.user.userId);
    return {
      success: true,
      data: {
        id: user.id,
        login: user.login,
        role: user.role,
        fullName: user.fullName,
        lastName: user.lastName,
        firstName: user.firstName,
        middleName: user.middleName,
        email: user.email,
        phone: user.phone,
        position: user.position,
        doctor: user.doctor
          ? {
              id: user.doctor.id,
              specialization: user.doctor.specialization,
              experienceYears: user.doctor.experienceYears,
              officeNumber: user.doctor.officeNumber,
            }
          : null,
      },
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    const user = await this.authService.updateProfile(req.user.userId, dto);
    return {
      success: true,
      message: 'Профиль успешно обновлён',
      data: {
        id: user.id,
        login: user.login,
        role: user.role,
        fullName: user.fullName,
        lastName: user.lastName,
        firstName: user.firstName,
        middleName: user.middleName,
        email: user.email,
        phone: user.phone,
        position: user.position,
      },
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(req.user.userId, dto);
    return {
      success: true,
      message: 'Пароль успешно изменён',
    };
  }
}
