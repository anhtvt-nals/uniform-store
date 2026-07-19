import {
  Controller,
  Post,
  Body,
  Headers,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ShopApiService } from './shop-api.service';

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

@ApiTags('Shop API (GraphQL Proxy)')
@Controller()
export class ShopApiController {
  constructor(private readonly shopApiService: ShopApiService) {}

  @Post('shop-api')
  @ApiOperation({
    summary: 'GraphQL compatibility endpoint — accepts any Vendure Shop API query/mutation',
  })
  async handleGraphQL(
    @Body() body: GraphQLRequest,
    @Res() res: Response,
    @Headers('authorization') auth?: string,
    @Headers('vendure-token') channelToken?: string,
    @Query('languageCode') languageCode?: string,
    @Query('currencyCode') currencyCode?: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    const result = await this.shopApiService.execute(
      body.query,
      body.variables || {},
      { token, languageCode, currencyCode, channelToken },
    );

    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        res.set(key, value);
      }
    }

    res.json({ data: result.data });
  }
}
