import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для защиты маршрутов, требующих JWT аутентификации
 *
 * Проверяет наличие и валидность JWT токена в заголовке Authorization.
 * При успешной проверке добавляет данные пользователя в request.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
