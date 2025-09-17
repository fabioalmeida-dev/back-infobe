import {CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable,} from '@nestjs/common';
import {AUTH_REPOSITORY, type AuthRepository} from '../auth.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(AUTH_REPOSITORY) private repository: AuthRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const isAdmin = await this.repository.adminExistsById(user.id);

    if (!isAdmin) {
      throw new ForbiddenException(
        'Only administrators can access this resource',
      );
    }

    return true;
  }
}
