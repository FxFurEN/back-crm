import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserRole(
    @Param('id') userId: string,
    @Body('role') newRole: Role,
    @Request() req,
  ) {
    const currentUserId = req.user.id;
    return this.usersService.updateUserRole(currentUserId, userId, newRole);
  }
}
