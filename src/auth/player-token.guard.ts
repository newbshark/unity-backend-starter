import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

export const ACTIVE_PLAYER_TOKENS = new Map<string, string>();

@Injectable()
export class PlayerTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = String(req.headers['x-player-token'] || '').trim();

    if (!token) {
      throw new UnauthorizedException('Нет заголовка x-player-token (401)');
    }

    const owner = ACTIVE_PLAYER_TOKENS.get(token);
    if (!owner) {
      throw new ForbiddenException('Поддельный или просроченный токен (403)');
    }

    req.authPlayer = owner;
    return true;
  }
}
