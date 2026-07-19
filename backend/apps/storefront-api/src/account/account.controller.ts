import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddressDto } from '../checkout/dto/address.dto';

@ApiTags('Account')
@Controller('api/v1/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('profile')
  getProfile() {
    return this.accountService.getProfile();
  }

  @Patch('profile')
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.accountService.updateProfile(dto);
  }

  @Get('addresses')
  getAddresses() {
    return this.accountService.getAddresses();
  }

  @Post('addresses')
  addAddress(@Body() dto: AddressDto) {
    return this.accountService.addAddress(dto);
  }

  @Patch('addresses/:id')
  updateAddress(@Param('id') id: string, @Body() dto: AddressDto) {
    return this.accountService.updateAddress(id, dto);
  }

  @Delete('addresses/:id')
  removeAddress(@Param('id') id: string) {
    return this.accountService.removeAddress(id);
  }
}
