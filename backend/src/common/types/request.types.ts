import { Request } from 'express';
import { User } from '../../modules/users/entities/user.entity';

/**
 * Payload JWT токена (из JwtStrategy)
 */
export interface JwtPayload {
  userId: number;
  login: string;
  role: string;
}

/**
 * Request после JwtAuthGuard (user = JwtPayload)
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * Request после LocalAuthGuard (user = User entity)
 */
export interface UserRequest extends Request {
  user: User;
}
