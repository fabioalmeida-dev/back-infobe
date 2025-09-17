import {ExecutionContext, Inject, Injectable, UnauthorizedException,} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';
import {IS_PUBLIC_KEY} from '../public.decorator';
import {AUTH_REPOSITORY, type AuthRepository} from '../auth.interface';

@Injectable()
export class AuthenticateGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(AUTH_REPOSITORY) private repository: AuthRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const canActivate = (await super.canActivate(context)) as boolean;

      if (canActivate && request.user?.id) {
        return true;
      }
    } catch {}

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    throw new UnauthorizedException();
  }
}
