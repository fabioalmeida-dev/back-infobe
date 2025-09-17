import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User as UserEntity } from '../auth/entities/user.entity';

export const User = createParamDecorator(
  (data: keyof Pick<UserEntity, 'id'>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserEntity;

    return data ? user?.[data] : user;
  },
);
