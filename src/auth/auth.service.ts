import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { createHmac, randomBytes } from 'crypto';
import { Response } from 'express';
import { UserDto } from 'src/dtos/user.dto';
import { RedisService } from 'src/redis/redis.service';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(user: UserDto, response: Response) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    await this.usersService.updateUser(
      { id: user.id },
      { refreshToken: await hash(refreshToken, 10) },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });
  }

  async register(userDto: UserDto, invitationToken: string) {
    const tokenData = await this.redisService.getToken(invitationToken);

    if (!tokenData || tokenData.purpose !== 'invitation') {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    const createdUser = await this.usersService.createUser(userDto);
    await this.redisService.deleteToken(invitationToken);

    return createdUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.getUser({ userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordMatching = await compare(currentPassword, user.password);
    if (!isPasswordMatching) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await hash(newPassword, 10);

    await this.usersService.updateUser(
      { id: userId },
      { password: hashedPassword },
    );

    return { message: 'Password successfully changed' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.getUser({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    await this.redisService.setToken(token, email, 'forgot_password', 15 * 60);
    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenData = await this.redisService.getToken(token);
    if (!tokenData || tokenData.purpose !== 'forgot_password') {
      throw new NotFoundException('Invalid or expired token');
    }

    const user = await this.usersService.getUser({ email: tokenData.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await hash(newPassword, 10);
    await this.usersService.updateUser(
      { id: user.id },
      { password: hashedPassword },
    );
    await this.redisService.deleteToken(token);
    return { message: 'Password successfully reset' };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async veryifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.getUser({ userId: userId });
      const authenticated = await compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }

  async generateInvitation(adminId: string) {
    const admin = await this.usersService.getUser({ userId: adminId });
    const timestamp = Date.now().toString();
    const data = `${admin.email}-${timestamp}`;

    const secret = this.configService.get<string>('INVITATION_TOKEN_SECRET');
    const invitationToken = createHmac('sha256', secret)
      .update(data)
      .digest('hex');

    const oldToken = await this.redisService.getTokenByEmail(admin.email);
    if (oldToken) {
      await this.redisService.deleteToken(oldToken);
    }

    await this.redisService.setToken(
      invitationToken,
      admin.email,
      'invitation',
      24 * 60 * 60,
    );

    const baseUrl = this.configService.get<string>('BASE_URL');
    return `${baseUrl}/auth/register?invitation=${invitationToken}&timestamp=${timestamp}`;
  }
}
