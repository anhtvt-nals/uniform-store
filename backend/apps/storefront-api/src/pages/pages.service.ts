import { Injectable } from '@nestjs/common';

@Injectable()
export class PagesService {
  getBanners() {
    return { message: 'not implemented' };
  }

  getPublicSettings() {
    return { message: 'not implemented' };
  }

  getCountries() {
    return { message: 'not implemented' };
  }

  getChannel() {
    return { message: 'not implemented' };
  }
}
