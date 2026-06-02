import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentRequestsService } from './payment-requests.service';
import { Public } from '@/common/guards/auth.guard';

class CreatePaymentRequestDto {
  @IsNumber() @Min(1) amountCents: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() recipientEmail?: string;
  @IsOptional() @IsString() note?: string;
}

@ApiTags('payment-requests')
@Controller('payment-requests')
export class PaymentRequestsController {
  constructor(private readonly paymentRequests: PaymentRequestsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List payment requests' })
  async list(@Req() req: any) {
    return this.paymentRequests.list(req.user.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment request' })
  async create(@Req() req: any, @Body() dto: CreatePaymentRequestDto) {
    return this.paymentRequests.create(req.user.id, dto);
  }

  @Public()
  @Get('pay/:token')
  @ApiOperation({ summary: 'Get payment request by token (public)' })
  async getByToken(@Param('token') token: string) {
    const request = await this.paymentRequests.getByToken(token);
    return {
      id: request.id,
      amountCents: request.amountCents,
      currency: request.currency,
      note: request.note,
      status: request.status,
      requesterName: `${request.user.firstName} ${request.user.lastName}`,
      requesterHandle: request.user.handle ?? null,
      expiresAt: request.expiresAt,
    };
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a payment request' })
  async cancel(@Req() req: any, @Param('id') id: string) {
    return this.paymentRequests.cancel(req.user.id, id);
  }
}
