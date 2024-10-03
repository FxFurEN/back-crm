import { createId } from '@paralleldrive/cuid2';
import { numeric, pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER']);

export const users = pgTable('users', {
  id: varchar('id', { length: 256 }).primaryKey().$defaultFn(createId),
  name: text('name'),
  email: text('email').unique(),
  refreshToken: text('refresh_token').default(null),
  password: text('password'),
  role: userRoleEnum('role').default('USER'),
});

export const tasks = pgTable('tasks', {
  id: varchar('id', { length: 256 }).primaryKey().$defaultFn(createId),
  name: text('name'),
  categoryId: varchar('category_id', { length: 256 }).references(
    () => categories.id,
  ),
  price: numeric('price', { precision: 10, scale: 2 }),
});

export const categories = pgTable('categories', {
  id: varchar('id', { length: 256 }).primaryKey().$defaultFn(createId),
  name: text('name').unique(),
});
