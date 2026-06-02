import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, AccountEntity } from '@/database/entities';
import { HandlesController } from './handles.controller';
import { HandlesService } from './handles.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AccountEntity])],
  controllers: [HandlesController],
  providers: [HandlesService],
  exports: [HandlesService],
})
export class HandlesModule {}
