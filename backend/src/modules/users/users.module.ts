import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { HashModule } from '../hash/hash.module';

@Module({
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User, Doctor]),
    HashModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
