import { Injectable } from '@nestjs/common';
import { ProductQueryDto } from '../products/dto/product-query.dto';

@Injectable()
export class SearchService {
  search(query: ProductQueryDto) {
    return { message: 'not implemented' };
  }
}
