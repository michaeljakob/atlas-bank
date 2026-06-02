import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';
import { ConvertService } from './convert.service';

class ConvertDto {
  @IsString() from: string;
  @IsString() to: string;
  @IsNumber() @Min(1) amountCents: number;
}

@ApiTags('convert')
@ApiBearerAuth()
@Controller('convert')
export class ConvertController {
  constructor(private readonly convert: ConvertService) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get cached exchange rates' })
  async getRates() {
    return this.convert.getRates();
  }

  @Get('quote')
  @ApiOperation({ summary: 'Get a conversion quote' })
  async getQuote(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: string,
  ) {
    return this.convert.getQuote(from, to, parseInt(amount, 10));
  }

  @Post()
  @ApiOperation({ summary: 'Execute currency conversion' })
  async executeConvert(@Req() req: any, @Body() dto: ConvertDto) {
    return this.convert.convert(req.user.id, dto.from, dto.to, dto.amountCents);
  }
}
