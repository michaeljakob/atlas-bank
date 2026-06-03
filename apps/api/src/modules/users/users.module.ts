import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, AccountEntity } from '@/database/entities';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AccountEntity])],
  controllers: [UsersController],
})
export class UsersModule {}
