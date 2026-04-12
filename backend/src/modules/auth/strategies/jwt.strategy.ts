import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { TokenPayload } from '../auth.service';

/**
 * Стратегия JWT аутентификации
 *
 * Используется для валидации JWT токенов в защищённых маршрутах.
 * Извлекает токен из заголовка Authorization (Bearer token).
 *
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.usersService.findByLogin(payload.login);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      userId: payload.userId,
      login: payload.login,
      role: payload.role,
    };
  }
}
