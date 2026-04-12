import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для аутентификации по логину и паролю
 *
 * Использует LocalStrategy для проверки учётных данных.
 * Применяется на эндпоинте /auth/login
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
