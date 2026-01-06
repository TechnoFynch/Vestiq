import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import UserTypeEnum from 'src/auth/enums/user-type.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user.role !== UserTypeEnum.ADMIN) {
      throw new ForbiddenException(
        "You're not authorized to perform this action",
      );
    }

    return true;
  }
}
