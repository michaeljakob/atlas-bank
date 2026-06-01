import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user account details' })
  async getAccount(@Req() req: any) {
    return this.accounts.getAccount(req.user?.id || 'dev-user');
  }

  @Get('me/balance')
  @ApiOperation({ summary: 'Get live account balance from provider' })
  async getBalance(@Req() req: any) {
    return this.accounts.getBalance(req.user?.id || 'dev-user');
  }

  @Get('me/transactions')
  @ApiOperation({ summary: 'List account transactions' })
  async getTransactions(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.accounts.getTransactions(
      req.user?.id || 'dev-user',
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
