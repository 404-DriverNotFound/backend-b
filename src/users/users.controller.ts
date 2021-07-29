import { Controller, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthenticatedGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id')
  updateUserById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUserById(id, updateUserDto);
  }

  @ApiOperation({ summary: '유저 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '유저 없음' })
  @Get(':id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.getUserById(id);
  }
}
