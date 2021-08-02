import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { FtGuard } from 'src/auth/guards/ft.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthenticatedGuard)
  getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  getUserByRequestUser(@GetUser() user: User): User {
    return user;
  }

  @Get(':uuid')
  @UseGuards(AuthenticatedGuard)
  getUserById(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<User> {
    return this.usersService.getUserById(uuid);
  }

  @Get(':name')
  @UseGuards(AuthenticatedGuard)
  getUserByName(@Param('name') name: string): Promise<User> {
    return this.usersService.getUserByName(name);
  }

  @Post()
  @UseGuards(FtGuard)
  createUser(
    @GetUser() user: User,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUser(user, createUserDto);
  }

  @Patch('me')
  @UseGuards(AuthenticatedGuard)
  updateUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(user, updateUserDto);
  }
}
