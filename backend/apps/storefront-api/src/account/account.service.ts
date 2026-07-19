import { Injectable } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddressDto } from '../checkout/dto/address.dto';

@Injectable()
export class AccountService {
  getProfile() {
    return { message: 'not implemented' };
  }

  updateProfile(dto: UpdateProfileDto) {
    return { message: 'not implemented' };
  }

  getAddresses() {
    return { message: 'not implemented' };
  }

  addAddress(dto: AddressDto) {
    return { message: 'not implemented' };
  }

  updateAddress(id: string, dto: AddressDto) {
    return { message: 'not implemented' };
  }

  removeAddress(id: string) {
    return { message: 'not implemented' };
  }
}
