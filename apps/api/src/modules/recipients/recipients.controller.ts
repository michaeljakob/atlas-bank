import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { RecipientsService } from './recipients.service';

class CreateRecipientDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() iban: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() bank?: string;
  @IsOptional() @IsString() bic?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() notes?: string;
}

class UpdateRecipientDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsBoolean() isFavorite?: boolean;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() bank?: string;
  @IsOptional() @IsString() bic?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() notes?: string;
}

@ApiTags('recipients')
@ApiBearerAuth()
@Controller('recipients')
export class RecipientsController {
  constructor(private readonly recipients: RecipientsService) {}

  @Get()
  @ApiOperation({ summary: 'List saved recipients' })
  async list(@Req() req: any) {
    return this.recipients.list(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new recipient' })
  async create(@Req() req: any, @Body() dto: CreateRecipientDto) {
    return this.recipients.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipient' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateRecipientDto) {
    return this.recipients.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipient' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.recipients.remove(req.user.id, id);
  }
}
