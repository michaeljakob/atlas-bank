import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { PaymentsService } from './payments.service';

class InitiateTransferDto {
  @IsString() @IsNotEmpty() creditorIban: string;
  @IsString() @IsNotEmpty() creditorName: string;
  @IsNumber() @Min(1) amountCents: number;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsBoolean() instant?: boolean;
}

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Initiate a SEPA credit transfer (requires SCA consent)' })
  async initiateTransfer(@Req() req: any, @Body() dto: InitiateTransferDto) {
    return this.payments.initiateTransfer(req.user?.id || 'dev-user', dto);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Check payment/consent status' })
  async getStatus(@Param('id') id: string) {
    return this.payments.getPaymentStatus(id);
  }
}
