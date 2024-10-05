import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_CONNECTION } from 'src/database/db-connection';
import { CategoryDto } from 'src/dtos/category_task.dto';
import * as schema from '../database/schema/schema';

@Injectable()
export class CategoryTaskService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async createCategory(dto: CategoryDto) {
    const existingCategory = await this.database
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.name, dto.name))
      .execute();

    if (existingCategory.length) {
      throw new ConflictException('Category with this name already exists');
    }

    const newCategory = {
      name: dto.name,
    };

    await this.database.insert(schema.categories).values(newCategory).execute();
    return newCategory;
  }

  async getCategories() {
    return this.database.select().from(schema.categories).execute();
  }

  async getCategoryById(categoryId: string) {
    const category = await this.database
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, categoryId))
      .execute();

    if (!category.length) {
      throw new NotFoundException('Category not found');
    }

    return category[0];
  }

  async updateCategory(categoryId: string, name: string) {
    const updatedCategory = await this.database
      .update(schema.categories)
      .set({ name })
      .where(eq(schema.categories.id, categoryId))
      .returning()
      .execute();

    if (!updatedCategory.length) {
      throw new NotFoundException('Category not found');
    }

    return updatedCategory[0];
  }

  async deleteCategory(categoryId: string) {
    const deletedCategory = await this.database
      .delete(schema.categories)
      .where(eq(schema.categories.id, categoryId))
      .returning()
      .execute();

    if (!deletedCategory.length) {
      throw new NotFoundException('Category not found');
    }

    return { message: 'Category deleted successfully' };
  }
}
