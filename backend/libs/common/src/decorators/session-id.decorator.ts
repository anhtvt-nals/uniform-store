import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const SessionId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-session-id'] || request.headers['session-id'];
  },
);
