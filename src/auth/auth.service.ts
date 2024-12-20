import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import { Request, Response } from 'express';
import { TokenType, User } from 'prisma/__generated__';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service';

@Injectable()
export class AuthService {
  public constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly prismaService: PrismaService,
  ) {}

  public async register(req: Request, dto: RegisterDto, inviteToken: string) {
    const tokenRecord = await this.prismaService.token.findFirst({
      where: {
        token: inviteToken,
        expiresIn: {
          gte: new Date(),
        },
        type: TokenType.INVITE,
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    const isExists = await this.userService.findByEmail(dto.email);
    if (isExists) {
      throw new ConflictException('Email is already exists');
    }

    const newUser = await this.userService.create(
      dto.email,
      dto.password,
      dto.name,
      false,
    );

    await this.prismaService.token.delete({
      where: {
        id: tokenRecord.id,
      },
    });

    await this.emailConfirmationService.sendVerificationToken(newUser.email);

    return {
      message:
        'Вы успешно зарегистрировались. Пожалуйста, подтвердите ваш email. Сообщение было отправлено на ваш почтовый адрес.',
    };
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new NotFoundException('Not found user');
    }

    const isValidPassword = await verify(user.password, dto.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Wrong Password');
    }

    if (!user.isVerified) {
      await this.emailConfirmationService.sendVerificationToken(user.email);
      throw new UnauthorizedException(
        'Ваш email не подтвержден. Пожалуйста, проверьте вашу почту и подтвердите адрес.',
      );
    }

    return this.saveSession(req, user);
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Could not complete the session. There may be a problem with the server or the session may have already been terminated.',
            ),
          );
        }
        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
        resolve();
      });
    });
  }

  public async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;

      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Не удалось сохранить сессию. Проверьте, правильно ли настроены параметры сессии.',
            ),
          );
        }

        resolve({
          user,
        });
      });
    });
  }
}
