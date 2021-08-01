import { Controller, Get, Patch, Post } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getUsers() {
    //
  }

  @Get('me')
  getUserByRequestUser() {
    //
  }

  @Get(':uuid')
  getUserById() {
    //
  }

  @Post()
  createUser() {
    //
  }

  @Patch()
  updateUser() {
    //
  }
}
