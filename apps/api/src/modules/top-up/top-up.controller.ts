import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TopUpService } from './top-up.service';

class SimulateCreditDto {
  @IsInt()
  @Min(1)
  amountCents: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

@ApiTags('top-up')
@ApiBearerAuth()
@Controller('top-up')
export class TopUpController {
  constructor(private readonly topUp: TopUpService) {}

  @Get('instructions')
  @ApiOperation({ summary: 'Get bank-transfer funding instructions for the user accounts' })
  async instructions(@Req() req: any) {
    return this.topUp.getInstructions(req.user?.id || 'dev-user');
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Sandbox-only: simulate an incoming credit to fund the account' })
  async simulate(@Req() req: any, @Body() dto: SimulateCreditDto) {
    return this.topUp.simulateCredit(req.user?.id || 'dev-user', dto.amountCents, dto.currency);
  }
}
