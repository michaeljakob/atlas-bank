import { Controller, Post, Req, Headers, HttpCode, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { Public } from '@/common/guards/auth.guard';

@ApiTags('webhooks')
@Public()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post('swan')
  @HttpCode(200)
  @ApiOperation({ summary: 'Swan webhook endpoint' })
  async handleSwan(
    @Req() req: RawBodyRequest<any>,
    @Headers('x-swan-signature') signature: string,
  ) {
    const rawBody = req.rawBody?.toString() || JSON.stringify(req.body);
    await this.webhooks.handleSwanWebhook(rawBody, signature || '');
    return { received: true };
  }
}
