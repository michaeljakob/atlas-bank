import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CardsService } from './cards.service';

class ProvisionWalletDto {
  @IsIn(['apple_pay', 'google_pay'])
  walletType: 'apple_pay' | 'google_pay';
}

@ApiTags('cards')
@ApiBearerAuth()
@Controller('cards')
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'List all cards for current user' })
  async list(@Req() req: any) {
    return this.cards.getCards(req.user?.id || 'dev-user');
  }

  @Post(':id/freeze')
  @ApiOperation({ summary: 'Freeze a card' })
  async freeze(@Req() req: any, @Param('id') id: string) {
    return this.cards.freezeCard(req.user?.id || 'dev-user', id);
  }

  @Post(':id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze a card' })
  async unfreeze(@Req() req: any, @Param('id') id: string) {
    return this.cards.unfreezeCard(req.user?.id || 'dev-user', id);
  }

  @Get(':id/secure-details')
  @ApiOperation({ summary: 'Get secure card details URL (tokenised)' })
  async secureDetails(@Req() req: any, @Param('id') id: string) {
    return this.cards.getSecureDetails(req.user?.id || 'dev-user', id);
  }

  @Post(':id/wallet')
  @ApiOperation({ summary: 'Get wallet provisioning data for Apple/Google Pay' })
  async provisionWallet(@Req() req: any, @Param('id') id: string, @Body() dto: ProvisionWalletDto) {
    return this.cards.provisionWallet(req.user?.id || 'dev-user', id, dto.walletType);
  }

  @Post('physical')
  @ApiOperation({ summary: 'Order a physical card' })
  async orderPhysical(@Req() req: any) {
    return this.cards.orderPhysicalCard(req.user?.id || 'dev-user');
  }
}
