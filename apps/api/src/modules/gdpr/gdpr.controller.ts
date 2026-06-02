import { Controller, Get, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GdprService } from './gdpr.service';

@ApiTags('gdpr')
@ApiBearerAuth()
@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdpr: GdprService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export all personal data (GDPR Art. 20)' })
  async export(@Req() req: any) {
    return this.gdpr.exportData(req.user?.id || 'dev-user');
  }

  @Delete('account')
  @ApiOperation({ summary: 'Close and erase the account (GDPR Art. 17)' })
  async deleteAccount(@Req() req: any) {
    return this.gdpr.deleteAccount(req.user?.id || 'dev-user');
  }
}
