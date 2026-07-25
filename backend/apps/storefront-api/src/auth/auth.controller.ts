import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { VerifyDto } from './dto/verify.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserAuthGuard, OptionalUserAuthGuard } from '@app/common';
import { CurrentUser } from '@app/common';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new customer account' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify email with token (from email link)' })
  async verify(
    @Body() dto: VerifyDto,
  ) {
    const user = await this.authService.getUserFromToken(dto.token);
    if (user) {
      return {
        __typename: 'CurrentUser',
        id: user.id,
        identifier: user.email,
      };
    }
    return { __typename: 'Success', success: true };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.set('vendure-auth-token', result.token);
    return {
      id: result.user.id,
      identifier: result.user.identifier,
    };
  }

  @Post('logout')
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  async logout() {
    return this.authService.logout();
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.resetPassword(dto);
    if (result.token) {
      res.set('vendure-auth-token', result.token);
    }
    return {
      id: result.user.id,
      identifier: result.user.identifier,
    };
  }

  @Post('change-password')
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (needs current password)' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @Post('change-email')
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request email change' })
  async changeEmail(
    @CurrentUser() user: any,
    @Body() dto: ChangeEmailDto,
  ) {
    return this.authService.changeEmail(user.id, dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Confirm email change with token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmailChange(dto.token);
  }

  @Get('me')
  @UseGuards(OptionalUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser() user?: any) {
    if (!user?.id) return null;
    return this.authService.getMe(user.id);
  }
}
