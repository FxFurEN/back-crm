import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Role } from 'src/auth/enums/role.enum';
import { DB_CONNECTION } from 'src/database/db-connection';
import { UserDto } from 'src/dtos/user.dto';
import * as schema from '../database/schema/schema';

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
    return users.map(({ password, refreshToken, ...rest }) => rest);
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

  async updateUser(query: Partial<UserDto>, data: Partial<UserDto>) {
    const user = await this.database
      .update(schema.users)
      .set(data)
      .where(eq(schema.users.id, query.id))
      .returning();

    if (!user.length) throw new NotFoundException('User not found');
    return user[0];
  }

  async updateUserRole(currentUserId: string, userId: string, newRole: Role) {
    if (currentUserId === userId) {
      throw new ForbiddenException('You cannot change your own role.');
    }

    const user = await this.database
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .execute();

    if (!user.length) {
      throw new NotFoundException('User not found');
    }

    await this.database
      .update(schema.users)
      .set({ role: newRole })
      .where(eq(schema.users.id, userId))
      .execute();

    return { message: `Role updated to ${newRole} for user with ID ${userId}` };
  }
}
