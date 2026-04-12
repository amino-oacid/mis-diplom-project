import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * Стратегия локальной аутентификации (логин/пароль)
 *
 * Используется для валидации учётных данных при входе в систему.
 * Поля формы: login (вместо стандартного username) и password.
 *
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'login',
      passwordField: 'password',
    });
  }

  async validate(login: string, password: string) {
    const user = await this.authService.validateUser(login, password);

    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    return user;
  }
}
