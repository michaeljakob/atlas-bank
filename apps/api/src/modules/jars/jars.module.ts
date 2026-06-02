import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JarEntity, AccountEntity } from '@/database/entities';
import { JarsController } from './jars.controller';
import { JarsService } from './jars.service';

@Module({
  imports: [TypeOrmModule.forFeature([JarEntity, AccountEntity])],
  controllers: [JarsController],
  providers: [JarsService],
  exports: [JarsService],
})
export class JarsModule {}
