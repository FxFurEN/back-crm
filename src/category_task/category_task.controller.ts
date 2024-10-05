import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CategoryDto } from 'src/dtos/category_task.dto';
import { CategoryTaskService } from './category_task.service';

@Controller('category-task')
export class CategoryTaskController {
  constructor(private readonly categoriesService: CategoryTaskService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCategory(@Body() dto: CategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCategoryById(@Param('id') categoryId: string) {
    return this.categoriesService.getCategoryById(categoryId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCategory(
    @Param('id') categoryId: string,
    @Body('name') name: string,
  ) {
    return this.categoriesService.updateCategory(categoryId, name);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteCategory(@Param('id') categoryId: string) {
    return this.categoriesService.deleteCategory(categoryId);
  }
}
