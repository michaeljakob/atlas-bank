import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminOnly } from '@/common/guards/admin.guard';

@ApiTags('admin')
@ApiBearerAuth()
@AdminOnly()
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'System-wide counts and totals (admin only)' })
  async overview() {
    return this.admin.getOverview();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with their roles (admin only)' })
  async users(@Query('limit') limit?: string) {
    return this.admin.listUsers(limit ? parseInt(limit, 10) : 50);
  }
}
