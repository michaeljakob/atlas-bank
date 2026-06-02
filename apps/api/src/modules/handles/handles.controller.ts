import { Controller, Get, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { HandlesService } from './handles.service';
import { Public } from '@/common/guards/auth.guard';

class ClaimHandleDto {
  @IsString() @IsNotEmpty() handle: string;
}

@ApiTags('handles')
@Controller('handles')
export class HandlesController {
  constructor(private readonly handles: HandlesService) {}

  @Public()
  @Get('availability')
  @ApiOperation({ summary: 'Check whether a payment handle is valid and available' })
  async availability(@Query('handle') handle: string) {
    return this.handles.checkAvailability(handle ?? '');
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current user payment handle' })
  async getMine(@Req() req: any) {
    return this.handles.getMyHandle(req.user?.id || 'dev-user');
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim or change the current user payment handle' })
  async claim(@Req() req: any, @Body() dto: ClaimHandleDto) {
    return this.handles.claim(req.user?.id || 'dev-user', dto.handle);
  }

  @Get(':handle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve a payment handle to payable account details' })
  async resolve(@Param('handle') handle: string) {
    return this.handles.resolve(handle);
  }
}
