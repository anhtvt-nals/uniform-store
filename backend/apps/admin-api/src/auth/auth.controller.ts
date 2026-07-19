import { Controller, Post, Get, Body, Headers, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminAuthGuard, CurrentUser } from '@app/common';

@ApiTags('Admin Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login with email and password' })
  login(@Body() dto: AdminLoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh expired admin token' })
  refresh(@Headers('authorization') auth: string) {
    if (!auth) throw new UnauthorizedException('No token provided');
    const token = auth.replace('Bearer ', '');
    return this.authService.refresh(token);
  }

  @Post('logout')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate admin session' })
  logout() {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  getProfile(@CurrentUser('admin') admin: any) {
    return this.authService.getProfile(admin);
  }
}
