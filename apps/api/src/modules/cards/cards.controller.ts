import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, IsOptional, IsBoolean, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CardsService } from './cards.service';

class ProvisionWalletDto {
  @IsIn(['apple_pay', 'google_pay'])
  walletType: 'apple_pay' | 'google_pay';
}

class RenameCardDto {
  @IsString()
  @MaxLength(40)
  name: string;
}

class UpdateCardDto {
  @IsOptional()
  @IsIn(['black', 'white', 'green'])
  color?: 'black' | 'white' | 'green';

  @IsOptional()
  @IsString()
  @MaxLength(40)
  name?: string;

  @IsOptional()
  @IsBoolean()
  onlineEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  contactlessEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  atmEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  internationalEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  limitCents?: number;
}

class DeliveryAddressDto {
  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;
}

class OrderPhysicalCardDto {
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;
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

  @Get(':id/transactions')
  @ApiOperation({ summary: 'List transactions for a single card' })
  async transactions(
    @Req() req: any,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cards.getCardTransactions(
      req.user?.id || 'dev-user',
      id,
      cursor,
      limit ? parseInt(limit, 10) : 25,
    );
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

  @Patch(':id/name')
  @ApiOperation({ summary: 'Rename a card' })
  async rename(@Req() req: any, @Param('id') id: string, @Body() dto: RenameCardDto) {
    return this.cards.renameCard(req.user?.id || 'dev-user', id, dto.name);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a card (colour, name, controls, limit)' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cards.updateCard(req.user?.id || 'dev-user', id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove / cancel a card' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.cards.deleteCard(req.user?.id || 'dev-user', id);
  }

  @Post('physical')
  @ApiOperation({ summary: 'Order a physical card' })
  async orderPhysical(@Req() req: any, @Body() dto: OrderPhysicalCardDto) {
    return this.cards.orderPhysicalCard(req.user?.id || 'dev-user', dto.deliveryAddress);
  }
}
