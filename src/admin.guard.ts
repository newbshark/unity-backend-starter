import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredKey = (process.env.ADMIN_KEY || '').trim();
    // Если ADMIN_KEY не задан (например, ученик запустил код локально дома), не мешаем разработке.
    if (!requiredKey) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const headerKey = String(req.headers['x-admin-key'] || '').trim();
    const queryKey = String(req.query?.adminKey || '').trim();

    if (headerKey === requiredKey || queryKey === requiredKey) {
      return true;
    }

    throw new ForbiddenException('Требуется ключ учителя (x-admin-key)');
  }
}
