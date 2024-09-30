import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ChangePasswordDto } from 'src/dtos/change-password.dto';
import { UserDto } from 'src/dtos/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: UserDto) {
    await this.usersService.create(request);
  }

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

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.id;
    const { currentPassword, newPassword } = changePasswordDto;
    return this.usersService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );
  }
}
