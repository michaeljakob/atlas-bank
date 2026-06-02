import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipientEntity } from '@/database/entities';
import { RecipientsController } from './recipients.controller';
import { RecipientsService } from './recipients.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecipientEntity])],
  controllers: [RecipientsController],
  providers: [RecipientsService],
  exports: [RecipientsService],
})
export class RecipientsModule {}
