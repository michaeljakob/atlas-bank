import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountEntity,
  CardEntity,
  TransactionEntity,
  UserEntity,
} from '@/database/entities';
import { DevSeederService } from './dev-seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AccountEntity,
      CardEntity,
      TransactionEntity,
    ]),
  ],
  providers: [DevSeederService],
})
export class DevSeederModule {}
