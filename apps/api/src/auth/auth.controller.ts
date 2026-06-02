import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import {
  ConfirmPasswordResetDto,
  RequestPasswordResetDto,
} from './dto/password-reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '@/common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email + password' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.me(user.id);
  }

  @Public()
  @Get('invite/:token')
  @ApiOperation({ summary: 'Look up a pending ally invite by token' })
  getInvite(@Param('token') token: string) {
    return this.auth.getInvite(token);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('invite/:token/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a password and activate an invited account' })
  acceptInvite(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.auth.acceptInvite(token, dto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.auth.requestPasswordReset(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('password-reset/:token/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password using a reset token' })
  confirmPasswordReset(
    @Param('token') token: string,
    @Body() dto: ConfirmPasswordResetDto
  ) {
    return this.auth.confirmPasswordReset(token, dto);
  }
}
