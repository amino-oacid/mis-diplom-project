import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  constructor(private configService: ConfigService) {}

  async hash(password: string): Promise<string> {
    try {
      const saltRounds = this.configService.get<number>('bcryptSaltRounds') || 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при хешировании пароля');
    }
  }

  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при проверке пароля');
    }
  }
}
