import { createId } from '@paralleldrive/cuid2';
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 256 }).primaryKey().$defaultFn(createId),
  name: text('name'),
  email: text('email').unique(),
  password: text('password'),
});
