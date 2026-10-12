import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const user = gqlCtx.getContext().req.user;
    
    if (!user) {
      console.log('User not found in request');
    }
    
    return user;
  },
);