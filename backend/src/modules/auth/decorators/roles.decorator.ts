import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Декоратор для указания требуемых ролей доступа к маршруту
 *
 * Используется совместно с RolesGuard для ограничения доступа
 * на основе роли пользователя.
 *
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
