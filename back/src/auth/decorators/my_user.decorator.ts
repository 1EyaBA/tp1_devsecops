import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MyUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.log('User not found in request');
    }

    return user;
  },
);
