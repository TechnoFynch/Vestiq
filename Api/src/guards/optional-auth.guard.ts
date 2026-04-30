import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) return true; // no token → skip passport entirely, just let it through
    return super.canActivate(context); // token present → run normal JWT validation
  }

  handleRequest(err, user) {
    return user ?? null;
  }
}
