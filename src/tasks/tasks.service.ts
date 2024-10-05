import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_CONNECTION } from 'src/database/db-connection';
import { TaskDto } from 'src/dtos/task.dto';
import * as schema from '../database/schema/schema';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async createTask(dto: TaskDto) {
    const categoryExists = await this.database
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, dto.categoryId))
      .execute();

    if (!categoryExists.length) {
      throw new NotFoundException('Category not found');
    }

    if (dto.price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    const taskExists = await this.database
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.name, dto.name))
      .execute();

    if (taskExists.length) {
      throw new ConflictException('Task with this name already exists');
    }

    const newTask = {
      ...dto,
    };

    await this.database.insert(schema.tasks).values(newTask).execute();

    return newTask;
  }

  async getTasks() {
    const tasks = await this.database.select().from(schema.tasks).execute();
    return tasks;
  }

  async getTaskById(taskId: string) {
    const task = await this.database
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, taskId))
      .execute();

    if (!task.length) {
      throw new NotFoundException('Task not found');
    }

    return task[0];
  }

  async updateTask(taskId: string, dto: { name?: string; price?: number }) {
    const updatedTask = await this.database
      .update(schema.tasks)
      .set(dto)
      .where(eq(schema.tasks.id, taskId))
      .returning()
      .execute();

    if (!updatedTask.length) {
      throw new NotFoundException('Task not found');
    }

    return updatedTask[0];
  }

  async deleteTask(taskId: string) {
    const task = await this.database
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, taskId))
      .returning()
      .execute();

    if (!task.length) {
      throw new NotFoundException('Task not found');
    }

    return { message: 'Task deleted successfully' };
  }
}
