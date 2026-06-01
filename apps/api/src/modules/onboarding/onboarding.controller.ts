import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OnboardingService } from './onboarding.service';

class AddressDto {
  @IsString() @IsNotEmpty() line1: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() postalCode: string;
  @IsString() @IsNotEmpty() country: string;
}

class StartOnboardingDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsString() @IsNotEmpty() dateOfBirth: string;
  @IsString() @IsNotEmpty() nationality: string;
  @IsString() @IsNotEmpty() residenceCountry: string;
  @ValidateNested() @Type(() => AddressDto) residenceAddress: AddressDto;
}

@ApiTags('onboarding')
@ApiBearerAuth()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start onboarding — submit personal details and trigger KYC' })
  async start(@Req() req: any, @Body() dto: StartOnboardingDto) {
    return this.onboarding.startOnboarding({
      userId: req.user?.id || 'dev-user',
      ...dto,
    });
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current onboarding status' })
  async status(@Req() req: any) {
    return this.onboarding.getStatus(req.user?.id || 'dev-user');
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete onboarding — create account + card after KYC approval' })
  async complete(@Req() req: any) {
    return this.onboarding.completeOnboarding(req.user?.id || 'dev-user');
  }
}
