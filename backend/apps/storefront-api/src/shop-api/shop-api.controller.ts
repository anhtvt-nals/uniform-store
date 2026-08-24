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
import { StorageUrlInterceptor } from '@app/shared';
import { ShopApiService } from './shop-api.service';

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

@ApiTags('Shop API (GraphQL Proxy)')
@Controller()
export class ShopApiController {
  constructor(
    private readonly shopApiService: ShopApiService,
    private readonly storageUrlInterceptor: StorageUrlInterceptor,
  ) {}

  @Post('shop-api')
  @ApiOperation({
    summary: 'GraphQL compatibility endpoint — accepts any Vendure Shop API query/mutation',
  })
  async handleGraphQL(
    @Body() body: GraphQLRequest,
    @Res() res: Response,
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionId?: string,
    @Headers('vendure-token') channelToken?: string,
    @Query('languageCode') languageCode?: string,
    @Query('currencyCode') currencyCode?: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    const result = await this.shopApiService.execute(
      body.query,
      body.variables || {},
      { token, sessionId, languageCode, currencyCode, channelToken },
    );

    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        res.set(key, value);
      }
    }

    // @Res() takes over the response, so the global StorageUrlInterceptor never
    // sees this payload. Apply it manually or storage keys reach the browser as
    // relative paths and resolve against the storefront origin (404).
    // Cannot use @Res({ passthrough: true }) here: TransformInterceptor would
    // then wrap the body in { success, data } and break the GraphQL contract.
    res.json({ data: this.storageUrlInterceptor.transformUrls(result.data) });
  }
}
