import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SafeUser } from './types/safe-user.type';
import { PrismaService } from 'src/prisma.service';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { idUser: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Tokenn or user is inactive');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
