import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../core/auth/current-user.decorator';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('me')
  getMyOnboarding(@CurrentUser() user: { sub: string }) {
    return this.onboardingService.get(user.sub);
  }

  @Get('interests')
  listInterests() {
    return this.onboardingService.listInterests();
  }

  @Put('me')
  updateMyOnboarding(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateOnboardingDto,
  ) {
    return this.onboardingService.update(user.sub, dto);
  }
}
