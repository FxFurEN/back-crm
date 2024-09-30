import { createId } from '@paralleldrive/cuid2';
import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER']);

export const users = pgTable('users', {
  id: varchar('id', { length: 256 }).primaryKey().$defaultFn(createId),
  name: text('name'),
  email: text('email').unique(),
  refreshToken: text('refresh_token').default(null),
  password: text('password'),
  role: userRoleEnum('role').default('USER'),
});
