import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { JarsService } from './jars.service';

class CreateJarDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() currency: string;
  @IsOptional() @IsString() emoji?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsInt() @Min(0) targetCents?: number;
  @IsOptional() @IsInt() @Min(0) initialDepositCents?: number;
}

class UpdateJarDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() emoji?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsInt() @Min(0) targetCents?: number;
}

class MoveJarDto {
  @IsInt() @Min(1) amountCents: number;
  @IsIn(['in', 'out']) direction: 'in' | 'out';
}

@ApiTags('jars')
@ApiBearerAuth()
@Controller('jars')
export class JarsController {
  constructor(private readonly jars: JarsService) {}

  @Get()
  @ApiOperation({ summary: 'List savings jars' })
  async list(@Req() req: any) {
    return this.jars.list(req.user?.id || 'dev-user');
  }

  @Post()
  @ApiOperation({ summary: 'Create a savings jar' })
  async create(@Req() req: any, @Body() dto: CreateJarDto) {
    return this.jars.create(req.user?.id || 'dev-user', dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a jar' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateJarDto) {
    return this.jars.update(req.user?.id || 'dev-user', id, dto);
  }

  @Post(':id/move')
  @ApiOperation({ summary: 'Move money between a jar and its hub account' })
  async move(@Req() req: any, @Param('id') id: string, @Body() dto: MoveJarDto) {
    return this.jars.move(req.user?.id || 'dev-user', id, dto.amountCents, dto.direction);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Close a jar and return funds to its hub account' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.jars.remove(req.user?.id || 'dev-user', id);
  }
}
