import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_CONNECTION } from 'src/database/db-connection';
import * as schema from '../database/schema/schema';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async create(dto: UserDto) {
    const user = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))
      .execute();

    if (user.length > 0) {
      throw new ConflictException('email already use!');
    }
    const newUser = {
      ...dto,
      password: await hash(dto.password, 10),
    };

    await this.database.insert(schema.users).values(newUser).execute();

    const { ...result } = newUser;
    return result;
  }

  async getUsers() {
    const users = await this.database.select().from(schema.users);
    return users.map(({ password, ...rest }) => rest);
  }

  async getUser(query: { email?: string; userId?: string }) {
    const userQuery = this.database.select().from(schema.users);

    if (query.email) {
      userQuery.where(eq(schema.users.email, query.email));
    }

    if (query.userId) {
      userQuery.where(eq(schema.users.id, query.userId));
    }

    const user = await userQuery.execute();

    if (!user.length) throw new NotFoundException('User not found');

    return user[0];
  }
}
